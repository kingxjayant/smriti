/**
 * Smriti SRS engine — a compact SM-2 variant tuned for exam cramming.
 *
 * Review outcomes are intentionally simple (three, not Anki's four):
 *   - 'forgot'     → interval reset to 1 day
 *   - 'struggled'  → moderate interval multiplier
 *   - 'mastered'   → full retention boost
 */

export type Grade = 'forgot' | 'struggled' | 'mastered';

export type Card = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  ease: number;      // 1.3 .. 3.0
  interval: number;  // days
  reps: number;
  lapses: number;
  due: number;       // epoch ms
  createdAt: number;
  /** Optional topic label used by the settings heatmap. Older cards may not have one. */
  topic?: string;
};

export const DAY = 86400000;

export function newCard(deckId: string, front: string, back: string, topic?: string): Card {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    deckId,
    front,
    back,
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    due: Date.now(),
    createdAt: Date.now(),
    ...(topic ? { topic } : {}),
  };
}

export function review(card: Card, grade: Grade, now = Date.now()): Card {
  let { ease, interval, reps, lapses } = card;

  // Forgot — reset the interval to a single day and let the card cool down.
  if (grade === 'forgot') {
    lapses += 1;
    reps = 0;
    ease = Math.max(1.3, ease - 0.2);
    interval = 1;
    return { ...card, ease, interval, reps, lapses, due: now + interval * DAY };
  }

  reps += 1;

  if (grade === 'mastered') {
    // Full retention boost: nudge ease up so future intervals grow faster.
    ease = Math.min(3.0, ease + 0.15);
  } else {
    // Struggled: a small ease penalty keeps the schedule honest.
    ease = Math.max(1.3, ease - 0.05);
  }

  if (reps === 1) {
    interval = grade === 'mastered' ? 6 : 2;
  } else {
    // 'struggled' applies a moderate multiplier; 'mastered' a full boost.
    const multiplier = grade === 'mastered' ? 1.4 : 0.8;
    interval = Math.round(interval * ease * multiplier);
  }

  interval = Math.max(1, Math.min(interval, 365));
  return { ...card, ease, interval, reps, lapses, due: now + interval * DAY };
}

export function isDue(c: Card, now = Date.now()) {
  return c.due <= now;
}

export function retention(c: Card, now = Date.now()) {
  if (c.reps === 0) return 0;
  const elapsed = (now - (c.due - c.interval * DAY)) / DAY;
  const stability = Math.max(0.5, c.interval);
  return Math.max(0, Math.min(1, Math.exp(-elapsed / (stability * 1.8))));
}

/** Predicts % of syllabus you'll retain on exam day — the "Exam Day Forecast". */
export function forecast(cards: Card[], examDate: number) {
  if (!cards.length) return 0;
  const total = cards.reduce((s, c) => {
    if (c.reps === 0) return s;
    const daysOut = (examDate - Date.now()) / DAY;
    const stability = Math.max(0.5, c.interval);
    return s + Math.max(0, Math.min(1, Math.exp(-daysOut / (stability * 2.2 + 1))));
  }, 0);
  return Math.round((total / cards.length) * 100);
}
