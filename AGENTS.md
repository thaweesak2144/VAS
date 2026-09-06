# AGENTS.md — AI Agent Guidelines & Context

This file serves as the system prompt and context for any future AI Agents (e.g., Cursor, GitHub Copilot, Gemini) working on this repository via Vibe Coding.

---

## 1. Project Context

- **App:** ระบบบันทึกเวลาและติดตามการเข้าร่วมโครงการปฏิบัติธรรมวิปัสสนากรรมฐาน (มหาวิทยาลัย)
- **Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Prisma, SQLite, NextAuth v4
- **Language:** TypeScript
- **UI Language:** Thai (ภาษาไทย)

## 2. Agent Coding Rules (Must Follow)

### 2.1 File Encoding (Windows PowerShell)
If you are an agent executing shell commands on Windows PowerShell to write files, **ALWAYS** use:
```powershell
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("path\to\file.ts", $content, $utf8NoBom)
```
*Never use `Set-Content -Encoding UTF8` as it adds a BOM which breaks Next.js and Prisma.*

### 2.2 Prisma & Database Rules
- The database is **SQLite** (`prisma/dev.db`).
- Do not add features that require advanced PostgreSQL features (e.g., JSONB, Enums) unless migrating.
- If you modify `schema.prisma`, you MUST run `npx prisma db push` afterward.
- Keep constraints at the DB level (e.g., `@@unique([studentId, sessionId])` for duplicate check-ins).

### 2.3 Next.js Rules (App Router)
- Use Server Components by default. Add `"use client";` only when hooks (`useState`, `useEffect`) or browser APIs are needed.
- API Routes should be written in `src/app/api/.../route.ts`.
- Use NextAuth's `getServerSession(authOptions)` for API protection.
- Protected routes are handled by `src/middleware.ts` (`/admin/*`).

### 2.4 Styling & UI
- Use Tailwind CSS for all styling. No custom CSS unless necessary (like print styles).
- Theme colors: `amber-600`, `amber-700`, `amber-800` (theme reflects Buddhism/Meditation vibes).
- Error colors: `red-500`, Success: `green-500`, Warning: `yellow-400`.

### 2.5 Documentation Memory
If you make architectural changes, add new tables, or complete major features, you MUST update:
- `schema.md` (if DB changes)
- `architecture.md` (if stack/flow changes)
- `progress.md` (check off tasks)

## 3. Important Commands

```bash
# Set path for nodejs tools in Windows agent sessions
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

# Run dev server
npm run dev

# Build
npm run build

# Push schema changes
npx prisma db push
```