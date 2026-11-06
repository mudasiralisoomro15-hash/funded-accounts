# FundedX: Prop Firm Website (Next.js 14 + Tailwind + Firebase)

Visitors see the hero and pricing immediately (no signup wall). **Buy Account** / **Client Portal** open the auth modal. Orders and users are saved. You control everything from `/admin`.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Pages

| URL | What |
| --- | --- |
| `/` | Public website (hero, plans, FAQ, footer) |
| `/dashboard` | Client area: the logged-in user's orders |
| `/admin` | Admin panel: plans & prices, site content, users, orders |

## Admin panel can change

- Prices for every model and account size, discounts, "Popular" badge, hide/show a model
- Rules per model: daily loss, drawdown (static/trailing), leverage, profit target, min days, profit split, payouts
- Brand name, announcement bar, hero text, FAQ (add / edit / reorder / delete)
- View all users (export CSV) and all orders (set status: pending → paid → active)

## Data modes

- **Demo mode** (no Firebase keys): everything works but is stored only in the current browser.
- **Live mode** (Firebase keys set): real login, shared database. Follow `FIREBASE_SETUP.md`.

## Files you will edit most

| What | File |
| --- | --- |
| Default prices/rules (used until admin saves) | `lib/plans.ts` |
| Default texts / FAQ | `lib/siteConfig.ts` |
| Database functions | `lib/db.ts` |
| Login functions | `lib/auth.ts` |
| Security rules | `firestore.rules` |
| Payment gateway (next step) | `lib/payments.ts` |
| MetaApi (next step) | `lib/metaapi.ts` |
