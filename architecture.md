# architecture.md — System Architecture Blueprint

**Version:** 1.0 | **Stack:** Next.js 14 + Prisma + SQLite + NextAuth

---

## 1. Architecture Decision: Monolithic Full-Stack

**เหตุผล:** ทีม Vibe Coding → complexity ต่ำ = delivery เร็ว | 1 scanner | < 500 นิสิต
**Migration Path:** เปลี่ยน Prisma provider = "postgresql" เมื่อ Scale ขึ้น (ไม่ต้องแก้ code อื่น)

---

## 2. Tech Stack

| Layer | Technology | Version | License |
|---|---|---|---|
| Framework | Next.js (App Router) | 14.2.29 | MIT |
| Runtime | Node.js LTS | 24.x | MIT |
| Language | TypeScript (strict) | 5.x | Apache 2.0 |
| Styling | Tailwind CSS | 3.4.x | MIT |
| Auth | NextAuth.js (JWT + Credentials) | 4.24.x | ISC |
| ORM | Prisma | 5.22.x | Apache 2.0 |
| Database | SQLite | built-in | Public Domain |
| Export | SheetJS (xlsx) | 0.18.x | Apache 2.0 |
| Password | bcryptjs | 2.4.x | MIT |
| Package Manager | npm | 11.x | Artistic-2.0 |

---

## 3. Folder Structure

```
v2/
├── prisma/
│   ├── schema.prisma          # DB schema (single source of truth)
│   ├── dev.db                 # SQLite file (gitignore this)
│   └── seed.ts                # Admin seed script
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + Providers
│   │   ├── globals.css        # Tailwind + Print CSS
│   │   ├── providers.tsx      # SessionProvider wrapper
│   │   ├── page.tsx           # redirect → /checkin
│   │   ├── checkin/
│   │   │   └── page.tsx       # PUBLIC — Barcode scan station
│   │   ├── mystatus/
│   │   │   └── page.tsx       # PUBLIC — Student self-service
│   │   ├── admin/
│   │   │   ├── layout.tsx     # Protected admin layout + navbar
│   │   │   ├── login/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   ├── sessions/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── checkin/route.ts
│   │       ├── students/route.ts
│   │       ├── students/[id]/route.ts
│   │       ├── students/import/route.ts
│   │       ├── sessions/route.ts
│   │       ├── sessions/active/route.ts
│   │       ├── reports/route.ts
│   │       ├── mystatus/route.ts
│   │       ├── admin/cleanup/route.ts
│   │       └── admin/password/route.ts
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   └── sessions.ts        # ROUNDS constant (4 rounds × 10 days)
│   ├── middleware.ts           # Route protection /admin/*
│   └── components/ui/         # (reserved for future shared components)
├── .env                       # DATABASE_URL
├── .env.local                 # NEXTAUTH_SECRET, NEXTAUTH_URL
├── package.json
├── tsconfig.json              # target: ES2017, strict: true
├── tailwind.config.ts
└── next.config.mjs
```

---

## 4. API Routes Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /api/sessions | public | List all sessions + attendance count |
| POST | /api/sessions | admin | Auto-generate 40 sessions from startDate |
| DELETE | /api/sessions | admin | Delete all sessions |
| GET | /api/sessions/active | public | Get current active session |
| POST | /api/sessions/active | admin | Open a session (closes others first) |
| DELETE | /api/sessions/active | admin | Close active session |
| POST | /api/checkin | public | Scan barcode → record attendance |
| GET | /api/students | admin | List all students |
| POST | /api/students | admin | Create student |
| PUT | /api/students/[id] | admin | Update student |
| DELETE | /api/students/[id] | admin | Delete student (cascade) |
| POST | /api/students/import | admin | Bulk import from CSV array |
| GET | /api/reports | admin | Full report data (filter by group) |
| GET | /api/mystatus | public | Student self-lookup by studentCode |
| GET | /api/admin/cleanup | admin | Check data retention status |
| POST | /api/admin/cleanup | admin | Delete all data (if 30 days passed) |
| PUT | /api/admin/password | admin | Change admin password |

---

## 5. Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| DB | SQLite | Zero-config, single server, easy backup |
| Auth Strategy | JWT (not DB sessions) | Stateless, no extra table needed |
| Check-in Auth | None (public) | UX: เปิดหน้าจอทิ้งไว้ได้ |
| Session Uniqueness | 1 Active at a time | Prevent double-counting |
| Duplicate prevention | DB UNIQUE(studentId, sessionId) | DB-level guarantee |
| PDF Print | window.print() + @media print CSS | No extra library needed |
| Export | Client-side xlsx | No server processing needed |

---

## 6. Environment Variables

```bash
# .env
DATABASE_URL="file:./prisma/dev.db"

# .env.local
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=http://localhost:3000
```

---

## 7. Resilience Strategy

| Failure | Impact | Fallback |
|---|---|---|
| Scanner เสีย | ไม่สแกนได้ | พิมพ์รหัสด้วย keyboard แทน (built-in) |
| Server ดับ | Check-in หยุด | SQLite WAL mode ป้องกัน corruption, restart ได้ทันที |
| Network | ไม่มี (localhost) | N/A — 1 เครื่องทำงาน standalone |
| SIS ล่ม (future) | sync ไม่ได้ | import CSV ด้วยตนเองแทน |