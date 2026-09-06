# PRD — Product Requirements Document
## ระบบบันทึกเวลาและติดตามการเข้าร่วมโครงการปฏิบัติธรรมวิปัสสนากรรมฐาน

**Version:** 1.0  
**Status:** Active Development  
**Owner:** คณะมหาวิทยาลัย  
**Last Updated:** 2026-09-05  

---

## 1. Problem Statement

องค์กรใช้กระดาษลงชื่อด้วยมือ → ข้อมูลสูญหาย / อ่านลายมือไม่ออก / ต้องกรอก Excel ซ้ำ 3–5 วันต่อรอบ ส่งผลให้ไม่สามารถยืนยันสิทธิ์นิสิตได้อย่างน่าเชื่อถือ

---

## 2. Goals (ผลลัพธ์ที่ต้องการ)

| Goal | KPI |
|---|---|
| ลดเวลาทำรายงาน | 3–5 วัน → < 1 ชั่วโมง |
| ลดข้อผิดพลาดการบันทึก | ~15% → < 1% |
| Admin จัดการข้อมูลผ่าน UI | ไม่ต้องใช้ Excel อีกต่อไป |
| นิสิตดูสถิติตัวเองได้ | Self-service ไม่ต้องถามเจ้าหน้าที่ |

---

## 3. Confirmed Specifications

| รายการ | ค่า |
|---|---|
| Barcode Format | **Code 128** (บัตรนักศึกษา) |
| Hardware | USB Barcode Scanner (HID Keyboard Mode) |
| การเช็คชื่อ | **สแกนเข้าอย่างเดียว** (นับตาม Session ที่กำหนด) |
| จำนวนจุด Check-in | **1 จุด** |
| รอบต่อวัน | **4 รอบ** — 04:00–04:30 / 08:00–08:30 / 13:00–13:30 / 16:00–16:30 |
| จำนวนวัน | **10 วัน** (รวม 40 Sessions) |
| สิทธิ์จัดการ | **Admin เท่านั้น** (ต้อง Login) |
| หน้าสแกน | **Public** (ไม่ต้อง Login แต่ Admin ต้องเปิด Session ก่อน) |
| นิสิต Self-service | **ดูได้** ผ่าน /mystatus |
| Data Retention | **30 วัน** หลังวันเริ่มต้นโครงการ |

---

## 4. User Roles

| Role | หน้าที่เข้าถึงได้ |
|---|---|
| **Admin** | /admin/* ทั้งหมด (login required) |
| **เจ้าหน้าที่สแกน** | /checkin (public, Admin เปิด session ก่อน) |
| **นิสิต** | /mystatus (public, ค้นหาด้วยรหัสตัวเอง) |

---

## 5. User Stories (Must Have)

### Admin
- US-01: Admin สามารถ Login ด้วย username/password
- US-02: Admin เพิ่ม/แก้ไข/ลบ นิสิต (รหัส, ชื่อ, กลุ่ม)
- US-03: Admin Import นิสิตจาก CSV (columns: รหัส, ชื่อ, กลุ่ม)
- US-04: Admin กรอกวันเริ่มต้น → ระบบ Auto-generate 40 Sessions
- US-05: Admin เปิด/ปิด Session (มีแค่ 1 Active ต่อขณะ)
- US-06: Admin ดูรายงาน Grid ภาพรวม (นิสิต × Session)
- US-07: Admin Export รายงานเป็น Excel
- US-08: Admin พิมพ์รายงานเป็น PDF
- US-09: Admin เปลี่ยนรหัสผ่านตัวเองได้
- US-10: Admin ลบข้อมูลทั้งหมดได้ (หลังครบ 30 วัน)

### เจ้าหน้าที่ / ระบบ
- US-11: สแกน Barcode Code 128 → ระบบบันทึกอัตโนมัติ
- US-12: ถ้าสแกนซ้ำ Session เดียวกัน → แสดงเตือน ไม่บันทึกซ้ำ
- US-13: ถ้าไม่มี Session Active → แสดงข้อความแจ้ง
- US-14: ถ้ารหัสไม่พบในระบบ → แสดง error

### นิสิต
- US-15: นิสิตพิมพ์/สแกนรหัสที่ /mystatus → เห็นตาราง 10 วัน × 4 รอบ
- US-16: นิสิตเห็น % การเข้าร่วมพร้อม progress bar

---

## 6. Non-Functional Requirements (Key)

| NFR | Target |
|---|---|
| Check-in response | < 500ms |
| Page load | < 2s (LAN) |
| Duplicate prevention | Database UNIQUE constraint |
| Password security | bcrypt rounds ≥ 10 |
| Thai language | UTF-8 ทุกส่วน |
| Platform | Windows 10+, Node.js 20+ LTS |
| Excel format | .xlsx (Excel 2016+) |

---

## 7. Out of Scope (MVP)

- LINE Notify integration
- Multi-campus / multi-room
- Student login (self-service ใช้รหัสเปิด ไม่ต้อง auth)
- Automated session open/close by schedule
- LDAP / SSO
- Mobile App (Native)