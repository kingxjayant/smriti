import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore } from '../src/lib/store';
import { T } from '../src/lib/theme';
import { Btn } from '../src/components/UI';
import { getOfferings, purchasePackage, restorePurchases, Pkg } from '../src/lib/purchases';

const PERKS = [
  ['🤖', 'Unlimited card generation', 'Paste a whole chapter and get a deck in seconds. Free plan generates 3 times a day.'],
  ['♾️', 'Unlimited decks & daily reviews', 'Free plan caps you at 3 decks and 30 reviews a day.'],
  ['📊', 'Exam analytics', 'Per-topic weak-spot maps and a live Exam Day Forecast.'],
  ['☁️', 'Cross-device sync', 'Revise on your phone, add cards on the web.'],
  ['🌙', 'Offline forever', 'Full syllabus works with zero data — built for Indian networks.'],
];

export default function Paywall() {
  const st = useStore();
  const ins = useSafeAreaInsets();
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [sel, setSel] = useState('annual');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getOfferings().then(setPkgs);
  }, []);

  async function buy() {
    setBusy(true);
    try {
      const res = await purchasePackage(sel);
      if (res.pro) {
        st.setPro(true);
        router.back();
      }
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    setBusy(true);
    const ok = await restorePurchases();
    st.setPro(ok);
    setBusy(false);
    if (ok) router.back();
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.bg }}
      contentContainerStyle={{ padding: 22, paddingTop: ins.top + 18, paddingBottom: ins.bottom + 30, gap: 16 }}
    >
      <Pressable onPress={() => router.back()} hitSlop={14} style={{ alignSelf: 'flex-end' }}>
        <Text style={{ color: T.dim, fontSize: 24 }}>✕</Text>
      </Pressable>

      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 44 }}>⚡</Text>
        <Text style={s.title}>Smriti Pro</Text>
        <Text style={s.sub}>
          Everything you need to walk into the exam hall knowing you&apos;ll remember it.
        </Text>
      </View>

      <View style={{ gap: 12, marginTop: 6 }}>
        {PERKS.map(([e, t, d]) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 18, width: 24 }}>{e}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.perkT}>{t}</Text>
              <Text style={s.perkD}>{d}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ gap: 10, marginTop: 8 }}>
        {pkgs.length === 0 && <ActivityIndicator color={T.accent} />}
        {pkgs.map((p) => {
          const on = sel === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSel(p.id)}
              style={[s.pkg, on && { borderColor: T.accent, backgroundColor: T.accent + '18' }]}
            >
              <View style={[s.radio, on && { borderColor: T.accent, backgroundColor: T.accent }]} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={s.pkgT}>{p.title}</Text>
                  {!!p.badge && (
                    <View style={s.badge}>
                      <Text style={{ color: T.bg, fontSize: 9.5, fontWeight: '900' }}>{p.badge}</Text>
                    </View>
                  )}
                </View>
                {!!p.save && <Text style={{ color: T.good, fontSize: 12, marginTop: 2 }}>{p.save}</Text>}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.price}>{p.price}</Text>
                <Text style={{ color: T.dim, fontSize: 11 }}>{p.period}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Btn label={busy ? 'Processing…' : 'Continue'} onPress={buy} disabled={busy || !pkgs.length} />
      <Pressable onPress={restore}>
        <Text style={s.restore}>Restore purchases</Text>
      </Pressable>
      <Text style={s.legal}>
        Purchases are handled by RevenueCat. Cancel anytime in your store account. Students: email us your ID for
        50% off.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title: { color: T.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.6 },
  sub: { color: T.sub, fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: 10 },
  perkT: { color: T.text, fontSize: 14.5, fontWeight: '700' },
  perkD: { color: T.dim, fontSize: 12.5, marginTop: 2, lineHeight: 18 },
  pkg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 16,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: T.line,
    backgroundColor: T.card,
  },
  radio: { width: 20, height: 20, borderRadius: 99, borderWidth: 2, borderColor: T.dim },
  pkgT: { color: T.text, fontSize: 15.5, fontWeight: '700' },
  badge: { backgroundColor: T.gold, paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 6 },
  price: { color: T.text, fontSize: 17, fontWeight: '800' },
  restore: { color: T.sub, fontSize: 13, textAlign: 'center', textDecorationLine: 'underline' },
  legal: { color: T.dim, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
