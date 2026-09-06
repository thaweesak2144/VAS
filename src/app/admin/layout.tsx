'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { href: '/admin/sessions',  icon: 'dashboard',       label: 'ภาพรวมระบบ' },
  { href: '/admin/students',  icon: 'groups',           label: 'จัดการนิสิตและกลุ่ม' },
  { href: '/admin/reports',   icon: 'grid_on',          label: 'ตารางประเมินผล 40 รอบ' },
  { href: '/admin/cards',     icon: 'badge',            label: 'พิมพ์บัตรสแกน' },
  { href: '/admin/settings',  icon: 'settings',         label: 'ตั้งค่าระบบ' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── LEFT SIDEBAR (Stitch exact) ── */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-space-lg">
        <div className="flex flex-col">
          {/* Brand */}
          <div className="px-space-lg mb-space-xl flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[22px]">spa</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight">ระบบบันทึกเวลา</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">ปฏิบัติธรรมวิปัสสนาฯ</span>
            </div>
          </div>

          {/* Nav label */}
          <div className="px-space-md mb-space-sm">
            <span className="px-space-sm font-label-sm text-label-sm uppercase tracking-wider text-outline">เมนูหลัก</span>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-space-2xs px-space-md">
            {navItems.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-container text-on-primary font-title-lg text-title-lg'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="my-space-xs border-t border-outline-variant" />

            {/* Checkin link */}
            <Link
              href="/checkin"
              target="_blank"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-tertiary">qr_code_scanner</span>
              <span>จุดสแกนเช็คชื่อ</span>
            </Link>

            {/* Student self-service */}
            <Link
              href="/mystatus"
              target="_blank"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">person_search</span>
              <span>สำหรับนิสิต (ตรวจผล)</span>
            </Link>

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-label-lg text-label-lg transition-colors w-full text-left"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>ออกจากระบบ</span>
            </button>
          </nav>
        </div>

        {/* Footer – current session status */}
        <div className="px-space-md">
          <div className="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[22px]">spa</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">ศาลาปฏิบัติธรรมกลาง</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="pl-72 flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg no-print">
          <div className="flex items-center gap-space-md">
            <span className="px-space-sm py-space-2xs rounded-full bg-surface-container-high font-label-sm text-label-sm text-on-surface flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              โครงการปฏิบัติธรรม 10 วัน
            </span>
            <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-tertiary">event</span>
              <span>{new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="flex flex-col text-right">
              <span className="font-label-lg text-label-lg text-on-surface leading-tight">{session?.user?.name ?? 'Admin'}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">ผู้ดูแลระบบ (Admin)</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-16 bg-background min-h-screen overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
