import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, newCard, review as srsReview, isDue } from './srs';
import { SEED_DECKS } from './seed';
import { Language } from './i18n';

export type Deck = {
  id: string;
  name: string;
  subject: string;
  exam: string;
  premium?: boolean;
};

type Stats = { streak: number; lastStudy: string | null; totalReviews: number; xp: number };

/** Free users get a few generations a day — enough to feel the value, not enough to never pay. */
export const FREE_DAILY_GENERATIONS = 3;

type State = {
  decks: Deck[];
  cards: Card[];
  stats: Stats;
  isPro: boolean;
  examDate: number;
  geminiKey: string;
  language: Language;
  gens: { date: string; count: number };
  ready: boolean;
};

type Ctx = State & {
  dueCards: (deckId?: string) => Card[];
  rate: (id: string, r: 0 | 1 | 2 | 3) => void;
  addDeck: (name: string, subject: string, exam: string) => string;
  addCard: (deckId: string, front: string, back: string, topic?: string) => void;
  deleteDeck: (id: string) => void;
  setPro: (v: boolean) => void;
  setExamDate: (d: number) => void;
  setGeminiKey: (k: string) => void;
  setLanguage: (language: Language) => void;
  generationsLeft: () => number;
  recordGeneration: () => void;
  reset: () => void;
};

const C = createContext<Ctx>(null as any);
export const useStore = () => useContext(C);

const KEY = 'smriti.v1';
const FREE_DECK_LIMIT = 3;
export const FREE_DAILY_LIMIT = 30;

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<State>({
    decks: [],
    cards: [],
    stats: { streak: 0, lastStudy: null, totalReviews: 0, xp: 0 },
    isPro: false,
    examDate: Date.now() + 60 * 86400000,
    geminiKey: '',
    language: 'en',
    gens: { date: '', count: 0 },
    ready: false,
  });

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          setS((p) => ({
            ...p,
            ...saved,
            geminiKey: saved.geminiKey ?? '',
            language: saved.language === 'hi' ? 'hi' : 'en',
            gens: saved.gens ?? { date: '', count: 0 },
            ready: true,
          }));
          return;
        } catch {}
      }
      const decks: Deck[] = [];
      const cards: Card[] = [];
      SEED_DECKS.forEach((d, i) => {
        const id = `seed-${i}`;
        decks.push({ id, name: d.name, subject: d.subject, exam: d.exam });
        d.cards.forEach(([f, b]) => cards.push(newCard(id, f, b, d.name)));
      });
      setS((p) => ({ ...p, decks, cards, ready: true }));
    })();
  }, []);

  useEffect(() => {
    if (s.ready) AsyncStorage.setItem(KEY, JSON.stringify({ ...s, ready: undefined }));
  }, [s]);

  const api: Ctx = useMemo(
    () => ({
      ...s,
      dueCards: (deckId) =>
        s.cards.filter((c) => (!deckId || c.deckId === deckId) && isDue(c)),
      rate: (id, r) =>
        setS((p) => {
          const t = today();
          const cont = p.stats.lastStudy === new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          const streak =
            p.stats.lastStudy === t ? p.stats.streak : cont ? p.stats.streak + 1 : 1;
          return {
            ...p,
            cards: p.cards.map((c) => (c.id === id ? srsReview(c, r) : c)),
            stats: {
              streak,
              lastStudy: t,
              totalReviews: p.stats.totalReviews + 1,
              xp: p.stats.xp + (r === 0 ? 2 : r === 3 ? 12 : 8),
            },
          };
        }),
      addDeck: (name, subject, exam) => {
        const id = `d-${Date.now()}`;
        setS((p) => ({ ...p, decks: [...p.decks, { id, name, subject, exam }] }));
        return id;
      },
      addCard: (deckId, front, back, topic) =>
        setS((p) => {
          const deck = p.decks.find((d) => d.id === deckId);
          return { ...p, cards: [...p.cards, newCard(deckId, front, back, topic ?? deck?.name ?? deck?.subject)] };
        }),
      deleteDeck: (id) =>
        setS((p) => ({
          ...p,
          decks: p.decks.filter((d) => d.id !== id),
          cards: p.cards.filter((c) => c.deckId !== id),
        })),
      setPro: (v) => setS((p) => ({ ...p, isPro: v })),
      setExamDate: (d) => setS((p) => ({ ...p, examDate: d })),
      setGeminiKey: (k) => setS((p) => ({ ...p, geminiKey: k.trim() })),
      setLanguage: (language) => setS((p) => ({ ...p, language })),
      generationsLeft: () => {
        if (s.isPro) return Infinity;
        const used = s.gens.date === today() ? s.gens.count : 0;
        return Math.max(0, FREE_DAILY_GENERATIONS - used);
      },
      recordGeneration: () =>
        setS((p) => {
          const t = today();
          const used = p.gens.date === t ? p.gens.count : 0;
          return { ...p, gens: { date: t, count: used + 1 } };
        }),
      reset: () => {
        AsyncStorage.removeItem(KEY);
        setS((p) => ({ ...p, ready: false }));
      },
    }),
    [s]
  );

  return <C.Provider value={api}>{children}</C.Provider>;
}

export { FREE_DECK_LIMIT };
