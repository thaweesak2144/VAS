'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: authSession } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwType, setPwType] = useState<'success' | 'error'>('success');
  const [cleanup, setCleanup] = useState<{ eligible: boolean; daysLeft?: number; cutoffDate?: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/cleanup').then(r => r.json()).then(setCleanup);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg('รหัสผ่านใหม่ไม่ตรงกัน');
      setPwType('error');
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      setPwType('error');
      return;
    }

    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (res.ok) {
      setPwMsg('✅ เปลี่ยนรหัสผ่านสำเร็จ');
      setPwType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      const data = await res.json();
      setPwMsg(`❌ ${data.error === 'Wrong current password' ? 'รหัสผ่านปัจจุบันไม่ถูกต้อง' : 'ผิดพลาด'}`);
      setPwType('error');
    }
    setTimeout(() => setPwMsg(''), 4000);
  };

  const handleCleanup = async () => {
    if (!confirm('⚠️ ต้องการลบข้อมูลทั้งหมด (นิสิต, รอบ, การเช็คชื่อ) หรือไม่?\nการกระทำนี้ไม่สามารถย้อนกลับได้!')) return;
    const res = await fetch('/api/admin/cleanup', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      alert('✅ ลบข้อมูลทั้งหมดสำเร็จ');
      window.location.href = '/admin/sessions';
    } else {
      alert(`❌ ไม่สามารถลบได้: ${data.error}`);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-text-main">⚙️ ตั้งค่าระบบ</h1>

      {/* Admin Info */}
      <div className="bg-white rounded-xl shadow-card p-6 mb-6 border border-border">
        <h2 className="font-semibold text-lg mb-3 text-text-main">ข้อมูลผู้ดูแลระบบ</h2>
        <p className="text-text-muted">เข้าสู่ระบบในนาม: <strong className="text-primary">{authSession?.user?.name}</strong></p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-card p-6 mb-6 border border-border">
        <h2 className="font-semibold text-lg mb-4 text-text-main">เปลี่ยนรหัสผ่าน Admin</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">รหัสผ่านปัจจุบัน</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">รหัสผ่านใหม่</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {pwMsg && <p className={`text-sm font-medium ${pwType === 'success' ? 'text-success' : 'text-error'}`}>{pwMsg}</p>}
          <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition">
            เปลี่ยนรหัสผ่าน
          </button>
        </form>
      </div>

      {/* Data Retention */}
      <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-l-error border border-border">
        <h2 className="font-semibold text-lg mb-3 text-text-main">นโยบายการเก็บข้อมูล (30 วัน)</h2>
        {cleanup ? (
          <>
            {cleanup.eligible ? (
              <div>
                <p className="text-success mb-3 font-medium">✅ ครบ 30 วันแล้ว สามารถลบข้อมูลทั้งหมดได้</p>
                <button onClick={handleCleanup}
                  className="bg-error hover:bg-[#B91C1C] text-white px-6 py-2 rounded-lg font-medium transition">
                  🗑️ ลบข้อมูลทั้งหมด
                </button>
              </div>
            ) : (
              <p className="text-text-muted">
                ⏳ ยังไม่ถึงกำหนด — อีก <strong className="text-error">{cleanup.daysLeft} วัน</strong> จึงจะสามารถลบข้อมูลได้
              </p>
            )}
          </>
        ) : (
          <p className="text-text-muted text-sm">ยังไม่มีข้อมูลรอบ (ยังไม่ได้สร้างตาราง)</p>
        )}
      </div>
    </div>
  );
}
