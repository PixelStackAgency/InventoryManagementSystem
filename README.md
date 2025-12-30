# Local Inventory & Stock Management (Next.js + SQLite)

Quick start (Windows):

1. Install dependencies:

```bash
cd "c:/All In 1/Business/PIXELSTACKAGENCY/Client 1"
npm install
```

2. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js    # or `ts-node prisma/seed.ts` if you prefer
```

3. Run dev server:

```bash
npm run dev
```

Defaults:
- SQLite DB at `dev.db` (as configured in `.env`).
- Seeded admin: `admin` / `admin123` (change immediately).

Notes:
- This app is local-first and stores all data in SQLite.
- Backup endpoint available at `GET /api/backup` and restore via `POST /api/backup` with the exported JSON.
