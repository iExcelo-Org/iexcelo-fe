# iExcelo: Student Frontend

Nigeria's leading exam revision platform. iExcelo helps students prepare for WAEC, JAMB, NECO, and SAT through structured practice, timed mock exams, and detailed performance tracking.

## What it does

- **Exam revision:** three modes: Revision (instant feedback), Timed (countdown timer), and Mock (exam-day simulation)
- **Performance tracking:** per-question result review, score history, and progress analytics
- **Subscriptions:** Stripe and Paystack checkout for 1-, 2-, 4-, and 6-month plans per exam type
- **Sponsorships:** sponsors can fund subscriptions for students directly through the platform (Giveback)
- **Affiliate program:** referral tracking, earnings dashboard, and payout management
- **Landing pages:** home, about, FAQs, revisions, affiliate, giveback, and contact

## Stack

- [Next.js 15](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Recharts (analytics charts)
- Socket.IO client (real-time notifications)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and fill in the required values (API URL, Stripe public key, etc.).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
