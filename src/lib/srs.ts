/**
 * Smriti SRS engine — a compact SM-2 variant tuned for exam cramming.
 * Rating: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
 */

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

export function review(card: Card, rating: 0 | 1 | 2 | 3, now = Date.now()): Card {
  let { ease, interval, reps, lapses } = card;

  if (rating === 0) {
    lapses += 1;
    reps = 0;
    ease = Math.max(1.3, ease - 0.2);
    interval = 0;
    return { ...card, ease, interval, reps, lapses, due: now + 60000 * 5 };
  }

  if (rating === 1) ease = Math.max(1.3, ease - 0.15);
  if (rating === 3) ease = Math.min(3.0, ease + 0.15);

  reps += 1;
  if (reps === 1) interval = rating === 3 ? 3 : 1;
  else if (reps === 2) interval = rating === 3 ? 7 : 3;
  else interval = Math.round(interval * ease * (rating === 1 ? 0.6 : rating === 3 ? 1.3 : 1));

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
