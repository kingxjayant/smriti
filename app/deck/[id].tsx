import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../src/lib/store';
import { T, SUBJECT_COLORS } from '../../src/lib/theme';
import { Card, Btn, Bar, Pill } from '../../src/components/UI';
import { retention } from '../../src/lib/srs';

export default function Deck() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const st = useStore();
  const ins = useSafeAreaInsets();
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState('');
  const [b, setB] = useState('');

  if (!st.ready) return null;
  const deck = st.decks.find((d) => d.id === id);
  if (!deck) return null;
  const cards = st.cards.filter((c) => c.deckId === id);
  const dueN = cards.filter((c) => c.due <= Date.now()).length;
  const col = SUBJECT_COLORS[deck.subject] ?? T.accent;

  function save() {
    if (!f.trim() || !b.trim()) return;
    st.addCard(id!, f.trim(), b.trim());
    setF('');
    setB('');
    setAdding(false);
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingTop: ins.top + 12, paddingBottom: 40, gap: 13 }}
    >
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={{ color: T.sub, fontSize: 15 }}>‹ Back</Text>
      </Pressable>

      <View style={{ marginTop: 6 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <Pill text={deck.subject} color={col} />
          <Pill text={deck.exam} color={T.sub} />
        </View>
        <Text style={s.title}>{deck.name}</Text>
        <Text style={s.meta}>
          {cards.length} cards · {dueN} due · {cards.filter((c) => c.reps > 0).length} learned
        </Text>
      </View>

      <Btn
        label="✨ Generate cards from notes"
        variant="soft"
        onPress={() => router.push(`/generate?deck=${id}`)}
      />

      <Btn
        label={dueN ? `Review ${dueN} due cards` : 'Nothing due — practise anyway'}
        onPress={() => router.push(dueN ? `/review?deck=${id}` : `/review?deck=${id}`)}
        variant={dueN ? 'primary' : 'soft'}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Text style={s.section}>Cards</Text>
        <Pressable onPress={() => setAdding((a) => !a)}>
          <Text style={{ color: T.accent, fontWeight: '700' }}>{adding ? 'Cancel' : '+ Add card'}</Text>
        </Pressable>
      </View>

      {adding && (
        <Card style={{ gap: 10 }}>
          <TextInput
            placeholder="Question / front"
            placeholderTextColor={T.dim}
            value={f}
            onChangeText={setF}
            style={s.input}
            multiline
          />
          <TextInput
            placeholder="Answer / back"
            placeholderTextColor={T.dim}
            value={b}
            onChangeText={setB}
            style={[s.input, { minHeight: 76 }]}
            multiline
          />
          <Btn label="Save card" onPress={save} />
        </Card>
      )}

      {cards.map((c) => {
        const ret = Math.round(retention(c) * 100);
        return (
          <Card key={c.id} style={{ padding: 15 }}>
            <Text style={s.cf}>{c.front}</Text>
            <Text style={s.cb} numberOfLines={2}>
              {c.back}
            </Text>
            <View style={{ height: 10 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Bar pct={ret} color={ret > 60 ? T.good : ret > 25 ? T.warn : T.bad} />
              </View>
              <Text style={{ color: T.dim, fontSize: 11 }}>
                {c.reps === 0 ? 'new' : `${ret}% · ${c.interval}d`}
              </Text>
            </View>
          </Card>
        );
      })}

      <Pressable
        onPress={() => {
          st.deleteDeck(id!);
          router.replace('/');
        }}
        style={{ marginTop: 16 }}
      >
        <Text style={{ color: T.bad, textAlign: 'center', fontSize: 13 }}>Delete deck</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title: { color: T.text, fontSize: 25, fontWeight: '800', letterSpacing: -0.4 },
  meta: { color: T.dim, fontSize: 12.5, marginTop: 4 },
  section: { color: T.text, fontSize: 17, fontWeight: '800' },
  cf: { color: T.text, fontSize: 14.5, fontWeight: '600', lineHeight: 21 },
  cb: { color: T.sub, fontSize: 13, marginTop: 5, lineHeight: 19 },
  input: {
    backgroundColor: T.bg2,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: T.line,
    color: T.text,
    padding: 13,
    fontSize: 14.5,
    minHeight: 50,
  },
});
