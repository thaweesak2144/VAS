# implementation-plan.md — Phased Development Plan

**Method:** Vibe Coding (AI-assisted development)  
**Stack:** Next.js 14 + Prisma + SQLite + NextAuth + Tailwind CSS  

---

## Dependency Order (Build Sequence)

```
1. PRD.md          ← defines WHAT
2. architecture.md ← defines HOW
3. schema.md       ← defines DATA
4. implementation-plan.md ← defines WHEN & ORDER
5. progress.md     ← tracks DONE vs TODO
6. AGENTS.md       ← guides AI HOW TO WORK
```

---

## Phase 1 — Foundation (Completed ✅)

### 1.1 Project Setup
- [x] Next.js 14 (App Router, TypeScript, Tailwind)
- [x] Prisma + SQLite schema
- [x] .env + .env.local configuration
- [x] tsconfig.json (target: ES2017, strict: true)
- [x] npm dependencies installed

### 1.2 Database & Auth
- [x] Prisma schema: Admin, Student, Session, Attendance
- [x] `npx prisma db push` → SQLite created
- [x] Seed: admin / admin1234
- [x] NextAuth Credentials Provider (JWT strategy)
- [x] Middleware: protect /admin/* routes

### 1.3 Admin Management (M02)
- [x] GET/POST /api/students
- [x] PUT/DELETE /api/students/[id]
- [x] POST /api/students/import (CSV bulk)
- [x] /admin/students page (CRUD + search + filter + CSV upload)

### 1.4 Session Management (M03)
- [x] POST /api/sessions (auto-generate 40 from startDate)
- [x] GET/DELETE /api/sessions
- [x] GET/POST/DELETE /api/sessions/active
- [x] /admin/sessions page (grid by day, open/close buttons, LIVE badge)

---

## Phase 2 — Core Operations (Completed ✅)

### 2.1 Check-in Module (M01)
- [x] POST /api/checkin (barcode → lookup → attendance)
- [x] Duplicate prevention (DB UNIQUE constraint)
- [x] /checkin page (public, dark theme, USB HID input)
- [x] Status display: ✅ OK / ⚠️ DUPLICATE / ❌ NOT_FOUND / 🔒 NO_SESSION
- [x] Auto-focus, 3-second reset, session counter

### 2.2 Admin Auth (M05)
- [x] /admin/login page
- [x] Admin layout with navbar (protected)
- [x] Logout button

---

## Phase 3 — Intelligence Layer (Completed ✅)

### 3.1 Reports & Dashboard (M04)
- [x] GET /api/reports (filter by group)
- [x] /admin/reports — Grid View (student × session matrix)
- [x] /admin/reports — Person View (search by studentCode)
- [x] Summary statistics cards
- [x] Color coding: green ≥80% / yellow ≥50% / red <50%
- [x] Export Excel (.xlsx, client-side)
- [x] Print PDF (window.print + @media print CSS)

### 3.2 Student Self-Service
- [x] GET /api/mystatus?code=...
- [x] /mystatus page (search by studentCode, attendance grid 10×4)
- [x] Progress bar, scan time tooltip

### 3.3 Admin Settings
- [x] GET/POST /api/admin/cleanup (data retention check + delete)
- [x] PUT /api/admin/password (change password with validation)
- [x] /admin/settings page (password form + retention countdown + student link)

---

## Phase 4 — Backlog (Should Have / Could Have)

### Should Have
- [ ] Export รายชื่อนิสิตเป็น Excel
- [ ] รายงานสรุปเปรียบเทียบกลุ่ม (bar chart)
- [ ] เพิ่ม Admin หลายคน (multi-admin)
- [ ] Import Excel (.xlsx) แทน CSV

### Could Have
- [ ] LINE Notify เมื่อนิสิตเช็คชื่อไม่ครบ
- [ ] Auto-open/close session ตามเวลา
- [ ] Audit Log (ใครแก้ไขอะไร เมื่อไร)
- [ ] LDAP / University SSO
- [ ] Offline Queue สำหรับ Check-in

---

## Tech Decisions — Confirmed & Final

| Decision | Status | Value |
|---|---|---|
| Database | ✅ Final | SQLite (Prisma) |
| Auth | ✅ Final | NextAuth JWT + Credentials |
| Barcode | ✅ Final | Code 128, USB HID |
| Sessions | ✅ Final | 4 rounds × 10 days = 40 |
| Check-in Auth | ✅ Final | Public (no login) |
| Student Self-service | ✅ Final | Public /mystatus |
| Data Retention | ✅ Final | 30 days after project start |
| PDF | ✅ Final | window.print() |
| Export | ✅ Final | Client-side xlsx |
| Port | Config | 3000 (default), 3001 if occupied |

---

## Running Commands

```bash
# Development
npm run dev

# Production build
npm run build && npm run start

# Database
npx prisma db push        # apply schema
npx tsx prisma/seed.ts    # seed admin
npx prisma studio         # GUI browser
```