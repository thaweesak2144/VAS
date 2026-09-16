'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import * as XLSX from 'xlsx';
import { isCheckinLate } from '@/lib/timeRules';
import { isScanner as checkIsScanner } from '@/lib/permissions';

interface Session {
  id: number;
  dayNumber: number;
  roundNumber: number;
  roundName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
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

const ROUND_NAMES = ['', 'เช้า', 'สาย', 'บ่าย', 'เย็น'];

export default function ReportsPage() {
  const { data: authSession } = useSession();
  const userRole = authSession?.user?.role || 'BACKOFFICE';
  const isScanner = checkIsScanner(userRole);

  const [data, setData] = useState<ReportData | null>(null);
  const [filterGroup, setFilterGroup] = useState('');
  const [search, setSearch] = useState('');
  const [loadingCell, setLoadingCell] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const url = filterGroup ? `/api/reports?group=${encodeURIComponent(filterGroup)}` : '/api/reports';
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
  }, [filterGroup]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCell = async (studentId: number, sessionId: number) => {
    if (isScanner) return; // Prevent scanners from modifying attendance
    const key = `${studentId}-${sessionId}`;
    setLoadingCell(key);

    // Optimistic UI update
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        students: prev.students.map(st => {
          if (st.id !== studentId) return st;
          const exists = st.attendances.some(a => a.sessionId === sessionId);
          return {
            ...st,
            attendances: exists
              ? st.attendances.filter(a => a.sessionId !== sessionId)
              : [...st.attendances, { sessionId, scannedAt: new Date().toISOString() }],
          };
        }),
      };
    });

    try {
      await fetch('/api/attendance/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, sessionId }),
      });
    } catch (err) {
      console.error(err);
      fetchData();
    } finally {
      setLoadingCell(null);
    }
  };

  const exportExcel = () => {
    if (!data) return;
    const headers = [
      'รหัสนิสิต',
      'ชื่อ-นามสกุล',
      'กลุ่ม',
      ...data.sessions.map(s => `วัน${s.dayNumber} ${s.roundName}`),
      'รวม (รอบ)',
      '% สะสม',
    ];

    const rows = data.students.map(s => {
      const attMap = new Map(s.attendances.map(a => [a.sessionId, a.scannedAt]));
      const attended = data.sessions.filter(sess => attMap.has(sess.id)).length;
      const pct = data.sessions.length > 0 ? Math.round((attended / data.sessions.length) * 100) : 0;
      return [
        s.studentCode,
        s.fullName,
        s.groupName,
        ...data.sessions.map(sess => {
          const scannedAt = attMap.get(sess.id);
          if (!scannedAt) return '-';
          return isCheckinLate(sess.sessionDate, sess.endTime, new Date(scannedAt), sess.startTime) ? 'สาย' : 'มา';
        }),
        attended,
        `${pct}%`,
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ตารางประเมินผล');
    XLSX.writeFile(wb, 'attendance_matrix_report.xlsx');
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-medium text-sm">กำลังโหลดข้อมูลตารางประเมินผล...</p>
        </div>
      </div>
    );
  }

  // Group sessions by Day 1..10
  const days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const sessionsByDay: { [day: number]: Session[] } = {};
  days.forEach(d => {
    sessionsByDay[d] = [1, 2, 3, 4].map(roundNum => {
      const found = data.sessions.find(s => s.dayNumber === d && s.roundNumber === roundNum);
      return (
        found || {
          id: -(d * 10 + roundNum),
          dayNumber: d,
          roundNumber: roundNum,
          roundName: ROUND_NAMES[roundNum],
          sessionDate: '',
          startTime: '',
          endTime: '',
        }
      );
    });
  });

  const filteredStudents = data.students.filter(
    s =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.includes(search) ||
      s.groupName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span>ตารางประเมินผล 40 รอบ (Attendance Matrix)</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            คลิกเซลล์เพื่อเปลี่ยนสถานะ (ไม่มา ➔ มา) • บันทึกอัตโนมัติทันที
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="ค้นหาชื่อ / รหัส..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs border border-outline-variant rounded-lg bg-surface-container-low focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <select
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value)}
            className="px-3 py-1.5 text-xs border border-outline-variant rounded-lg bg-surface-container-low focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">ทุกกลุ่ม</option>
            {data.groups.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <button
            onClick={exportExcel}
            className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary-fixed/40 hover:bg-primary-fixed/80 rounded-lg transition-colors flex items-center gap-1"
          >
            <span>📥</span> ส่งออก Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors flex items-center gap-1"
          >
            <span>🖨️</span> พิมพ์
          </button>
        </div>
      </div>

      {/* Main Table Container matching the exact screenshot */}
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        {/* Table note */}
        <div className={`px-4 py-2.5 text-xs border-b ${
          isScanner
            ? 'bg-amber-50/80 text-amber-800 border-amber-200'
            : 'text-on-surface-variant/80 bg-[#FFFDF7] border-outline-variant/20'
        }`}>
          {isScanner
            ? '🔒 โหมดดูข้อมูลเท่านั้น (Read-Only) — เฉพาะเจ้าหน้าที่หลังบ้านเท่านั้นที่มีสิทธิ์แก้ไขสถานะในตารางนี้'
            : 'คลิกเซลล์เพื่อเปลี่ยนสถานะ (ไม่มา ➔ มา ➔ สาย ➔ ขาด ➔ ไม่มา)'}
        </div>

        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-center border-collapse select-none text-[11px]">
            {/* Header */}
            <thead>
              {/* Row 1: Days */}
              <tr className="border-b border-outline-variant/30">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-30 bg-white px-4 py-2 text-left font-medium text-on-surface-variant border-r border-outline-variant/30 min-w-[140px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]"
                >
                  ชื่อ-สกุล
                </th>
                {days.map(d => (
                  <th
                    key={d}
                    colSpan={4}
                    className={`py-2 px-1 font-medium border-r border-outline-variant/20 ${
                      d === 1
                        ? 'bg-[#FFF8E7] text-[#B45309] font-bold border-b border-[#FDE68A]'
                        : 'bg-white text-on-surface-variant'
                    }`}
                  >
                    วันที่ {d}
                  </th>
                ))}
              </tr>

              {/* Row 2: Sub-rounds: เช้า สาย บ่าย เย็น */}
              <tr className="border-b border-outline-variant/30 bg-[#FAFAFA] text-[10px] text-on-surface-variant/70">
                {days.map(d => (
                  <Fragment key={`rounds-${d}`}>
                    <th className="py-1 px-0.5 w-7 font-normal">เช้า</th>
                    <th className="py-1 px-0.5 w-7 font-normal">สาย</th>
                    <th className="py-1 px-0.5 w-7 font-normal">บ่าย</th>
                    <th className="py-1 px-0.5 w-7 font-normal border-r border-outline-variant/20">เย็น</th>
                  </Fragment>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {filteredStudents.map(student => {
                return (
                  <tr key={student.id} className="hover:bg-[#F9FAFB] transition-colors group">
                    {/* Student Name & Code (Sticky Left) */}
                    <td className="sticky left-0 z-20 bg-white group-hover:bg-[#F9FAFB] px-4 py-2.5 text-left border-r border-outline-variant/30 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                      <div className="font-medium text-on-surface leading-tight text-xs">
                        {student.fullName}
                      </div>
                      <div className="text-[10px] text-on-surface-variant/60 font-mono mt-0.5">
                        {student.studentCode}
                      </div>
                    </td>

                    {/* 40 Round Cells (4 rounds x 10 days) */}
                    {days.map(d => {
                      const daySessions = sessionsByDay[d];
                      return daySessions.map(sess => {
                        const hasRealSession = sess.id > 0;
                        const attendance = hasRealSession ? student.attendances.find(a => a.sessionId === sess.id) : null;
                        const isAttended = !!attendance;

                        // Check if attended late
                        const isLate = attendance && sess.endTime && sess.sessionDate
                          ? isCheckinLate(sess.sessionDate, sess.endTime, new Date(attendance.scannedAt), sess.startTime)
                          : false;

                        const isCellLoading = loadingCell === `${student.id}-${sess.id}`;

                        return (
                          <td
                            key={`cell-${d}-${sess.roundNumber}`}
                            className={`p-1 border-r border-outline-variant/10 text-center ${
                              sess.roundNumber === 4 ? 'border-r-outline-variant/30' : ''
                            }`}
                          >
                            <button
                              type="button"
                              disabled={!hasRealSession || isCellLoading || isScanner}
                              onClick={() => hasRealSession && !isScanner && toggleCell(student.id, sess.id)}
                              title={
                                !hasRealSession
                                  ? `วันที่ ${d} ${sess.roundName} (ยังไม่ได้สร้างรอบ)`
                                  : isScanner
                                  ? `${student.fullName} • ${isAttended ? (isLate ? 'มาสาย (L)' : 'ตรงเวลา (✓)') : 'ยังไม่มา'}`
                                  : `${student.fullName} • วันที่ ${d} ${sess.roundName} (${
                                      isAttended
                                        ? isLate
                                          ? 'มาสาย (L) - คลิกเพื่อยกเลิก'
                                          : 'ตรงเวลา (✓) - คลิกเพื่อยกเลิก'
                                        : 'ยังไม่มา - คลิกเพื่อเช็คชื่อ'
                                    })`
                              }
                              className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-medium transition-all mx-auto ${
                                !hasRealSession
                                  ? 'bg-gray-100/60 text-gray-300 cursor-not-allowed'
                                  : isAttended
                                  ? isLate
                                    ? `bg-[#FEF3C7] text-[#D97706] font-bold shadow-xs ${isScanner ? 'cursor-default' : 'hover:bg-[#FDE68A]'}`
                                    : `bg-[#ECFDF5] text-[#059669] font-bold shadow-xs ${isScanner ? 'cursor-default' : 'hover:bg-[#D1FAE5]'}`
                                  : isScanner
                                  ? 'bg-[#F3F4F6] text-gray-400 cursor-default'
                                  : 'bg-[#F3F4F6] text-gray-400 hover:bg-gray-200 cursor-pointer active:scale-95'
                              }`}
                            >
                              {isCellLoading ? (
                                <span className="inline-block w-2.5 h-2.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                              ) : isAttended ? (
                                isLate ? (
                                  'L'
                                ) : (
                                  '✓'
                                )
                              ) : (
                                '-'
                              )}
                            </button>
                          </td>
                        );
                      });
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
