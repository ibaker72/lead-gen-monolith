# Lead Gen Engine

A production-grade, multi-tenant lead generation platform for home service contractors. Built with Next.js 14, Supabase, Stripe, Twilio, Resend, and the Anthropic API.

---

## Architecture

| Audience | Entry Point | Core Value |
|---|---|---|
| **Homeowners** | `/[niche]/[location]` | Geo-targeted landing page → quote form → instant response |
| **Contractors** | `/contractor/dashboard` | Real-time lead feed, billing, status management |
| **Admin (you)** | `/admin/leads` | Full oversight of leads, contractors, slots, and revenue |

---

## Tech Stack

- **Next.js 14** — App Router, SSG with ISR, Server Components
- **Supabase** — Postgres, Auth, Realtime
- **Tailwind CSS + shadcn/ui** — Component library
- **Stripe** — Subscriptions (rank & rent) + PaymentIntents (pay-per-lead)
- **Twilio** — SMS notifications (homeowner confirmation + emergency alerts)
- **Resend** — HTML email for lead notifications
- **Anthropic claude-sonnet-4-20250514** — AI lead scoring and summaries

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo>
cd lead-gen-monolith
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`. See `.env.example` for the full list.

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in your Supabase SQL editor:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Copy your project URL and keys into `.env.local`

### 4. Seed the database

```bash
npm run seed
```

This populates 3 niches (HVAC, Roofing, Plumbing), 10 NJ locations, and 30 active geo-niche slots.

### 5. Create your admin user

1. Sign up at `/auth/signup` with your admin email
2. In Supabase SQL editor, run:
   ```sql
   INSERT INTO admins (user_id)
   SELECT id FROM auth.users WHERE email = 'your@email.com';
   ```

### 6. Run locally

```bash
npm run dev
```

---

## URL Structure

| Route | Description |
|---|---|
| `/hvac/paterson-nj` | Landing page (replace niche/location) |
| `/auth/login` | Contractor login |
| `/auth/signup` | Contractor signup |
| `/contractor/dashboard` | Real-time lead feed |
| `/contractor/leads/:id` | Lead detail + status actions |
| `/contractor/billing` | Stripe billing portal |
| `/contractor/settings` | Company profile |
| `/admin/leads` | All leads with filters + CSV export |
| `/admin/contractors` | Manage contractors |
| `/admin/niches` | Assign contractors to geo slots |
| `/admin/revenue` | MRR, lead volume chart, top slots |

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/leads/submit` | Public | Full lead pipeline |
| POST | `/api/leads/score` | Admin secret | AI scoring |
| POST | `/api/leads/notify` | Admin secret | SMS + email |
| POST | `/api/billing/portal` | Supabase session | Stripe portal redirect |
| POST | `/api/billing/charge-lead` | Supabase session | Pay-per-lead charge |
| POST | `/api/webhooks/stripe` | Stripe signature | Invoice/subscription events |
| GET/PATCH | `/api/admin/contractors` | Admin session | Contractor CRUD |
| GET/PATCH | `/api/admin/niches` | Admin session | Slot management |
| GET | `/api/admin/leads` | Admin session | Lead data |

---

## Billing Models

**Rank & Rent** — Contractor pays a flat monthly subscription via Stripe. On `invoice.paid`, their account stays active. On `invoice.payment_failed`, account is flagged inactive.

**Pay-Per-Lead** — Each time a contractor marks a lead as `sold`, a Stripe PaymentIntent is created for `base_lead_price`. The charge is recorded in the `payments` table.

---

## Stripe Webhook Setup

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Required events: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`, `checkout.session.completed`

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Add all environment variables from `.env.example`
4. Deploy

The sitemap at `/sitemap.xml` auto-generates from all active `niche_locations` rows.

---

## Environment Variables

See `.env.example` for all required variables with descriptions.
