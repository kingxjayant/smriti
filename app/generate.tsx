import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore, FREE_DAILY_GENERATIONS } from '../src/lib/store';
import { T, SUBJECT_COLORS } from '../src/lib/theme';
import { Card, Btn, Pill } from '../src/components/UI';
import { localGenerate, geminiGenerate, Draft } from '../src/lib/ai';

const SAMPLE = `Chlorophyll: the green pigment that absorbs light energy in plants
Stomata — tiny pores on the leaf surface that regulate gas exchange
Q: Where does the light reaction occur?
A: In the thylakoid membranes of the chloroplast
The Calvin cycle is the light-independent stage of photosynthesis.`;

export default function Generate() {
  const { deck } = useLocalSearchParams<{ deck?: string }>();
  const st = useStore();
  const ins = useSafeAreaInsets();

  const [text, setText] = useState('');
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [keep, setKeep] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [aiDown, setAiDown] = useState(false);

  const deckObj = st.ready ? st.decks.find((d) => d.id === deck) : null;

  async function run(useAI: boolean) {
    setErr('');
    if (text.trim().length < 25) {
      setErr('Paste a bit more text — at least a couple of lines.');
      return;
    }
    if (!st.isPro && st.generationsLeft() <= 0) {
      router.push('/paywall');
      return;
    }
    setBusy(true);
    try {
      const res = useAI
        ? await geminiGenerate(text, st.geminiKey, 30)
        : localGenerate(text, 40);
      if (!res.length) {
        setErr('Could not find any facts in that. Try notes with "term: definition" lines.');
      } else {
        st.recordGeneration();
        setDrafts(res);
        setKeep(new Set(res.map((_, i) => i)));
      }
    } catch (e: any) {
      if (useAI) {
        // Never show raw provider JSON — offer a friendly fallback + Retry.
        setAiDown(true);
      } else {
        setErr(e?.message ?? 'Something went wrong.');
      }
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!drafts || !deck) return;
    drafts.forEach((d, i) => keep.has(i) && st.addCard(deck, d.front, d.back));
    router.replace(`/deck/${deck}`);
  }

  function toggle(i: number) {
    setKeep((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }

  if (!st.ready) return null;

  // ---------- review step ----------
  if (drafts) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 18, paddingTop: ins.top + 12, paddingBottom: 110, gap: 12 }}
        >
          <Pressable onPress={() => setDrafts(null)} hitSlop={12}>
            <Text style={{ color: T.sub, fontSize: 15 }}>‹ Edit notes</Text>
          </Pressable>
          <Text style={s.title}>{drafts.length} cards found</Text>
          <Text style={s.sub}>
            Tap any card to exclude it. {keep.size} of {drafts.length} will be added to{' '}
            <Text style={{ color: T.text, fontWeight: '700' }}>{deckObj?.name}</Text>.
          </Text>

          {drafts.map((d, i) => {
            const on = keep.has(i);
            return (
              <Pressable key={i} onPress={() => toggle(i)}>
                <Card style={{ padding: 15, opacity: on ? 1 : 0.4, borderColor: on ? T.line : T.bg2 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={[s.check, on && { backgroundColor: T.accent, borderColor: T.accent }]}>
                      {on && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.q}>{d.front}</Text>
                      <Text style={s.a}>{d.back}</Text>
                      <View style={{ marginTop: 8 }}>
                        <Pill
                          text={d.source === 'ai' ? 'AI' : d.source === 'cloze' ? 'fill-in-blank' : 'definition'}
                          color={d.source === 'ai' ? T.accent2 : d.source === 'cloze' ? T.warn : T.good}
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[s.footer, { paddingBottom: ins.bottom + 14 }]}>
          <Btn label={keep.size ? `Add ${keep.size} cards` : 'Select at least one'} onPress={save} disabled={!keep.size} />
        </View>
      </View>
    );
  }

  // ---------- input step ----------
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: ins.top + 12, paddingBottom: 40, gap: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ color: T.sub, fontSize: 15 }}>‹ Back</Text>
        </Pressable>

        <Text style={s.title}>Notes → cards</Text>
        <Text style={s.sub}>
          Paste your class notes, a textbook paragraph, or a chapter summary. Smriti pulls out the
          examinable facts and turns each one into a flashcard.
        </Text>

        <TextInput
          placeholder={'Paste notes here…\n\nWorks best with lines like:\nTerm: definition\nQ: question\nA: answer'}
          placeholderTextColor={T.dim}
          value={text}
          onChangeText={setText}
          style={s.input}
          multiline
          textAlignVertical="top"
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pressable onPress={() => setText(SAMPLE)}>
            <Text style={{ color: T.accent, fontSize: 13, fontWeight: '600' }}>Use sample notes</Text>
          </Pressable>
          <Text style={{ color: T.dim, fontSize: 12 }}>
            {st.isPro
              ? `${text.length} chars`
              : `${st.generationsLeft()} of ${FREE_DAILY_GENERATIONS} left today`}
          </Text>
        </View>

        {!!err && (
          <Card style={{ borderColor: T.bad + '66', backgroundColor: '#2A1620', padding: 14 }}>
            <Text style={{ color: T.bad, fontSize: 13.5, lineHeight: 19 }}>{err}</Text>
          </Card>
        )}

        {busy ? (
          <Card style={{ alignItems: 'center', paddingVertical: 26, gap: 10 }}>
            <ActivityIndicator color={T.accent} />
            <Text style={{ color: T.sub, fontSize: 13 }}>Reading your notes…</Text>
          </Card>
        ) : (
          <>
            <Btn label="Generate cards — offline" onPress={() => run(false)} />
            <Text style={s.note}>
              Runs entirely on your phone. No internet, no account, no cost — works in airplane mode.
            </Text>

            <View style={s.divider} />

            {st.geminiKey ? (
              <>
                <Btn label="✨ Generate with AI" variant="soft" onPress={() => run(true)} />
                <Text style={s.note}>
                  Uses Gemini for better phrasing on messy prose. Needs internet.
                </Text>
              </>
            ) : (
              <Pressable onPress={() => router.push('/settings')}>
                <Card style={{ padding: 15, borderColor: T.accent2 + '44' }}>
                  <Text style={{ color: T.accent2, fontWeight: '700', fontSize: 14 }}>
                    ✨ Want sharper cards from messy prose?
                  </Text>
                  <Text style={{ color: T.sub, fontSize: 12.5, marginTop: 4, lineHeight: 18 }}>
                    Add a free Gemini API key in Settings to enable AI generation. Optional — the
                    offline engine above needs nothing.
                  </Text>
                </Card>
              </Pressable>
            )}
          </>
        )}

        {aiDown && (
          <Card style={{ borderColor: T.warn + '55', backgroundColor: '#2A2410', padding: 14, gap: 10 }}>
            <Text style={{ color: T.warn, fontSize: 13.5, lineHeight: 19, fontWeight: '700' }}>
              AI is temporarily unavailable. Offline generation is ready.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Btn label="Retry" onPress={() => run(true)} />
              </View>
              <View style={{ flex: 1 }}>
                <Btn label="Use offline" variant="ghost" onPress={() => run(false)} />
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  title: { color: T.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  sub: { color: T.sub, fontSize: 13.5, lineHeight: 20 },
  input: {
    backgroundColor: T.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.line,
    color: T.text,
    padding: 15,
    fontSize: 14.5,
    minHeight: 200,
    lineHeight: 21,
  },
  note: { color: T.dim, fontSize: 11.5, textAlign: 'center', lineHeight: 17, marginTop: -4 },
  divider: { height: 1, backgroundColor: T.line, marginVertical: 6 },
  q: { color: T.text, fontSize: 14.5, fontWeight: '600', lineHeight: 21 },
  a: { color: T.sub, fontSize: 13, marginTop: 5, lineHeight: 19 },
  check: {
    width: 22, height: 22, borderRadius: 7, borderWidth: 1.5,
    borderColor: T.dim, alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: 16, backgroundColor: T.bg2, borderTopWidth: 1, borderTopColor: T.line,
  },
});
