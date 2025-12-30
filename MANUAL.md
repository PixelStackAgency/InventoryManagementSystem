InventoryPro — Manual & Deployment Guide

Overview

This repository contains InventoryPro — a Next.js + Prisma inventory management app. This manual explains how to:
- Set up locally for development
- Run migrations and seed the database
- Build and run for production (manual + Docker)
- Basic app usage (admin tasks and common flows)

Seeded admin account

- username: superadmin
- password: superadmin123

1) Requirements

- Node.js 18+ (LTS recommended)
- npm or yarn
- Git
- (Optional) Docker + docker-compose for containerized deployment

2) Environment

Copy `.env.example` to `.env` and edit values as needed:

- `DATABASE_URL` — Prisma database connection string. For local dev we use SQLite: `file:./prisma/dev.db`.
- `JWT_SECRET` — strong random secret for signing tokens.
- `NODE_ENV` — `development` or `production`
- `PORT` — server port (default 3000)

3) Local development (quick start)

Install deps:

```bash
npm install
```

Generate Prisma client and run migrations (create DB):

```bash
npx prisma generate
npx prisma migrate deploy
```

Seed the database:

```bash
node prisma/seed.js
```

Start dev server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Notes:
- If you see Prisma "Unable to open the database file", run `npx prisma migrate deploy` and ensure `DATABASE_URL` points to a writable location.
- If Next.js gives EPERM rename errors on Windows, stop all Node processes and remove the `.next` folder then restart `npm run dev`.

4) Build for production (manual)

```bash
npm run build
npm run start
```

Production DB: Replace `DATABASE_URL` with a production database (Postgres recommended). For Postgres set e.g. `postgresql://user:pass@host:5432/dbname` in `.env` and run `npx prisma migrate deploy`.

5) Docker (quick container)

Build and run with docker-compose (uses SQLite file persisted to host folder):

```bash
docker compose up --build -d
```

Access app at http://localhost:3000 (or the configured `PORT`).

6) Typical workflows (how to use)

- Login: use seeded `superadmin` credentials. After login, admin links `Settings` and `Staff` should be visible.
- Products: Add products with `articleNumber`, `purchasePrice`, `sellingPrice`. Use `quantity` to track stock.
- Suppliers: Add supplier records and contact info. Add purchases referencing suppliers and product article numbers.
- Purchases: Create purchases with items. Purchase creation updates product quantities.
- Sales: Create sales referencing products and customers; stock decreases when a sale is created.
- Customers/Staff: Manage via respective UI pages. Assign permissions per staff via the `Permissions` API.

7) Admin checklist before selling to customers

- Replace `JWT_SECRET` with a strong secret (do not use default).
- Configure a production-ready DB (Postgres or MySQL) and run Prisma migrations.
- Audit email/SMS integrations if needed (not included).
- Ensure environment variables are set securely (use secret manager or env file in server).

8) Troubleshooting

- EPERM on `.next` rename (Windows): stop Node, delete `.next` then restart.
- `ECONNREFUSED` when scripts call `localhost`: ensure dev server is running and not blocked by firewall.
- Permission links missing: ensure user has `SUPER_ADMIN` role or necessary `MANAGE_*` permissions.

9) Pushing to a new Git repo

There is a helper script `publish_to_repo.sh` and `publish_to_repo.ps1`.
Usage (Linux/macOS):

```bash
./publish_to_repo.sh git@github.com:yourorg/yourrepo.git
```

Usage (Windows PowerShell):

```powershell
.\publish_to_repo.ps1 -RemoteUrl 'https://github.com/yourorg/yourrepo.git'
```

10) What's included in this release

- Next.js app with pages for Products, Sales, Purchases, Suppliers, Customers, Staff, Settings
- Prisma schema and migrations
- Seed script creating `superadmin` with all permissions
- Global toast notifications for UI feedback
- Dockerfile + docker-compose for quick containerization

License & Support

This project does not include a formal license file. Add `LICENSE` as appropriate.

For further customization (reports, advanced analytics, multi-location), we can implement the planned features in subsequent sprints.
