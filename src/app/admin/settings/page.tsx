'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UserItem {
  id: number;
  username: string;
  displayName: string | null;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: authSession } = useSession();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwType, setPwType] = useState<'success' | 'error'>('success');

  // Users management state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form states for Add / Edit user
  const [formUsername, setFormUsername] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'SCANNER' | 'BACKOFFICE'>('SCANNER');
  const [userModalError, setUserModalError] = useState('');
  const [userModalLoading, setUserModalLoading] = useState(false);

  // Cleanup state
  const [cleanup, setCleanup] = useState<{ eligible: boolean; daysLeft?: number; cutoffDate?: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/cleanup').then(r => r.json()).then(setCleanup);
    fetchUsers();
  }, [fetchUsers]);

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
      body: JSON.stringify({ currentPassword, newPassword }),
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

  const openAddUser = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormDisplayName('');
    setFormPassword('');
    setFormRole('SCANNER');
    setUserModalError('');
    setShowAddModal(true);
  };

  const openEditUser = (u: UserItem) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormDisplayName(u.displayName || '');
    setFormPassword('');
    setFormRole(u.role === 'SCANNER' ? 'SCANNER' : 'BACKOFFICE');
    setUserModalError('');
    setShowAddModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');
    setUserModalLoading(true);

    try {
      if (editingUser) {
        // Edit existing
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUser.id,
            username: formUsername,
            displayName: formDisplayName,
            role: formRole,
            password: formPassword.trim() ? formPassword.trim() : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setUserModalError(data.error || 'เกิดข้อผิดพลาดในการแก้ไข');
        } else {
          setShowAddModal(false);
          fetchUsers();
        }
      } else {
        // Add new
        if (!formPassword || formPassword.length < 6) {
          setUserModalError('กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร');
          setUserModalLoading(false);
          return;
        }

        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formUsername,
            displayName: formDisplayName,
            role: formRole,
            password: formPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setUserModalError(data.error || 'เกิดข้อผิดพลาดในการสร้างบัญชี');
        } else {
          setShowAddModal(false);
          fetchUsers();
        }
      }
    } catch (err) {
      console.error(err);
      setUserModalError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setUserModalLoading(false);
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (!confirm(`ยืนยันการลบบัญชีผู้ใช้ "${user.username}" หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
      } else {
        alert(`❌ ไม่สามารถลบได้: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบบัญชี');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('⚠️ ต้องการลบข้อมูลทั้งหมด (นิสิต, รอบ, การเช็คชื่อ) หรือไม่?\nการกระทำนี้ไม่สามารถย้อนกลับได้!'))
      return;
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
    <div className="max-w-4xl space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]">settings</span>
          ตั้งค่าระบบ & จัดการผู้ใช้งาน
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          จัดการบัญชีเจ้าหน้าที่สแกน เจ้าหน้าที่หลังบ้าน และความปลอดภัยของระบบ
        </p>
      </div>

      {/* ── Section 1: User Accounts Management ── */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-outline-variant/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">manage_accounts</span>
              จัดการบัญชีเจ้าหน้าที่ (User Accounts)
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              กำหนดสิทธิ์เจ้าหน้าที่สแกนบัตร (Scanner) และเจ้าหน้าที่หลังบ้าน (Backoffice Admin)
            </p>
          </div>
          <button
            type="button"
            onClick={openAddUser}
            className="px-4 py-2.5 bg-primary hover:bg-primary-container text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 shadow-xs shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            เพิ่มบัญชีเจ้าหน้าที่
          </button>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-surface-container-low text-on-surface font-semibold text-xs border-b border-outline-variant/30">
              <tr>
                <th className="px-4 py-3">ชื่อผู้ใช้ (Username)</th>
                <th className="px-4 py-3">ชื่อ-นามสกุล / ตำแหน่ง</th>
                <th className="px-4 py-3 text-center">สิทธิ์การใช้งาน (Role)</th>
                <th className="px-4 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loadingUsers ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-on-surface-variant text-xs">
                    กำลังโหลดข้อมูลผู้ใช้...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-on-surface-variant text-xs">
                    ยังไม่มีข้อมูลผู้ใช้
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center text-xs font-bold">
                          {u.username.charAt(0).toUpperCase()}
                        </span>
                        <span>{u.username}</span>
                        {authSession?.user?.name === u.username && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
                            คุณ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {u.displayName || <span className="text-outline italic">ไม่ระบุ</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.role === 'SCANNER' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1]">
                          <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                          เจ้าหน้าที่สแกน
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed-variant">
                          <span className="material-symbols-outlined text-[14px]">shield_person</span>
                          เจ้าหน้าที่หลังบ้าน
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditUser(u)}
                          title="แก้ไขบัญชี / เปลี่ยนรหัสผ่าน"
                          className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high text-on-surface text-xs font-medium transition flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px] text-primary">edit</span>
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          disabled={users.length <= 1}
                          title="ลบบัญชี"
                          className="px-2.5 py-1.5 rounded-lg border border-outline-variant/60 hover:bg-error-container hover:text-on-error-container text-outline hover:border-error text-xs transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 2: Change Password (Current Logged In User) ── */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-outline-variant/30">
        <h2 className="font-bold text-lg mb-1 text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">lock_reset</span>
          เปลี่ยนรหัสผ่านสำหรับบัญชีของคุณ
        </h2>
        <p className="text-xs text-on-surface-variant mb-4">
          เข้าสู่ระบบในนาม: <strong className="text-primary font-semibold">{authSession?.user?.name}</strong>
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">รหัสผ่านปัจจุบัน</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm bg-surface-container-low focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm bg-surface-container-low focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm bg-surface-container-low focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {pwMsg && (
            <p className={`text-xs font-semibold p-2.5 rounded-lg ${pwType === 'success' ? 'bg-[#ECFDF5] text-primary' : 'bg-[#FEF2F2] text-error'}`}>
              {pwMsg}
            </p>
          )}
          <button
            type="submit"
            className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs"
          >
            เปลี่ยนรหัสผ่าน
          </button>
        </form>
      </div>

      {/* ── Section 3: Data Retention Policy ── */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-l-error border border-outline-variant/30">
        <h2 className="font-bold text-lg mb-2 text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[22px]">auto_delete</span>
          นโยบายการเก็บรักษาข้อมูล (30 วัน)
        </h2>
        {cleanup ? (
          <>
            {cleanup.eligible ? (
              <div>
                <p className="text-primary text-sm mb-3 font-semibold">✅ ครบ 30 วันแล้ว สามารถลบข้อมูลทั้งหมดได้</p>
                <button
                  type="button"
                  onClick={handleCleanup}
                  className="bg-error hover:bg-[#B91C1C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  ลบข้อมูลทั้งหมด
                </button>
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm">
                ⏳ ยังไม่ถึงกำหนด — อีก <strong className="text-error font-bold">{cleanup.daysLeft} วัน</strong> จึงจะสามารถลบข้อมูลรอบได้
              </p>
            )}
          </>
        ) : (
          <p className="text-on-surface-variant text-sm">ยังไม่มีข้อมูลรอบในระบบ</p>
        )}
      </div>

      {/* ── Modal Add / Edit User ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-outline-variant/30 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  {editingUser ? 'manage_accounts' : 'person_add'}
                </span>
                {editingUser ? `แก้ไขบัญชีผู้ใช้: ${editingUser.username}` : 'เพิ่มบัญชีเจ้าหน้าที่ใหม่'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-error text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  ชื่อผู้ใช้ (Username) *
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={e => setFormUsername(e.target.value)}
                  placeholder="เช่น scanner1 หรือ admin2"
                  required
                  className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm bg-surface-container-low focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  ชื่อ-นามสกุล หรือชื่อเรียกเจ้าหน้าที่
                </label>
                <input
                  type="text"
                  value={formDisplayName}
                  onChange={e => setFormDisplayName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี (จุดสแกน 1)"
                  className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm bg-surface-container-low focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  สิทธิ์การใช้งาน (Role) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormRole('SCANNER')}
                    className={`p-3 rounded-xl border text-left transition ${
                      formRole === 'SCANNER'
                        ? 'border-primary bg-primary-fixed/20 text-primary font-bold ring-2 ring-primary/20'
                        : 'border-outline-variant/60 bg-white text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                      <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                      เจ้าหน้าที่สแกน
                    </div>
                    <span className="text-[10px] text-on-surface-variant block leading-tight">
                      สแกนและเช็คชื่อหน้างาน
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('BACKOFFICE')}
                    className={`p-3 rounded-xl border text-left transition ${
                      formRole === 'BACKOFFICE'
                        ? 'border-primary bg-primary-fixed/20 text-primary font-bold ring-2 ring-primary/20'
                        : 'border-outline-variant/60 bg-white text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                      <span className="material-symbols-outlined text-[18px]">shield_person</span>
                      เจ้าหน้าที่หลังบ้าน
                    </div>
                    <span className="text-[10px] text-on-surface-variant block leading-tight">
                      เข้าถึงระบบแอดมินทั้งหมด
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  {editingUser ? 'รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)' : 'รหัสผ่าน (Password) *'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder={editingUser ? 'กรอกเฉพาะเมื่อต้องการตั้งรหัสใหม่' : 'อย่างน้อย 6 ตัวอักษร'}
                  required={!editingUser}
                  minLength={formPassword ? 6 : undefined}
                  className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm bg-surface-container-low focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {userModalError && (
                <p className="text-xs font-semibold p-2.5 rounded-lg bg-[#FEF2F2] text-error">
                  {userModalError}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={userModalLoading}
                  className="px-6 py-2 bg-primary hover:bg-primary-container text-white text-sm font-semibold rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  {userModalLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
