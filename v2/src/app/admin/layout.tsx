'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { href: '/admin/sessions',  icon: '📅', label: 'ภาพรวมระบบ' },
  { href: '/admin/students',  icon: '👥', label: 'จัดการนิสิตและกลุ่ม' },
  { href: '/admin/cards',     icon: '🪪', label: 'พิมพ์บัตรสแกน' },
  { href: '/admin/reports',   icon: '📊', label: 'ตารางประเมินผล 40 รอบ' },
  { href: '/admin/settings',  icon: '⚙️', label: 'ตั้งค่าระบบ' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex min-h-screen" style={{ background: '#F8FAFC' }}>
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: '#FFFFFF', borderRight: '1px solid #E2E8F0' }}>
        {/* Brand */}
        <div className="p-5 border-b" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
              style={{ background: '#065F46' }}>
              🧘
            </div>
            <div>
              <p className="font-bold text-sm leading-tight" style={{ color: '#0F172A' }}>ระบบบันทึกเวลา</p>
              <p className="text-xs" style={{ color: '#64748B' }}>ปฏิบัติธรรมวิปัสสนา</p>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <div className="px-4 pt-4 pb-1">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94A3B8' }}>เมนูหลัก</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 pb-4">
          {navItems.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background:  active ? '#065F46' : 'transparent',
                  color:       active ? '#FFFFFF' : '#334155',
                }}>
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t mt-3" style={{ borderColor: '#E2E8F0' }}>
            <Link href="/checkin" target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ color: '#0D9488' }}>
              <span className="text-base">🖥️</span>
              <span>จุดสแกนเช็คชื่อ</span>
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ color: '#DC2626' }}>
              <span className="text-base">🚪</span>
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </nav>

        {/* Meditation Hall status footer */}
        <div className="m-3 p-3 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #A7F3D0' }}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#059669' }} />
            <span className="text-xs font-semibold" style={{ color: '#065F46' }}>ศาลาปฏิบัติธรรมกลาง</span>
          </div>
          <p className="text-xs" style={{ color: '#64748B' }}>รอบที่ 14/40 • ภาวนากลางวัน</p>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b bg-white no-print"
          style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-4 text-sm" style={{ color: '#64748B' }}>
            <span>📅 โครงการปฏิบัติธรรม 10 วัน</span>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span>🕐 {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: '#065F46' }}>
              {session?.user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <span className="text-sm font-medium" style={{ color: '#334155' }}>
              {session?.user?.name ?? 'Admin'}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
