import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../src/lib/store';
import { T } from '../src/lib/theme';
import { Card, Btn, Ring } from '../src/components/UI';
import { DAY, forecast } from '../src/lib/srs';

export default function Settings() {
  const st = useStore();
  const ins = useSafeAreaInsets();
  if (!st.ready) return null;
  const daysLeft = Math.max(0, Math.ceil((st.examDate - Date.now()) / DAY));

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingTop: ins.top + 12, gap: 14, paddingBottom: 40 }}
    >
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={{ color: T.sub, fontSize: 15 }}>‹ Back</Text>
      </Pressable>
      <Text style={s.title}>Your progress</Text>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <Ring pct={forecast(st.cards, st.examDate)} size={96} stroke={10} />
        <View style={{ flex: 1, gap: 6 }}>
          <Row k="Streak" v={`${st.stats.streak} days 🔥`} />
          <Row k="Total reviews" v={String(st.stats.totalReviews)} />
          <Row k="XP" v={String(st.stats.xp)} />
          <Row k="Plan" v={st.isPro ? 'Pro ⚡' : 'Free'} />
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <Text style={s.sec}>Exam date</Text>
        <Text style={{ color: T.sub, fontSize: 13.5 }}>
          {daysLeft} days away. Your forecast recalculates every review.
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[30, 60, 90, 180].map((d) => (
            <Pressable
              key={d}
              onPress={() => st.setExamDate(Date.now() + d * DAY)}
              style={[s.chip, Math.abs(daysLeft - d) < 2 && { borderColor: T.accent, backgroundColor: T.accent + '22' }]}
            >
              <Text style={{ color: Math.abs(daysLeft - d) < 2 ? T.accent : T.sub, fontWeight: '700', fontSize: 13 }}>
                {d}d
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {!st.isPro ? (
        <Btn label="⚡ Upgrade to Smriti Pro" onPress={() => router.push('/paywall')} />
      ) : (
        <Card style={{ borderColor: T.gold + '55' }}>
          <Text style={{ color: T.gold, fontWeight: '800' }}>Smriti Pro active ⚡</Text>
          <Text style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>Managed by RevenueCat. Thank you!</Text>
        </Card>
      )}

      <Pressable onPress={st.reset} style={{ marginTop: 20 }}>
        <Text style={{ color: T.bad, textAlign: 'center', fontSize: 13 }}>Reset all data</Text>
      </Pressable>
      <Text style={{ color: T.dim, fontSize: 11, textAlign: 'center' }}>
        Smriti v1.0 · offline-first · RevenueCat Shipaton 2026
      </Text>
    </ScrollView>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: T.dim, fontSize: 13.5 }}>{k}</Text>
      <Text style={{ color: T.text, fontSize: 13.5, fontWeight: '700' }}>{v}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  title: { color: T.text, fontSize: 27, fontWeight: '800' },
  sec: { color: T.text, fontSize: 16, fontWeight: '800' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.line,
    backgroundColor: T.bg2,
  },
});
