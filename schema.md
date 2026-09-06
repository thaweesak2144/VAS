# schema.md — Database Schema Reference

**ORM:** Prisma 5 | **Database:** SQLite | **File:** `prisma/dev.db`

---

## 1. ER Diagram

```
Admin          Student              Session
─────────      ─────────────────    ──────────────────────
id PK          id PK                id PK
username UQ    studentCode UQ       dayNumber   (1–10)
password       fullName             roundNumber (1–4)
createdAt      groupName            roundName   (เช้ามืด/เช้า/บ่าย/เย็น)
               createdAt            sessionDate (DateTime)
               │                    startTime   (String "HH:MM")
               │                    endTime     (String "HH:MM")
               │                    isActive    (Boolean, default false)
               │                    createdAt
               │                    ──────────────────────
               │                    UNIQUE(dayNumber, roundNumber)
               │                    │
               └──────────┬─────────┘
                          │
                    Attendance
                    ──────────────
                    id PK
                    studentId FK → Student.id  (CASCADE DELETE)
                    sessionId FK → Session.id  (CASCADE DELETE)
                    scannedAt (DateTime, default now())
                    ──────────────
                    UNIQUE(studentId, sessionId)  ← ป้องกันสแกนซ้ำ
```

---

## 2. Table Definitions

### Admin
```prisma
model Admin {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String   // bcrypt hash, rounds=10
  createdAt DateTime @default(now())
}
```
**Seed:** username=`admin`, password=`admin1234` (เปลี่ยนหลัง deploy)

### Student
```prisma
model Student {
  id           Int          @id @default(autoincrement())
  studentCode  String       @unique  // รหัสนิสิต = ค่าจาก Barcode Code 128
  fullName     String
  groupName    String
  createdAt    DateTime     @default(now())
  attendances  Attendance[]
}
```
**Import CSV format:** `studentCode,fullName,groupName` (header required)

### Session
```prisma
model Session {
  id          Int          @id @default(autoincrement())
  dayNumber   Int          // 1–10
  roundNumber Int          // 1–4
  roundName   String       // "รอบเช้ามืด" | "รอบเช้า" | "รอบบ่าย" | "รอบเย็น"
  sessionDate DateTime
  startTime   String       // "04:00" | "08:00" | "13:00" | "16:00"
  endTime     String       // "04:30" | "08:30" | "13:30" | "16:30"
  isActive    Boolean      @default(false)
  createdAt   DateTime     @default(now())
  attendances Attendance[]
  @@unique([dayNumber, roundNumber])
}
```
**Auto-generate:** 10 วัน × 4 รอบ = **40 Sessions** จาก `startDate` ที่ Admin กรอก

### Attendance
```prisma
model Attendance {
  id         Int      @id @default(autoincrement())
  studentId  Int
  sessionId  Int
  scannedAt  DateTime @default(now())
  student    Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  session    Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  @@unique([studentId, sessionId])
}
```

---

## 3. Constants (src/lib/sessions.ts)

```typescript
export const ROUNDS = [
  { roundNumber: 1, roundName: "รอบเช้ามืด", startTime: "04:00", endTime: "04:30" },
  { roundNumber: 2, roundName: "รอบเช้า",    startTime: "08:00", endTime: "08:30" },
  { roundNumber: 3, roundName: "รอบบ่าย",    startTime: "13:00", endTime: "13:30" },
  { roundNumber: 4, roundName: "รอบเย็น",    startTime: "16:00", endTime: "16:30" },
];
export const TOTAL_DAYS = 10;
export const TOTAL_SESSIONS = 40; // TOTAL_DAYS × ROUNDS.length
```

---

## 4. Key Constraints

| Constraint | Table | Rule |
|---|---|---|
| UNIQUE | Admin.username | Admin ชื่อซ้ำไม่ได้ |
| UNIQUE | Student.studentCode | รหัสนิสิตซ้ำไม่ได้ |
| UNIQUE | Session(dayNumber, roundNumber) | 1 รอบต่อวัน |
| UNIQUE | Attendance(studentId, sessionId) | สแกนซ้ำ Session เดียวกันไม่ได้ |
| CASCADE | Attendance → Student | ลบนิสิต → ลบ attendance ด้วย |
| CASCADE | Attendance → Session | ลบ session → ลบ attendance ด้วย |

---

## 5. Commands

```bash
# สร้าง/อัปเดต DB schema
npx prisma db push

# Seed admin user
npx tsx prisma/seed.ts

# เปิด Prisma Studio (GUI)
npx prisma studio

# Backup database
copy prisma\dev.db prisma\dev.db.backup
```

---

## 6. Data Retention

- **Policy:** ลบข้อมูลได้หลังครบ 30 วันจากวัน Session แรก (dayNumber=1)
- **Implementation:** API `POST /api/admin/cleanup` ตรวจสอบวันก่อน ถ้ายังไม่ถึงจะ return error
- **Cascade:** ลบ Student → Attendance หาย | ลบ Session → Attendance หาย