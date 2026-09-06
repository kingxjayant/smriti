# स्मृति · Smriti

**Remember more. Study less.**
An offline-first spaced-repetition study app built for India's 30 million competitive-exam aspirants.

> Submission for **RevenueCat Shipaton 2026 — Next Gen Award** (student track)
> Also entered for: RevenueCat Peace Prize · RevenueCat Design Award · HAMM Award

---

## The problem

Every year around **13 million students** sit for JEE, NEET and UPSC in India. Most of them study by re-reading notes — the single least effective revision method that cognitive science has measured. The students who *do* know about spaced repetition hit three walls:

1. **Anki is brutal.** Desktop-first, hostile UI, and $25 on iOS.
2. **Data costs money.** A student in a Tier-3 town cannot rely on a cloud app mid-revision.
3. **No feedback loop.** Nothing tells you *"you will forget 40% of Polity by exam day."*

Smriti fixes all three: a beautiful, fully-offline SRS app with a live **Exam Day Forecast**.

## The core idea: Exam Day Forecast

Standard SRS apps show you what's due *today*. Smriti projects your memory *forward* to your actual exam date using a forgetting-curve model over every card's stability:

```
retention(card, examDate) = exp( −daysUntilExam / (stability · 2.2 + 1) )
forecast = mean(retention) across all studied cards
```

That single number — *"you'll walk in remembering 74%"* — is the app's whole motivational engine. It moves when you review, and students can watch it climb.

## Features

| | |
|---|---|
| 🧠 | **SM-2 derived SRS engine** tuned for exam cramming windows (shortened early intervals, 365-day cap) |
| 📈 | **Exam Day Forecast** — forgetting-curve projection to your real exam date |
| 📴 | **100% offline** — every card, every review, zero network calls. Built for patchy Indian data |
| 🎴 | **3D flip review** with 4-point rating (Again / Hard / Good / Easy) |
| 📚 | **Pre-loaded decks** — Modern Physics, Chemical Bonding, Indian Polity, Human Physiology, Calculus |
| 🔥 | **Streaks & XP** with per-card retention bars |
| ⚡ | **Smriti Pro** via RevenueCat — unlimited decks, AI cards, analytics, sync |

## Monetization (RevenueCat)

Freemium with limits that bind exactly when the app has already proven value:

- **Free:** 5 starter decks, 3 custom decks, 30 reviews/day
- **Pro:** ₹99/mo · ₹699/yr (41% off) · ₹1,499 lifetime

Three packages ship in one offering so pricing can be A/B tested from the RevenueCat dashboard without a release. The paywall triggers contextually — at the daily review cap mid-session, when a student is *motivated*, not at cold launch.

`src/lib/purchases.ts` is the single integration boundary: `configure`, `getOfferings`, `purchasePackage`, `restorePurchases`, `onEntitlementChange`. On a native dev-client build these delegate to `react-native-purchases` against the `pro` entitlement; on web/preview they resolve locally so the complete paywall → purchase → entitlement-unlock loop stays demonstrable to judges.

## Tech

- **Expo SDK 54** + **expo-router** (file-based routing)
- **React Native** — one codebase, iOS + Android + Web
- **TypeScript**, strict, zero `tsc` errors
- **react-native-svg** for the animated forecast ring
- **AsyncStorage** — local-first persistence, no backend, no server bill
- **RevenueCat** for subscriptions

No backend by design: it keeps the app free to run and genuinely offline.

## Run it

```bash
npm install
npx expo start        # scan the QR with Expo Go
npx expo start --web  # or run in a browser
```

## Structure

```
app/
  _layout.tsx      store provider + dark stack navigator
  index.tsx        home — forecast ring, due count, deck list
  review.tsx       flip-card review session + rating
  paywall.tsx      RevenueCat paywall (3 packages)
  new-deck.tsx     deck creator
  settings.tsx     progress, exam date, subscription
  deck/[id].tsx    deck detail + card editor
src/lib/
  srs.ts           SM-2 engine, retention & forecast maths
  store.tsx        app state, persistence, streaks, XP
  purchases.ts     RevenueCat boundary
  seed.ts          starter decks (JEE / NEET / UPSC)
  theme.ts         design tokens
src/components/UI.tsx
```

## Why this deserves the Peace Prize

Access to good revision tooling is a quiet form of inequality. A student in Kota with a coaching subscription gets structured revision; a student in a village with a ₹5,000 phone and 1GB/day gets a PDF. Smriti works fully offline, ships with real syllabus content, and gives away the entire core loop for free. The paid tier subsidises the free one.

## Licence

MIT — see [LICENSE](./LICENSE). Open source, as required by the Next Gen Award.
