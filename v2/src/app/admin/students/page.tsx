'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';

interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  groupName: string;
  _count: { attendances: number };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ studentCode: '', fullName: '', groupName: '' });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchStudents = useCallback(async () => {
    const res = await fetch('/api/students');
    const data = await res.json();
    setStudents(data);
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editStudent ? 'PUT' : 'POST';
    const url = editStudent ? `/api/students/${editStudent.id}` : '/api/students';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      showMsg(editStudent ? '✅ แก้ไขสำเร็จ' : '✅ เพิ่มนิสิตสำเร็จ');
      setShowForm(false);
      setEditStudent(null);
      setForm({ studentCode: '', fullName: '', groupName: '' });
      await fetchStudents();
    } else {
      showMsg('❌ รหัสนิสิตซ้ำหรือข้อมูลไม่ถูกต้อง', 'error');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ต้องการลบ "${name}" ออกจากระบบ?`)) return;
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    showMsg('✅ ลบสำเร็จ');
    await fetchStudents();
  };

  const handleEdit = (s: Student) => {
    setEditStudent(s);
    setForm({ studentCode: s.studentCode, fullName: s.fullName, groupName: s.groupName });
    setShowForm(true);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<{ studentCode?: string; fullName?: string; groupName?: string }>(ws);

        const students = (rows as Record<string, unknown>[]).map(r => ({
          studentCode: String(r.studentCode || r['รหัสนิสิต'] || ''),
          fullName: String(r.fullName || r['ชื่อ-นามสกุล'] || r['ชื่อ'] || ''),
          groupName: String(r.groupName || r['กลุ่ม'] || r['หมู่เรียน'] || ''),
        })).filter(s => s.studentCode && s.fullName && s.groupName);

        const res = await fetch('/api/students/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students })
        });
        const result = await res.json();
        showMsg(`✅ นำเข้าสำเร็จ ${result.imported} คน (ข้าม ${result.skipped} คน)`);
        await fetchStudents();
      } catch {
        showMsg('❌ ไฟล์ไม่ถูกต้อง', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const data = filtered.map(s => ({
      'รหัสนิสิต': s.studentCode,
      'ชื่อ-นามสกุล': s.fullName,
      'กลุ่ม': s.groupName,
      'เข้าร่วม (ครั้ง)': s._count.attendances,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อนิสิต');
    XLSX.writeFile(wb, 'students.xlsx');
  };

  const groups = Array.from(new Set(students.map(s => s.groupName))).sort();
  const filtered = students.filter(s => {
    const matchSearch = !search || s.studentCode.includes(search) || s.fullName.includes(search);
    const matchGroup = !filterGroup || s.groupName === filterGroup;
    return matchSearch && matchGroup;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-text-main">👥 รายชื่อนิสิต ({students.length} คน)</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => fileRef.current?.click()}
            className="bg-white border border-border hover:bg-surface-low text-text-main px-4 py-2 rounded-lg text-sm font-medium transition">
            📥 Import CSV
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleImport} />
          <button onClick={handleExport}
            className="bg-white border border-border hover:bg-surface-low text-text-main px-4 py-2 rounded-lg text-sm font-medium transition">
            📤 ส่งออก Excel
          </button>
          <button onClick={() => { setShowForm(true); setEditStudent(null); setForm({ studentCode: '', fullName: '', groupName: '' }); }}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + เพิ่มนิสิต
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msgType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input type="text" placeholder="ค้นหารหัส/ชื่อ..." value={search} onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">ทุกกลุ่ม</option>
          {groups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-5 mb-5 border border-border">
          <h2 className="font-semibold text-lg mb-4 text-text-main">{editStudent ? 'แก้ไขข้อมูลนิสิต' : 'เพิ่มนิสิตใหม่'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input required placeholder="รหัสนิสิต" value={form.studentCode} onChange={e => setForm({ ...form, studentCode: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            <input required placeholder="ชื่อ-นามสกุล" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            <input required placeholder="กลุ่ม/หมู่เรียน" value={form.groupName} onChange={e => setForm({ ...form, groupName: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition">บันทึก</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-surface-low hover:bg-border text-text-main px-6 py-2 rounded-lg font-medium transition">ยกเลิก</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-border">
        <table className="w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">รหัสนิสิต</th>
              <th className="px-4 py-3 text-left font-semibold">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-left font-semibold">กลุ่ม</th>
              <th className="px-4 py-3 text-center font-semibold">เข้าร่วม</th>
              <th className="px-4 py-3 text-center font-semibold">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-low'}>
                <td className="px-4 py-3 font-mono text-text-main">{s.studentCode}</td>
                <td className="px-4 py-3 text-text-main">{s.fullName}</td>
                <td className="px-4 py-3">
                  <span className="bg-primary-light text-primary px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">{s.groupName}</span>
                </td>
                <td className="px-4 py-3 text-center font-semibold">{s._count.attendances}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 hover:underline mr-3">แก้ไข</button>
                  <button onClick={() => handleDelete(s.id, s.fullName)} className="text-red-600 hover:underline">ลบ</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
