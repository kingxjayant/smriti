import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStore, FREE_DECK_LIMIT } from '../src/lib/store';
import { T, SUBJECT_COLORS } from '../src/lib/theme';
import { Btn, Card } from '../src/components/UI';

const SUBJECTS = Object.keys(SUBJECT_COLORS);
const EXAMS = ['JEE', 'NEET', 'UPSC', 'CAT', 'Board', 'Other'];

export default function NewDeck() {
  const st = useStore();
  const ins = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [exam, setExam] = useState('JEE');

  const blocked = !st.isPro && st.decks.length >= FREE_DECK_LIMIT + 2;

  function create() {
    if (blocked) return router.replace('/paywall');
    if (!name.trim()) return;
    const id = st.addDeck(name.trim(), subject, exam);
    router.replace(`/deck/${id}`);
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingTop: ins.top + 12, gap: 16, paddingBottom: 40 }}
    >
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={{ color: T.sub, fontSize: 15 }}>‹ Back</Text>
      </Pressable>
      <Text style={s.title}>New deck</Text>

      <TextInput
        placeholder="Deck name — e.g. Thermodynamics"
        placeholderTextColor={T.dim}
        value={name}
        onChangeText={setName}
        style={s.input}
      />

      <Text style={s.label}>SUBJECT</Text>
      <View style={s.wrap}>
        {SUBJECTS.map((x) => (
          <Chip key={x} label={x} on={subject === x} color={SUBJECT_COLORS[x]} onPress={() => setSubject(x)} />
        ))}
      </View>

      <Text style={s.label}>EXAM</Text>
      <View style={s.wrap}>
        {EXAMS.map((x) => (
          <Chip key={x} label={x} on={exam === x} color={T.accent} onPress={() => setExam(x)} />
        ))}
      </View>

      {blocked && (
        <Card style={{ borderColor: T.gold + '55', backgroundColor: '#241E10' }}>
          <Text style={{ color: T.gold, fontWeight: '700' }}>Free plan limit reached</Text>
          <Text style={{ color: T.sub, fontSize: 13, marginTop: 4, lineHeight: 19 }}>
            Upgrade to Smriti Pro for unlimited decks and AI-generated cards.
          </Text>
        </Card>
      )}

      <Btn label={blocked ? 'Upgrade to create more' : 'Create deck'} onPress={create} />
    </ScrollView>
  );
}

function Chip({ label, on, color, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.chip,
        on && { backgroundColor: color + '26', borderColor: color },
      ]}
    >
      <Text style={{ color: on ? color : T.sub, fontWeight: '700', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  title: { color: T.text, fontSize: 27, fontWeight: '800' },
  label: { color: T.dim, fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginTop: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.line,
    backgroundColor: T.card,
  },
  input: {
    backgroundColor: T.card,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: T.line,
    color: T.text,
    padding: 16,
    fontSize: 15.5,
  },
});
