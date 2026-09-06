'use client';

import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

interface Session {
  id: number;
  dayNumber: number;
  roundNumber: number;
  roundName: string;
  sessionDate: string;
  startTime: string;
}

interface StudentReport {
  id: number;
  studentCode: string;
  fullName: string;
  groupName: string;
  attendances: { sessionId: number; scannedAt: string }[];
}

interface ReportData {
  students: StudentReport[];
  sessions: Session[];
  groups: string[];
}

function pct(attended: number, total: number) {
  return total > 0 ? Math.round((attended / total) * 100) : 0;
}

function colorClass(p: number) {
  if (p >= 80) return 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]';
  if (p >= 50) return 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]';
  return 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]';
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [filterGroup, setFilterGroup] = useState('');
  const [view, setView] = useState<'grid' | 'person'>('grid');
  const [searchCode, setSearchCode] = useState('');
  const [personResult, setPersonResult] = useState<StudentReport | null>(null);

  const fetchData = useCallback(async () => {
    const url = filterGroup ? `/api/reports?group=${filterGroup}` : '/api/reports';
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
  }, [filterGroup]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportExcel = () => {
    if (!data) return;
    const headers = ['รหัสนิสิต', 'ชื่อ-นามสกุล', 'กลุ่ม',
      ...data.sessions.map(s => `วัน${s.dayNumber} ${s.roundName}`),
      'รวม', '%'
    ];
    const rows = data.students.map(s => {
      const attendedSet = new Set(s.attendances.map(a => a.sessionId));
      const total = data.sessions.length;
      const attended = data.sessions.filter(sess => attendedSet.has(sess.id)).length;
      return [
        s.studentCode, s.fullName, s.groupName,
        ...data.sessions.map(sess => attendedSet.has(sess.id) ? '✓' : ''),
        attended, pct(attended, total)
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
    XLSX.writeFile(wb, 'attendance_report.xlsx');
  };

  const searchPerson = () => {
    if (!data || !searchCode) return;
    const found = data.students.find(s => s.studentCode === searchCode.trim());
    setPersonResult(found || null);
  };

  if (!data) return <div className="text-center py-12 text-text-muted">กำลังโหลดข้อมูล...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-text-main">📊 รายงานการเข้าร่วม</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setView('grid')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'grid' ? 'bg-primary text-white' : 'bg-white border border-border text-text-main hover:bg-surface-low'}`}>
            📋 ตาราง Grid
          </button>
          <button onClick={() => setView('person')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'person' ? 'bg-primary text-white' : 'bg-white border border-border text-text-main hover:bg-surface-low'}`}>
            👤 รายบุคคล
          </button>
          <button onClick={exportExcel} className="bg-white border border-border hover:bg-surface-low text-text-main px-4 py-2 rounded-lg text-sm font-medium transition">
            📤 ส่งออก Excel
          </button>
          <button onClick={() => window.print()} className="bg-white border border-border hover:bg-surface-low text-text-main px-4 py-2 rounded-lg text-sm font-medium transition">
            🖨️ พิมพ์ PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-card p-4 text-center border border-border">
          <div className="text-3xl font-bold text-primary">{data.students.length}</div>
          <div className="text-text-muted text-sm mt-1">นิสิตทั้งหมด</div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 text-center border border-border">
          <div className="text-3xl font-bold text-secondary">{data.sessions.length}</div>
          <div className="text-text-muted text-sm mt-1">รอบทั้งหมด</div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 text-center border border-border">
          <div className="text-3xl font-bold text-success">
            {data.students.filter(s => pct(s.attendances.length, data.sessions.length) >= 80).length}
          </div>
          <div className="text-text-muted text-sm mt-1">ผ่านเกณฑ์ ≥80%</div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 text-center border border-border">
          <div className="text-3xl font-bold text-error">
            {data.students.filter(s => pct(s.attendances.length, data.sessions.length) < 50).length}
          </div>
          <div className="text-text-muted text-sm mt-1">ต่ำกว่าเกณฑ์ &lt;50%</div>
        </div>
      </div>

      {view === 'grid' && (
        <>
          <div className="flex gap-3 mb-4">
            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">ทุกกลุ่ม</option>
              {data.groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-card overflow-x-auto border border-border">
            <table className="text-xs w-full">
              <thead className="bg-surface-low text-secondary border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left sticky left-0 bg-surface-low shadow-[1px_0_0_#E2E8F0]">รหัสนิสิต</th>
                  <th className="px-3 py-2 text-left sticky left-24 bg-surface-low shadow-[1px_0_0_#E2E8F0]">ชื่อ</th>
                  <th className="px-3 py-2 border-r border-border">กลุ่ม</th>
                  {data.sessions.map(s => (
                    <th key={s.id} className="px-2 py-2 text-center" style={{ minWidth: 40 }}>
                      D{s.dayNumber}<br />{s.roundNumber}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center border-l border-border">รวม</th>
                  <th className="px-3 py-2 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((s, i) => {
                  const attendedSet = new Set(s.attendances.map(a => a.sessionId));
                  const attended = data.sessions.filter(sess => attendedSet.has(sess.id)).length;
                  const p = pct(attended, data.sessions.length);
                  return (
                    <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                      <td className="px-3 py-2 font-mono sticky left-0 bg-inherit shadow-[1px_0_0_#E2E8F0]">{s.studentCode}</td>
                      <td className="px-3 py-2 sticky left-24 bg-inherit whitespace-nowrap shadow-[1px_0_0_#E2E8F0]">{s.fullName}</td>
                      <td className="px-3 py-2 text-center border-r border-border">
                        <span className="bg-surface px-2 py-0.5 rounded text-[10px] text-text-muted border border-border">{s.groupName}</span>
                      </td>
                      {data.sessions.map(sess => (
                        <td key={sess.id} className="px-1 py-2 text-center border-b border-[#F1F5F9]">
                          {attendedSet.has(sess.id) ? <span className="text-success font-bold">✓</span> : <span className="text-gray-200">—</span>}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center font-bold border-l border-border">{attended}/{data.sessions.length}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass(p)}`}>{p}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'person' && (
        <div className="bg-white rounded-xl shadow-card p-6 border border-border">
          <h2 className="font-semibold text-lg mb-4 text-text-main">ค้นหารายบุคคล</h2>
          <div className="flex gap-3 mb-6">
            <input type="text" placeholder="รหัสนิสิต" value={searchCode} onChange={e => setSearchCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchPerson()}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={searchPerson} className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition">ค้นหา</button>
          </div>

          {personResult && (() => {
            const attendedSet = new Set(personResult.attendances.map(a => a.sessionId));
            const attended = data.sessions.filter(s => attendedSet.has(s.id)).length;
            const p = pct(attended, data.sessions.length);
            const days = Array.from(new Set(data.sessions.map(s => s.dayNumber))).sort((a, b) => a - b);

            return (
              <div>
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-text-main">{personResult.fullName}</h3>
                  <p className="text-text-muted">รหัส: <span className="font-mono text-primary">{personResult.studentCode}</span> | กลุ่ม: {personResult.groupName}</p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1 text-text-main">
                    <span>การเข้าร่วม: {attended}/{data.sessions.length} รอบ</span>
                    <span className={`font-bold ${p >= 80 ? 'text-success' : p >= 50 ? 'text-warning' : 'text-error'}`}>{p}%</span>
                  </div>
                  <div className="w-full bg-surface-low rounded-full h-4">
                    <div className={`h-4 rounded-full ${p >= 80 ? 'bg-success' : p >= 50 ? 'bg-warning' : 'bg-error'}`}
                      style={{ width: `${p}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-10 gap-2">
                  {days.map(day => (
                    <div key={day}>
                      <div className="text-center text-xs text-text-muted mb-1">วัน{day}</div>
                      {data.sessions.filter(s => s.dayNumber === day).map(sess => (
                        <div key={sess.id} title={`${sess.roundName} ${sess.startTime}`}
                          className={`h-8 rounded mb-1 flex items-center justify-center text-xs font-bold ${attendedSet.has(sess.id) ? 'bg-success text-white' : 'bg-surface-low text-slate-300'}`}>
                          {attendedSet.has(sess.id) ? '✓' : sess.roundNumber}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {searchCode && !personResult && (
            <p className="text-error">ไม่พบรหัสนิสิต &quot;{searchCode}&quot; ในระบบ</p>
          )}
        </div>
      )}
    </div>
  );
}
