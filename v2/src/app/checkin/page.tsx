'use client';

import { useState, useEffect, useRef } from 'react';

interface CheckinStatus {
  type: 'success' | 'error' | 'duplicate';
  message: string;
  subMessage?: string;
  student?: {
    fullName: string;
    studentCode: string;
    groupName: string;
    attended: number;
  };
}

interface ActiveSessionData {
  id?: number;
  roundNumber?: number;
  dayNumber?: number;
  roundName?: string;
  startTime?: string;
  endTime?: string;
}

export default function CheckinPage() {
  const [studentCode, setStudentCode] = useState('');
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSessionData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/sessions/active')
      .then(res => res.json())
      .then(data => {
        if (data.id) setActiveSession(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) return;

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentCode: studentCode.trim() })
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: 'success',
          message: 'สแกนสำเร็จ! บันทึกเวลาแล้ว',
          student: data.student,
        });
      } else {
        if (data.error === 'DUPLICATE') {
          setStatus({
            type: 'duplicate',
            message: 'แจ้งเตือน: สแกนซ้ำในรอบนี้',
            subMessage: `รหัสนิสิต ${studentCode} ได้สแกนชื่อในรอบนี้ไปแล้ว`,
          });
        } else if (data.error === 'NOT_FOUND') {
          setStatus({
            type: 'error',
            message: 'ข้อผิดพลาด: ไม่พบข้อมูลนิสิต',
            subMessage: `ไม่พบรหัสบาร์โค้ด ${studentCode} ในระบบ`,
          });
        } else {
          setStatus({
            type: 'error',
            message: 'ข้อผิดพลาด',
            subMessage: data.message || 'เกิดข้อผิดพลาดบางอย่าง'
          });
        }
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'ระบบขัดข้อง',
        subMessage: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
      });
    }

    setStudentCode('');
    inputRef.current?.focus();
    setTimeout(() => setStatus(null), 5000);
  };

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border mb-6">
          <div className="flex items-center gap-3 mb-4">
            {activeSession ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white pulse-dot"></span>
                สถานะ: กำลังเปิดรับสแกน (ACTIVE)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                ยังไม่มีการเปิดรอบสแกน
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-light text-secondary-700 flex items-center gap-2">
              <span className="text-sm">💻</span> USB HID Scanner พร้อมใช้งาน
            </span>
          </div>

          {activeSession ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-text-main mb-2">
                รอบที่ {activeSession.roundNumber} : วันที่ {activeSession.dayNumber} {activeSession.roundName} ({activeSession.startTime} - {activeSession.endTime} น.)
              </h1>
              <p className="text-text-muted text-sm flex items-center gap-2">
                <span className="text-lg">📍</span> โครงการปฏิบัติธรรมวิปัสสนากรรมฐาน ประจำปีการศึกษา 2567 • ศาลาปฏิบัติธรรมกลาง ชั้น 2
              </p>
            </>
          ) : (
            <h1 className="text-2xl font-bold text-text-muted">กรุณาให้ Admin เปิดรอบการเช็คชื่อก่อนเริ่มสแกน</h1>
          )}
        </div>

        {/* Scanner Input Section */}
        <div className="bg-white rounded-xl p-8 shadow-card border border-border mb-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <span className="text-2xl">🪪</span> กล่องสแกนบาร์โค้ดบัตรนิสิต
            </h2>
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary"></span> Auto-Focus ล็อกเป้าพร้อมยิง
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-3xl opacity-50">📱</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="ยิงบาร์โค้ดบัตรนิสิต (Code 128) หรือพิมพ์ที่นี่..."
              className="w-full pl-16 pr-32 py-5 bg-surface-card border-2 border-border rounded-xl text-2xl font-mono text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-light transition-all"
              autoFocus
              autoComplete="off"
              disabled={!activeSession}
            />
            <button
              type="submit"
              disabled={!activeSession || !studentCode.trim()}
              className="absolute inset-y-2 right-2 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              บันทึก ➔
            </button>
          </form>

          <p className="mt-4 text-sm text-text-muted flex items-center gap-2">
            <span>↵ เครื่องสแกนบาร์โค้ดจะกด Enter ทันทีเมื่ออ่านค่าเสร็จ (HID Standard)</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">Code 128</span>
          </p>
        </div>

        {/* Status Messages */}
        <div className="h-40"> {/* Fixed height to prevent layout shift */}
          {status && (
            <div className={`p-6 rounded-xl border-l-4 shadow-sm animate-[slideIn_0.3s_ease-out] flex gap-5 ${
              status.type === 'success' ? 'bg-primary-light border-success' :
              status.type === 'duplicate' ? 'bg-[#FFFBEB] border-warning' :
              'bg-[#FEF2F2] border-error'
            }`}>
              <div className="flex-shrink-0 pt-1">
                {status.type === 'success' && <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center text-white text-xl">✓</div>}
                {status.type === 'duplicate' && <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center text-white text-xl">!</div>}
                {status.type === 'error' && <div className="w-10 h-10 bg-error rounded-full flex items-center justify-center text-white text-xl">✗</div>}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-1 ${
                  status.type === 'success' ? 'text-primary' :
                  status.type === 'duplicate' ? 'text-[#92400E]' :
                  'text-[#991B1B]'
                }`}>
                  {status.message}
                </h3>
                
                {status.subMessage && (
                  <p className="text-sm text-text-muted mb-3">{status.subMessage}</p>
                )}

                {status.student && (
                  <div className="mt-4 bg-white rounded-lg p-4 shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <p className="text-lg font-bold text-text-main">{status.student.fullName}</p>
                      <p className="text-sm text-text-muted font-mono">{status.student.studentCode}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-text-muted">กลุ่ม: {status.student.groupName}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
