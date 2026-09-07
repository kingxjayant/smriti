# Smriti — Launch & #BuildInPublic Kit

Your angle, and it is a genuinely good one:

> **A student with no laptop and no money built a study app for Indian exam aspirants — entirely on a phone.**

That is rare, true, and highly shareable. Lead with it everywhere.

---

## Day 1 — post these today

### X / Twitter (main post)

```
I don't have a laptop.

I built and shipped an Android app from my phone in Jamshedpur.

It's called Smriti — spaced repetition for JEE/NEET/UPSC students, fully offline,
because most of us don't have data to spare mid-revision.

The bit I'm proud of 👇
```

*(attach a screen recording of the forecast ring moving after a review)*

**Thread continues:**

```
2/ Every flashcard app tells you what's due today.

None of them answer the question that actually matters:

"How much of this will I still remember on exam day?"

So I built a forecast for exactly that.
```

```
3/ It runs a forgetting curve over every card you've studied and projects
it forward to your real exam date.

retention = exp(−daysUntilExam / (stability × 2.2 + 1))

One number. It moves every time you revise. That's the whole motivation loop.
```

```
4/ Everything works offline. No backend, no account, no server bill.

Paste your class notes → it pulls out the facts → deck ready.
That parser runs on-device, in airplane mode, for free.
```

```
5/ Built with React Native + Expo, TypeScript, RevenueCat for subscriptions.

APK is public, code is MIT:
github.com/kingxjayant/smriti

Shipping the rest in public over the next 3 weeks. #BuildInPublic #Shipaton
```

**Post at 9–10 PM IST.** That is peak Indian dev-Twitter. Reply to every single comment within the hour — engagement is exactly what the #BuildInPublic judges look at.

---

### r/JEENEETards

Reddit punishes anything that smells like an ad. Be a student sharing a thing, not a founder.

**Title:** `Built a free offline revision app because I kept forgetting Organic by the time mains came around`

```
Not selling anything, the APK is free and the code is public.

Problem I had: I'd finish a chapter, feel confident, and three weeks later it
was gone. Re-reading notes felt productive and did nothing.

So I built a spaced repetition app around one idea — instead of showing what's
due today, it predicts how much of your syllabus you'll actually remember on
exam day, and that number moves every time you revise.

Other things I cared about:
- Works fully offline. No data needed mid-revision.
- Paste your notes, it generates cards for you. Runs on-device.
- Comes with Physics/Chem/Bio/Maths starter decks

Android only right now (no Mac, no iPhone, no money for a dev account).

APK + code: github.com/kingxjayant/smriti

Genuinely want feedback — what's missing, what's annoying, what would make you
actually use it during revision.
```

**Also post to:** r/UPSC, r/Btechtards, r/developersIndia (angle there: *"built and shipped an APK entirely from my phone, here's the setup"* — that community loves a constraint story).

---

### LinkedIn

```
I built an Android app on a phone.

No laptop. No developer account. No budget.

Smriti is a spaced-repetition study app for the ~13 million students who sit
JEE, NEET and UPSC every year. Most of them revise by re-reading notes — the
least effective method cognitive science has measured.

It's offline-first, because a student in a Tier-3 town can't rely on a stable
connection mid-revision. Paste your notes, get a deck. Then it predicts how much
of the syllabus you'll retain on exam day, and that number moves as you study.

Free, open source, MIT licensed: github.com/kingxjayant/smriti

Built for the RevenueCat Shipaton. Feedback very welcome.
```

---

## The content bank — one post a day

Do **not** save these up. Daily, small, honest beats one big polished launch.

| Day | Post |
|---|---|
| 1 | The launch thread above |
| 2 | The forgetting curve explained simply — why cramming fails |
| 3 | Screen recording of the card flip animation |
| 4 | "Why offline-first" — cite real data costs for Indian students |
| 5 | The forecast formula, one code screenshot |
| 6 | **Ask:** "JEE/NEET folks — which subject do you forget fastest?" (drives replies) |
| 7 | How the offline note parser works — no AI needed for structured notes |
| 8 | First 10 users' feedback, including the harsh bits |
| 9 | Paywall design: why the limit fires mid-session, not at launch |
| 10 | A bug that embarrassed you + the fix |
| 11 | Retention chart from real usage |
| 12 | "What I'd do differently" reflection |
| 13 | Demo video drop |
| 14 | Submission day post + thank-yous |

**Rules that matter more than the content:**
- Always attach an image or video. Text-only posts die.
- Reply to everyone. Judges read the conversation, not just the post.
- Post the failures too. "It crashed on 3 phones and here's why" outperforms polish.
- Never delete a low-performing post.

---

## Getting the first 50 users

Ranked by effort-to-payoff:

1. **Your own class / college WhatsApp groups.** Highest conversion by far. Just: *"made this, it's free, tell me if it's useless."*
2. **Reddit** — the three posts above.
3. **Telegram exam channels.** Search "JEE 2027", "NEET aspirants", "UPSC prelims". Ask the admin first; most will allow a genuinely free tool.
4. **Reply to students complaining about forgetting** on X. Search `"forgot everything" JEE` or `revision problem NEET`. Don't spam-drop the link — answer their actual problem, mention the app only if it fits.
5. **Your school/college teachers.** One teacher recommending it to a class = 40 users.

Track installs via the GitHub release download count — it's public on the releases page.

---

## What judges will check

- **Grand Prize** — real traction. Screenshot your download counts weekly so you have a growth story.
- **#BuildInPublic** — consistency and honesty beat reach. 14 daily posts with 20 likes each scores better than one viral post.
- **Next Gen** — public repo + video. Already done.
- **Peace Prize** — say the impact plainly: offline access, free core, real syllabus, students who can't pay for coaching.

---

## Do not

- Buy followers or engagement. It's checkable and disqualifying.
- Repost the same text to five subreddits in one hour. You'll get shadowbanned.
- Claim user numbers you don't have.
- Call it "AI-powered" when the default engine is a rule-based parser. Say what it actually does — the honesty plays better anyway.
