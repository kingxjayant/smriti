# Shipaton 2026 — Submission Pack (Smriti)

## 1. Devpost fields (copy-paste)

**App name:** Smriti — Exam Memory Coach

**Tagline:** Remember more. Study less. Offline spaced repetition that predicts what you'll recall on exam day.

**Category to enter:** Next Gen Award (primary)
Also tick: RevenueCat Peace Prize, RevenueCat Design Award, HAMM Award, #BuildInPublic

**Elevator pitch (200 chars):**
Offline-first spaced repetition for India's 13M exam aspirants. A live Exam Day Forecast tells you exactly how much of your syllabus you'll actually remember when it counts.

**Built with:** expo, react-native, typescript, expo-router, revenuecat, react-native-svg, asyncstorage

---

## 2. Demo video script (2:00 — record on your phone, screen recorder)

| Time | Screen | Say |
|---|---|---|
| 0:00–0:15 | You on camera, or home screen | "Every year 13 million Indian students sit for JEE, NEET and UPSC. Almost all of them revise by re-reading notes — the least effective method science has measured. I built Smriti to fix that." |
| 0:15–0:35 | Home screen, point at ring | "This is the Exam Day Forecast. It's not what's due today — it's a forgetting-curve projection to your actual exam date. Right now this student walks into the hall remembering 62% of their syllabus." |
| 0:35–1:05 | Tap due card → review flow, rate 3–4 cards | "Tap through. Real JEE, NEET and UPSC content ships in the box. Flip, rate honestly, and my SM-2 variant reschedules — tuned shorter than standard Anki because exams have deadlines." |
| 1:05–1:20 | Back to home, ring has moved | "Every review moves the forecast. That's the whole motivational loop." |
| 1:20–1:40 | Hit the 30-card cap → paywall | "Monetization runs on RevenueCat. The paywall fires at the daily cap — mid-session, when the student is motivated — not at cold launch. Three packages in one offering so I can A/B price from the dashboard." |
| 1:40–1:50 | Buy → Pro unlocked → settings | "Entitlement unlocks instantly, restore works, and Pro state persists." |
| 1:50–2:00 | Airplane-mode toggle, app still works | "And it's fully offline. No backend, no server bill, works on a ₹5,000 phone with no data. That's Smriti." |

**Recording tips (phone only):** Android built-in screen recorder → 1080p, 60fps, mic ON. Record in one take; re-record rather than edit. Upload to YouTube as **Public** (not unlisted — Devpost sometimes fails on unlisted).

---

## 3. Required for Next Gen Award
- [ ] Public GitHub repo (MIT licensed) — code is ready
- [ ] Demo video, public on YouTube
- [ ] Student status / proof when asked
- [ ] Register on Devpost + join Shipaton Discord
- [ ] Submit before **Oct 1, 2026, 12:15 PM IST**

---

## 4. #BuildInPublic plan (free, second shot at $30k)

Post daily on X + LinkedIn with **#BuildInPublic #Shipaton**. Angle: *"Solo student, no laptop, building an app entirely on my phone."* That story is genuinely rare and highly shareable.

**Day-by-day content bank:**
1. "I have no laptop and no money. I'm building a study app for JEE aspirants on my phone in 25 days." + screenshot
2. The forgetting-curve maths, explained simply (carousel)
3. Screen recording of the flip animation
4. "Why I chose offline-first for Indian students" (data cost stats)
5. The forecast formula in one code screenshot
6. Ask: "JEE/NEET students — which subject do you forget fastest?" (drives replies)
7. Paywall design breakdown — why the cap fires mid-session
8. First 10 users' feedback
9. Retention chart from real usage
10. Launch post + demo video

Post at **9–10 PM IST** (peak Indian dev-Twitter). Reply to every comment within an hour — engagement is what judges see.

---

## 5. What to add next (highest score-per-hour)

1. **AI card generation** — paste notes → deck. Biggest Pro justification. Gemini free tier.
2. **Weak-topic heatmap** in settings — Design Award bait, ~2 hours.
3. **Local notifications** at a chosen revision hour (expo-notifications is already installed).
4. **Native RevenueCat wiring** — if you ever get a laptop or free EAS build, swap `purchases.ts` internals for `react-native-purchases`. The boundary is already correct.
5. **Hindi language toggle** — strong Peace Prize signal, cheap to do.
