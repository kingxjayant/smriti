import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore, FREE_DAILY_LIMIT } from '../src/lib/store';
import { T } from '../src/lib/theme';
import { Grade } from '../src/lib/srs';
import { Btn, Bar } from '../src/components/UI';

const GRADES: { grade: Grade; label: string; hint: string; color: string }[] = [
  { grade: 'forgot', label: 'Forgot', hint: 'reset · 1 day', color: T.bad },
  { grade: 'struggled', label: 'Struggled', hint: 'review soon', color: T.warn },
  { grade: 'mastered', label: 'Mastered', hint: 'boosted', color: T.good },
];

export default function Review() {
  const { deck } = useLocalSearchParams<{ deck?: string }>();
  const st = useStore();
  const ins = useSafeAreaInsets();
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [start] = useState(Date.now());
  const flip = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const queue = st.ready ? st.dueCards(deck) : [];
  const card = queue[0];

  useEffect(() => {
    Animated.timing(flip, {
      toValue: flipped ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [flipped]);

  const limited = !st.isPro && done >= FREE_DAILY_LIMIT;

  function rate(g: Grade) {
    Animated.sequence([
      Animated.timing(slide, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    st.rate(card.id, g);
    setDone((d) => d + 1);
    setFlipped(false);
  }

  if (!st.ready) return null;

  if (limited)
    return (
      <Wrap ins={ins}>
        <Text style={{ fontSize: 46 }}>⚡</Text>
        <Text style={s.bigTitle}>Daily limit reached</Text>
        <Text style={s.body}>
          You&apos;ve reviewed {FREE_DAILY_LIMIT} cards today — that&apos;s the free plan limit. Research shows
          consistency beats cramming, but with an exam coming up you probably want more.
        </Text>
        <Btn label="Unlock unlimited reviews" onPress={() => router.replace('/paywall')} style={{ alignSelf: 'stretch' }} />
        <Btn label="Come back tomorrow" variant="ghost" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
      </Wrap>
    );

  if (!card)
    return (
      <Wrap ins={ins}>
        <Text style={{ fontSize: 52 }}>🎉</Text>
        <Text style={s.bigTitle}>Session complete</Text>
        <Text style={s.body}>
          {done} cards reviewed in {Math.max(1, Math.round((Date.now() - start) / 1000))}s. Your forecast just went
          up — come back when the next batch is due.
        </Text>
        <Btn label="Back to home" onPress={() => router.replace('/')} style={{ alignSelf: 'stretch' }} />
      </Wrap>
    );

  const frontStyle = {
    opacity: flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] }),
    transform: [{ rotateX: flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }],
  };
  const backStyle = {
    opacity: flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] }),
    transform: [{ rotateX: flip.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] }) }],
  };

  const total = queue.length + done;

  return (
    <View style={{ flex: 1, paddingTop: ins.top + 12, paddingBottom: ins.bottom + 16, paddingHorizontal: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ color: T.sub, fontSize: 26 }}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Bar pct={(done / Math.max(1, total)) * 100} />
        </View>
        <Text style={{ color: T.dim, fontSize: 13, fontWeight: '700' }}>
          {done}/{total}
        </Text>
      </View>

      <Pressable style={{ flex: 1 }} onPress={() => setFlipped((f) => !f)}>
        <Animated.View
          style={{
            flex: 1,
            transform: [{ scale: slide.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }) }],
            opacity: slide.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }),
          }}
        >
          <View style={s.stage}>
            <Animated.View style={[s.face, frontStyle]}>
              <ScrollView contentContainerStyle={s.faceInner}>
                <Text style={s.tag}>QUESTION</Text>
                <Text style={s.q}>{card.front}</Text>
              </ScrollView>
              <Text style={s.tapHint}>tap to reveal</Text>
            </Animated.View>

            <Animated.View style={[s.face, s.faceBack, backStyle]}>
              <ScrollView contentContainerStyle={s.faceInner}>
                <Text style={[s.tag, { color: T.accent2 }]}>ANSWER</Text>
                <Text style={s.a}>{card.back}</Text>
              </ScrollView>
            </Animated.View>
          </View>
        </Animated.View>
      </Pressable>

      <View style={{ height: 16 }} />

      {flipped ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {GRADES.map((x) => (
            <Pressable
              key={x.grade}
              onPress={() => rate(x.grade)}
              style={({ pressed }) => [
                s.rate,
                { borderColor: x.color + '66', backgroundColor: x.color + '16' },
                pressed && { backgroundColor: x.color + '30', transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={{ color: x.color, fontWeight: '800', fontSize: 15 }}>{x.label}</Text>
              <Text style={[s.rateHint, { color: x.color + 'C0' }]}>{x.hint}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Btn label="Show answer" onPress={() => setFlipped(true)} />
      )}
    </View>
  );
}

function Wrap({ children, ins }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14, paddingTop: ins.top }}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  stage: { flex: 1 },
  face: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: T.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: T.line,
    padding: 24,
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
  },
  faceBack: { backgroundColor: T.cardHi, borderColor: T.accent + '55' },
  faceInner: { flexGrow: 1, justifyContent: 'center' },
  tag: { color: T.dim, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 14, textAlign: 'center' },
  q: { color: T.text, fontSize: 23, fontWeight: '700', textAlign: 'center', lineHeight: 32 },
  a: { color: T.text, fontSize: 17.5, textAlign: 'center', lineHeight: 27 },
  tapHint: { color: T.dim, fontSize: 11.5, textAlign: 'center', marginTop: 12 },
  rate: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    gap: 3,
  },
  rateHint: { fontSize: 11, fontWeight: '600', opacity: 0.9 },
  bigTitle: { color: T.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  body: { color: T.sub, fontSize: 14.5, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
});
