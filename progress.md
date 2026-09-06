# progress.md — Project Tracking & Status

**Project Name:** ระบบบันทึกการเข้าร่วมปฏิบัติธรรมวิปัสสนากรรมฐาน  
**Status:** MVP 100% Completed — พร้อมใช้งาน  
**Last Updated:** 2026-09-06  

---

## 1. Overall Completion

- [x] Phase 1: Foundation (100%)
- [x] Phase 2: Core Operations (100%)
- [x] Phase 3: Intelligence Layer (100%)
- [x] Phase 4: Backlog & Enhancements (100%)

---

## 2. Module Status (M01 - M06)

| Module | Status | Features Completed |
|---|---|---|
| **M01: Time & Tracking** | 🟢 Done | Barcode scan, duplicate prevention, auto-clear 4s, status messages |
| **M02: Participant Mgmt** | 🟢 Done | CRUD, **Excel/CSV Import (ทั้ง Header Thai/EN), Excel Export** |
| **M03: Session Mgmt** | 🟢 Done | Auto-generate 40 sessions, Active toggle (1 Active ต่อขณะ) |
| **M04: Dashboard** | 🟢 Done | Grid View (Student × Session), Person View, Summary Cards, PDF/Excel |
| **M05: Auth & Control** | 🟢 Done | NextAuth JWT, Admin Login, Change Password, Middleware protection |
| **M06: Data Policy** | 🟢 Done | 30-Day Retention Policy with cascade delete |

---

## 3. Routes & Pages

| Route | Auth | Description |
|---|---|---|
| `/` | Public | → redirect to /checkin |
| `/checkin` | Public | หน้าสแกนบาร์โค้ด USB |
| `/mystatus` | Public | นิสิตตรวจสอบสถิติตัวเอง |
| `/admin/login` | Public | หน้า Login |
| `/admin/sessions` | Admin | จัดการรอบ / เปิด-ปิด Session |
| `/admin/students` | Admin | CRUD + Import/Export |
| `/admin/reports` | Admin | รายงาน Grid + Person + Export |
| `/admin/settings` | Admin | เปลี่ยนรหัสผ่าน + ล้างข้อมูล |

---

## 4. Tech Debt & Post-Launch (Future Scope)

- **Database:** SQLite is used. When scaling to multi-campus, switch `provider="sqlite"` to `provider="postgresql"` in `schema.prisma`.
- **Integrations:** University SSO (LDAP) and SIS sync are currently bypassed (handled manually via Excel import).
- **Future:** LINE Notify, Auto session open/close by schedule, Audit Log

---

## 5. Handover & Deployment

1. **Development:**
   - `cd v2`
   - `npm run dev` → http://localhost:3000

2. **Production:**
   - `npm run build`
   - `npm run start`

3. **First-time setup:**
   - `npx prisma db push`
   - `npx tsx prisma/seed.ts`

4. **Default Admin:** username=`admin` password=`admin1234` (เปลี่ยนหลัง deploy)