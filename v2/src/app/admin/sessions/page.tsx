'use client';

import { useState, useEffect, useCallback } from 'react';

interface Session {
  id: number;
  dayNumber: number;
  roundNumber: number;
  roundName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  _count: { attendances: number };
}

const ROUND_COLORS = ['', '#6366F1', '#0D9488', '#D97706', '#DC2626'];
const ROUND_LIGHT  = ['', '#EEF2FF', '#CCFBF1', '#FFFBEB', '#FEF2F2'];

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(true);

  const fetchSessions = useCallback(async () => {
    const res = await fetch('/api/sessions');
    const data = await res.json();
    setSessions(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const showMsg = (text: string, ok = true) => {
    setMsg(text); setMsgOk(ok);
    setTimeout(() => setMsg(''), 4000);
  };

  const generateSessions = async () => {
    if (!startDate) return;
    setLoading(true);
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate })
    });
    const data = await res.json();
    showMsg(data.success ? `✅ สร้าง ${data.count} รอบสำเร็จ` : '❌ ผิดพลาด', data.success);
    await fetchSessions();
    setLoading(false);
  };

  const toggleSession = async (s: Session) => {
    if (s.isActive) {
      await fetch('/api/sessions/active', { method: 'DELETE' });
    } else {
      await fetch('/api/sessions/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: s.id })
      });
    }
    await fetchSessions();
  };

  const days = Array.from(new Set(sessions.map(s => s.dayNumber))).sort((a, b) => a - b);
  const activeSession = sessions.find(s => s.isActive);
  const totalCheckins = sessions.reduce((sum, s) => sum + s._count.attendances, 0);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          ภาพรวมและศูนย์ควบคุมรอบปฏิบัติธรรม
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748B' }}>
          โครงการวิปัสสนากรรมฐาน · 40 Sessions Engine
        </p>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background: msgOk ? '#ECFDF5' : '#FEF2F2', color: msgOk ? '#065F46' : '#991B1B', border: `1px solid ${msgOk ? '#A7F3D0' : '#FECACA'}` }}>
          {msg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'รอบทั้งหมด', value: sessions.length, sub: 'sessions', icon: '📅', color: '#065F46' },
          { label: 'เช็คชื่อรวม', value: totalCheckins, sub: 'ครั้ง', icon: '✅', color: '#059669' },
          { label: 'รอบที่เสร็จแล้ว', value: sessions.filter(s => s._count.attendances > 0).length, sub: 'รอบ', icon: '🏁', color: '#1E3A8A' },
          { label: 'รอบที่เปิดอยู่', value: activeSession ? 1 : 0, sub: activeSession ? activeSession.roundName : 'ไม่มี', icon: '🟢', color: '#0F766E' },
        ].map((c, i) => (
          <div key={i} className="rounded-xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(6,95,70,0.04)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: '#64748B' }}>{c.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: c.color }}>{c.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{c.sub}</p>
              </div>
              <span className="text-2xl">{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Session Banner */}
      {activeSession && (
        <div className="rounded-xl p-5 mb-6" style={{ background: '#065F46', color: 'white' }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-300 pulse-dot" />
                <span className="text-sm font-medium text-green-200">SESSION กำลังรับสแกน</span>
              </div>
              <h2 className="text-2xl font-bold">
                รอบที่ {activeSession.roundNumber}: วันที่ {activeSession.dayNumber} {activeSession.roundName}
              </h2>
              <p className="text-green-200 text-sm mt-1">{activeSession.startTime} – {activeSession.endTime} น. · เช็คชื่อแล้ว {activeSession._count.attendances} คน</p>
            </div>
            <button onClick={() => toggleSession(activeSession)}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm transition"
              style={{ background: '#DC2626', color: 'white' }}>
              ⏹ ปิด Session นี้
            </button>
          </div>
        </div>
      )}

      {/* Generate Sessions */}
      {sessions.length === 0 && (
        <div className="rounded-xl p-6 bg-white mb-6" style={{ border: '1px solid #E2E8F0' }}>
          <h2 className="font-semibold text-lg mb-3" style={{ color: '#0F172A' }}>สร้างตารางรอบอัตโนมัติ (40 รอบ)</h2>
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="block text-sm mb-1" style={{ color: '#64748B' }}>วันเริ่มต้นโครงการ</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="rounded-lg px-4 py-2 text-sm" 
                style={{ border: '1px solid #CBD5E1', outline: 'none', color: '#0F172A' }} />
            </div>
            <button onClick={generateSessions} disabled={!startDate || loading}
              className="px-6 py-2 rounded-lg font-semibold text-sm text-white transition disabled:opacity-40"
              style={{ background: '#065F46' }}>
              {loading ? 'กำลังสร้าง...' : '⚡ สร้าง 40 รอบอัตโนมัติ'}
            </button>
          </div>
        </div>
      )}

      {/* Sessions Grid */}
      {days.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold" style={{ color: '#0F172A' }}>ความคืบหน้ารายรอบ</h2>
            <span className="text-sm" style={{ color: '#64748B' }}>{sessions.length} รอบ · {days.length} วัน</span>
          </div>
          {days.map(day => {
            const daySessions = sessions.filter(s => s.dayNumber === day);
            const date = new Date(daySessions[0].sessionDate);
            const dateStr = date.toLocaleDateString('th-TH', { weekday: 'short', month: 'short', day: 'numeric' });
            return (
              <div key={day} className="rounded-xl bg-white overflow-hidden" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(6,95,70,0.04)' }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#065F46' }}>{day}</span>
                    <span className="font-semibold text-sm" style={{ color: '#0F172A' }}>วันที่ {day}</span>
                    <span className="text-sm" style={{ color: '#64748B' }}>{dateStr}</span>
                  </div>
                  <span className="text-xs" style={{ color: '#94A3B8' }}>
                    {daySessions.reduce((s, r) => s + r._count.attendances, 0)} เช็คชื่อ
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
                  {daySessions.map(s => (
                    <div key={s.id} className="rounded-lg p-3 transition"
                      style={{
                        background: s.isActive ? '#ECFDF5' : ROUND_LIGHT[s.roundNumber],
                        border: s.isActive ? '2px solid #059669' : `1px solid ${ROUND_COLORS[s.roundNumber]}22`,
                      }}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold" style={{ color: s.isActive ? '#065F46' : ROUND_COLORS[s.roundNumber] }}>{s.roundName}</span>
                        {s.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#059669', color: 'white' }}>
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>{s.startTime}–{s.endTime}</p>
                      <p className="text-xs font-medium mb-2" style={{ color: '#065F46' }}>✓ {s._count.attendances} คน</p>
                      <button onClick={() => toggleSession(s)}
                        className="w-full text-xs py-1.5 rounded-lg font-medium text-white transition"
                        style={{ background: s.isActive ? '#DC2626' : '#065F46' }}>
                        {s.isActive ? 'ปิดรอบ' : 'เปิดรอบ'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
