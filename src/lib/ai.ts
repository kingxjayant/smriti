/**
 * Smriti card generation.
 *
 * Two engines, same interface:
 *  1. `localGenerate` — a deterministic, fully-offline parser. Zero cost, zero network,
 *     works on a ₹5,000 phone in airplane mode. This is the default.
 *  2. `geminiGenerate` — optional. If the user supplies a Gemini API key we get much
 *     better phrasing and can infer questions from prose.
 *
 * The local engine is not a toy: for the way Indian students actually keep notes
 * (bullet points, "term — definition", "Q: ... A: ...", numbered lists) it produces
 * usable cards, and it degrades gracefully into cloze deletions for plain prose.
 */

export type Draft = { front: string; back: string; source: 'rule' | 'cloze' | 'ai' };

const STOP = new Set([
  'the','a','an','is','are','was','were','be','been','of','to','in','on','for','and','or','but',
  'with','as','by','at','from','that','this','these','those','it','its','their','which','when',
  'has','have','had','can','will','also','not','than','then','such','into','using','used','use',
]);

function clean(s: string) {
  return s.replace(/\s+/g, ' ').replace(/^[\s\-–—•*\d.)\]]+/, '').trim();
}

function isHeading(l: string) {
  const t = clean(l);
  return t.length > 0 && t.length < 60 && !/[.?!]$/.test(t) && /^[A-Z0-9]/.test(t);
}

/** Pick the most "content-bearing" word in a sentence to blank out. */
function pickKeyword(s: string): string | null {
  const words = s.match(/[A-Za-z][A-Za-z'-]{3,}/g) || [];
  const cands = words.filter((w) => !STOP.has(w.toLowerCase()));
  if (!cands.length) return null;
  // Prefer capitalised mid-sentence terms (proper nouns / jargon), else longest word.
  const proper = cands.filter((w, i) => i > 0 && /^[A-Z]/.test(w));
  const pool = proper.length ? proper : cands;
  return pool.sort((a, b) => b.length - a.length)[0];
}

/** Keep answers tight — first sentence or two, not a whole paragraph. */
function trimAnswer(s: string, limit = 160): string {
  s = clean(s);
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=[.!?])\s+/);
  let acc = '';
  for (const p of parts) {
    if ((acc + ' ' + p).trim().length > limit) break;
    acc = (acc + ' ' + p).trim();
  }
  return acc || s.slice(0, limit).replace(/\s\S*$/, '') + '…';
}

export function localGenerate(text: string, max = 40): Draft[] {
  const out: Draft[] = [];
  const seen = new Set<string>();
  /** Lines already turned into a card — never reuse them for cloze. */
  const consumed = new Set<number>();

  const push = (front: string, back: string, source: Draft['source']) => {
    front = clean(front);
    back = clean(back);
    if (front.length < 6 || back.length < 2) return;
    if (front.length > 300 || back.length > 600) return;
    const k = front.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ front, back, source });
  };

  const lines = text.split(/\r?\n/);
  let heading = '';

  // Pass 1 — explicit structures.
  for (let i = 0; i < lines.length && out.length < max; i++) {
    const raw = lines[i];
    const line = clean(raw);
    if (!line) continue;

    // Q: ... / A: ...
    const q = line.match(/^Q[:.)]\s*(.+)/i);
    if (q) {
      const nxt = clean(lines[i + 1] || '');
      const a = nxt.match(/^A[:.)]\s*(.+)/i);
      if (a) {
        push(q[1], a[1], 'rule');
        consumed.add(i); consumed.add(i + 1);
        i++;
        continue;
      }
    }

    // term — definition   /   term: definition   /   term = definition
    const m = line.match(/^(.{2,80}?)\s*(?:—|–|--|:|=)\s+(.{4,})$/);
    if (m && !/^https?/i.test(m[1])) {
      const term = m[1];
      const def = m[2];
      // Avoid turning "Note:" style prefixes into cards.
      if (!/^(note|eg|e\.g|example|hint|tip|source|ref)$/i.test(term)) {
        const wordy = term.split(' ').length;
        if (wordy <= 12) {
          push(
            /\?$/.test(term) ? term : `${term}${/^(what|why|how|when|which|who)/i.test(term) ? '' : ' — define / explain'}`,
            trimAnswer(def),
            'rule'
          );
          consumed.add(i);
          continue;
        }
      }
    }

    // "X is/are/means Y"
    const isM = line.match(/^(.{3,70}?)\s+(?:is|are|means|refers to|is called|is known as)\s+(.{6,})[.]?$/i);
    if (isM && isM[1].split(' ').length <= 10) {
      push(`What is ${isM[1].replace(/^(the|a|an)\s+/i, '')}?`, trimAnswer(isM[2]), 'rule');
      consumed.add(i);
      continue;
    }

    if (isHeading(line)) heading = line;
  }

  // Pass 2 — cloze deletions, but ONLY from lines that pass 1 did not already use.
  // Without this guard the cloze pass re-reads structured lines and produces
  // run-on nonsense that spans several unrelated facts.
  if (out.length < max) {
    const leftover = lines
      .map((l, i) => (consumed.has(i) ? '' : l))
      .join('\n');

    const sentences = leftover
      .split(/\n|(?<=[.!?])\s+/)
      .map(clean)
      .filter(
        (s) =>
          s.length > 45 &&
          s.length < 200 &&
          /[a-z]/.test(s) &&
          !/^(q|a)[:.)]/i.test(s) &&
          !/[—–:=]\s/.test(s) &&
          s.split(' ').length > 7
      );

    for (const sent of sentences) {
      if (out.length >= max) break;
      const kw = pickKeyword(sent);
      if (!kw) continue;
      const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (!re.test(sent)) continue;
      const blanked = sent.replace(re, '_____');
      if (blanked === sent) continue;
      push(blanked, kw, 'cloze');
    }
  }

  return out.slice(0, max);
}

// Pin a supported Gemini model. Google returns 404 for the bare 'gemini-1.5-flash'
// id on v1beta, so we use the 'gemini-1.5-flash-latest' alias and fall back to
// 'gemini-pro' if the first model is unavailable. The base URL already contains
// the API version + '/models/', and each model name is appended exactly once.
const GEMINI_BASE = 'https://generativelanguage.googleapis.com';
const GEMINI_MODELS = ['gemini-1.5-flash-latest', 'gemini-pro'];

/**
 * Calls Gemini to turn notes into flashcards.
 *
 * Every failure path (HTTP error, network drop, timeout, malformed JSON) collapses
 * into one clean, user-facing message. The UI never renders raw provider JSON — it
 * shows "AI is temporarily unavailable. Offline generation is ready." with a Retry
 * control. The real error is logged for debugging only.
 */
export async function geminiGenerate(text: string, apiKey: string, max = 30): Promise<Draft[]> {
  const prompt = `You are helping an Indian competitive-exam student (JEE/NEET/UPSC) revise.
Turn the notes below into at most ${max} flashcards for spaced repetition.

Rules:
- One clear fact per card. Never bundle two ideas.
- Front = a specific question. Back = a short, complete answer (under 40 words).
- Prefer questions that test recall of mechanisms, values, and definitions.
- Keep any formulas exactly as written.
- Skip fluff, headings, and anything not examinable.

Return ONLY a JSON array, no markdown fence:
[{"front":"...","back":"..."}]

NOTES:
${text.slice(0, 12000)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    let lastError = 'AI generation failed: no model available.';
    for (const model of GEMINI_MODELS) {
      // Single '/models/' prefix, no duplication: BASE + '/v1beta/models/' + model.
      const url = `${GEMINI_BASE}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      console.log('[ai] Gemini request ->', model, '| key length:', apiKey?.length);

      let res: Awaited<ReturnType<typeof fetch>>;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
          }),
          signal: controller.signal,
        });
      } catch (fetchErr: any) {
        // Re-throw an abort so the outer handler reports a timeout.
        if (fetchErr?.name === 'AbortError') throw fetchErr;
        lastError = `AI generation failed: ${fetchErr?.message ?? 'network error'}`;
        console.error('[ai] Gemini fetch error for', model, fetchErr);
        continue;
      }

      if (!res.ok) {
        const status = res.status;
        const body = await res.text().catch(() => '');
        // Short, human-readable reason (never raw JSON) for the UI.
        let reason = `HTTP ${status}`;
        try {
          const parsed = JSON.parse(body);
          if (parsed?.error?.message) reason = `HTTP ${status}: ${parsed.error.message}`;
        } catch {
          if (body) reason = `HTTP ${status}: ${body.slice(0, 200)}`;
        }
        console.error('[ai] Gemini non-OK response', model, status, body);
        // 404 = model id not found — fall through to the next candidate.
        if (status === 404) {
          lastError = `AI request failed (${reason}).`;
          continue;
        }
        // Auth/quota/server errors are unlikely to differ per model — surface now.
        throw new Error(`AI request failed (${reason}).`);
      }

      const json = await res.json();
      const raw: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) {
        console.error('[ai] Gemini returned no JSON array. Raw response:', raw);
        lastError = 'AI returned no usable cards. Try different notes or the offline engine.';
        continue;
      }

      const arr = JSON.parse(match[0]) as { front?: string; back?: string }[];
      console.log('[ai] Gemini OK via', model, '->', arr.length, 'cards');
      return arr
        .filter((c) => c?.front && c?.back)
        .slice(0, max)
        .map((c) => ({ front: String(c.front).trim(), back: String(c.back).trim(), source: 'ai' as const }));
    }
    throw new Error(lastError);
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      console.error('[ai] Gemini request timed out after 20s');
      throw new Error('AI request timed out. Check your internet connection and retry.');
    }
    // Network failure or other — expose the real message so we can diagnose.
    console.error('[ai] geminiGenerate failed:', e);
    throw new Error(`AI generation failed: ${e?.message ?? 'unknown error'}`);
  } finally {
    clearTimeout(timer);
  }
}
