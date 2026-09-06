'use client';

import { useState } from 'react';

interface AttendanceEntry {
  sessionId: number;
  scannedAt: string;
  session: {
    dayNumber: number;
    roundNumber: number;
    roundName: string;
    sessionDate: string;
    startTime: string;
  };
}

interface StatusData {
  student: {
    studentCode: string;
    fullName: string;
    groupName: string;
    attendances: AttendanceEntry[];
  };
  sessions: {
    id: number;
    dayNumber: number;
    roundNumber: number;
    roundName: string;
    startTime: string;
    endTime: string;
  }[];
  attended: number;
  total: number;
  percent: number;
}

export default function MyStatusPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<StatusData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    const res = await fetch(`/api/mystatus?code=${encodeURIComponent(code.trim())}`);
    if (res.ok) {
      const data = await res.json();
      setResult(data);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 text-primary">🧘</div>
          <h1 className="text-3xl font-bold text-text-main">ตรวจสอบเวลาและผลการเข้าร่วมโครงการ</h1>
          <p className="text-text-muted mt-2 text-sm">
            โครงการพัฒนาจิตและฝึกอบรมวิปัสสนากรรมฐาน ระยะเวลา 10 วัน รวมทั้งสิ้น 40 รอบการฝึกปฏิบัติ<br/>
            (เกณฑ์ผ่านการประเมินรับรองมาตรฐานต้องมีเวลาเข้าร่วมไม่น้อยกว่า 80% หรือ 32 รอบขึ้นไป)
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">🪪</span>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="กรอกรหัสนิสิต เช่น 6501234567"
              className="w-full border-2 border-border rounded-xl pl-12 pr-5 py-3 text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
            />
          </div>
          <button type="submit" disabled={loading}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold text-lg transition disabled:opacity-50">
            {loading ? '...' : 'ตรวจสอบ'}
          </button>
        </form>

        {notFound && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded-xl p-5 text-center font-medium">
            ❌ ไม่พบรหัสนิสิต &quot;{code}&quot; ในระบบ
          </div>
        )}

        {result && (() => {
          const { student, sessions, attended, total, percent } = result;
          const attendedSet = new Set(student.attendances.map(a => a.sessionId));
          const days = Array.from(new Set(sessions.map(s => s.dayNumber))).sort((a, b) => a - b);
          const roundNames = ['', 'เช้ามืด', 'เช้า', 'บ่าย', 'เย็น'];

          return (
            <div>
              {/* Student Card */}
              <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-5">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-surface-low rounded-full flex items-center justify-center text-xl">👤</div>
                  <div>
                    <h2 className="text-xl font-bold text-text-main">{student.fullName}</h2>
                    <p className="text-text-muted text-sm mt-0.5">
                      รหัส: <span className="font-mono text-primary font-medium">{student.studentCode}</span> • {student.groupName}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2 text-sm font-medium">
                    <span className="text-text-muted">ความคืบหน้า: {attended} / {total} รอบ</span>
                    <span className={`font-bold ${percent >= 80 ? 'text-success' : percent >= 50 ? 'text-warning' : 'text-error'}`}>
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-low rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${percent >= 80 ? 'bg-success' : percent >= 50 ? 'bg-warning' : 'bg-error'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {percent >= 80 ? (
                    <p className="text-xs text-success mt-2 font-medium flex items-center gap-1">✓ ผ่านเกณฑ์ที่กำหนด</p>
                  ) : (
                    <p className="text-xs text-warning mt-2 font-medium flex items-center gap-1">⚠ ต้องเข้าร่วมอีก {32 - attended} รอบเพื่อผ่านเกณฑ์</p>
                  )}
                </div>
              </div>

              {/* Attendance Grid */}
              <div className="bg-white rounded-2xl shadow-card border border-border p-6">
                <h3 className="font-bold text-text-main mb-5 flex items-center gap-2">
                  <span className="text-primary">📅</span> ตารางเวลาปฏิบัติธรรม 10 วัน (40 รอบ)
                </h3>
                
                {/* Round header */}
                <div className="grid grid-cols-5 gap-3 mb-3">
                  <div className="text-center text-xs text-text-muted font-semibold uppercase tracking-wider">วัน / Day</div>
                  {[1, 2, 3, 4].map(r => (
                    <div key={r} className="text-center text-xs text-text-muted font-semibold uppercase tracking-wider">{roundNames[r]}</div>
                  ))}
                </div>
                {days.map(day => {
                  const daySessions = sessions.filter(s => s.dayNumber === day);
                  return (
                    <div key={day} className="grid grid-cols-5 gap-3 mb-3">
                      <div className="flex items-center justify-center text-sm font-bold text-text-main bg-surface-low rounded-xl border border-border">
                        {day}
                      </div>
                      {[1, 2, 3, 4].map(r => {
                        const sess = daySessions.find(s => s.roundNumber === r);
                        if (!sess) return <div key={r} className="h-12 rounded-xl bg-surface" />;
                        const attended = attendedSet.has(sess.id);
                        return (
                          <div key={r} title={`${sess.startTime} - ${sess.endTime}`}
                            className={`h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${attended ? 'bg-primary-light text-success border border-success border-opacity-30' : 'bg-surface text-slate-300 border border-border border-dashed'}`}>
                            {attended ? '✓' : '—'}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
