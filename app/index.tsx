import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../src/lib/store';
import { forecast, DAY } from '../src/lib/srs';
import { T, SUBJECT_COLORS } from '../src/lib/theme';
import { Card, Btn, Ring, Pill, Bar } from '../src/components/UI';

export default function Home() {
  const st = useStore();
  const ins = useSafeAreaInsets();

  const due = st.ready ? st.dueCards() : [];
  const fc = useMemo(() => (st.ready ? forecast(st.cards, st.examDate) : 0), [st.cards, st.examDate, st.ready]);
  const daysLeft = Math.max(0, Math.ceil((st.examDate - Date.now()) / DAY));

  if (!st.ready)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: T.dim }}>Loading Smriti…</Text>
      </View>
    );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingTop: ins.top + 14, paddingBottom: 40, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <View>
          <Text style={s.hi}>स्मृति · Smriti</Text>
          <Text style={s.sub}>Remember more. Study less.</Text>
        </View>
        <Pressable onPress={() => router.push('/settings')} style={s.streak}>
          <Text style={{ fontSize: 15 }}>🔥</Text>
          <Text style={s.streakN}>{st.stats.streak}</Text>
        </Pressable>
      </View>

      {/* Exam Day Forecast — the hero feature */}
      <Card style={{ alignItems: 'center', paddingVertical: 26 }}>
        <Text style={s.cardLabel}>EXAM DAY FORECAST</Text>
        <View style={{ height: 14 }} />
        <Ring pct={fc} sub="predicted recall" />
        <View style={{ height: 14 }} />
        <Text style={s.forecastText}>
          If you keep this pace, you&apos;ll retain{' '}
          <Text style={{ color: T.accent2, fontWeight: '800' }}>{fc}%</Text> of your syllabus in{' '}
          <Text style={{ color: T.text, fontWeight: '700' }}>{daysLeft} days</Text>.
        </Text>
      </Card>

      <Pressable onPress={() => due.length && router.push('/review')}>
        <Card
          style={{
            backgroundColor: due.length ? T.accent : T.card,
            borderColor: due.length ? T.accent : T.line,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text style={[s.bigN, !due.length && { color: T.dim }]}>{due.length}</Text>
            <Text style={[s.bigL, !due.length && { color: T.dim }]}>
              {due.length ? 'cards due right now' : 'all caught up ✨'}
            </Text>
          </View>
          {!!due.length && <Text style={{ fontSize: 32 }}>→</Text>}
        </Card>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>
          <Text style={s.statN}>{st.stats.totalReviews}</Text>
          <Text style={s.statL}>reviews</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>
          <Text style={[s.statN, { color: T.gold }]}>{st.stats.xp}</Text>
          <Text style={s.statL}>XP</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>
          <Text style={[s.statN, { color: T.good }]}>{st.cards.length}</Text>
          <Text style={s.statL}>cards</Text>
        </Card>
      </View>

      {!st.isPro && (
        <Pressable onPress={() => router.push('/paywall')}>
          <Card style={{ borderColor: T.gold + '66', backgroundColor: '#241E10' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 22 }}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.gold, fontWeight: '800', fontSize: 15 }}>Smriti Pro</Text>
                <Text style={{ color: T.sub, fontSize: 12.5, marginTop: 2 }}>
                  Unlimited decks, AI card generation, exam analytics
                </Text>
              </View>
              <Text style={{ color: T.gold, fontSize: 18 }}>›</Text>
            </View>
          </Card>
        </Pressable>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <Text style={s.section}>Your decks</Text>
        <Pressable onPress={() => router.push('/new-deck')}>
          <Text style={{ color: T.accent, fontWeight: '700' }}>+ New</Text>
        </Pressable>
      </View>

      {st.decks.map((d) => {
        const cards = st.cards.filter((c) => c.deckId === d.id);
        const dueN = cards.filter((c) => c.due <= Date.now()).length;
        const learned = cards.filter((c) => c.reps > 0).length;
        const col = SUBJECT_COLORS[d.subject] ?? T.accent;
        return (
          <Pressable key={d.id} onPress={() => router.push(`/deck/${d.id}`)}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[s.dot, { backgroundColor: col }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.deckName}>{d.name}</Text>
                  <Text style={s.deckMeta}>
                    {d.subject} · {d.exam} · {cards.length} cards
                  </Text>
                </View>
                {dueN > 0 && <Pill text={`${dueN} due`} color={T.bad} />}
              </View>
              <View style={{ height: 12 }} />
              <Bar pct={cards.length ? (learned / cards.length) * 100 : 0} color={col} />
            </Card>
          </Pressable>
        );
      })}

      <Text style={s.foot}>Built for Shipaton 2026 · Next Gen Award</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  hi: { color: T.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: T.dim, fontSize: 13, marginTop: 2 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.line,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
  },
  streakN: { color: T.text, fontWeight: '800' },
  cardLabel: { color: T.dim, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  forecastText: { color: T.sub, fontSize: 13.5, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  bigN: { color: '#fff', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  bigL: { color: '#fff', fontSize: 14, opacity: 0.9, marginTop: -2 },
  statN: { color: T.text, fontSize: 22, fontWeight: '800' },
  statL: { color: T.dim, fontSize: 11.5, marginTop: 2 },
  section: { color: T.text, fontSize: 18, fontWeight: '800' },
  dot: { width: 12, height: 12, borderRadius: 99 },
  deckName: { color: T.text, fontSize: 15.5, fontWeight: '700' },
  deckMeta: { color: T.dim, fontSize: 12, marginTop: 3 },
  foot: { color: T.dim, fontSize: 11, textAlign: 'center', marginTop: 18 },
});
