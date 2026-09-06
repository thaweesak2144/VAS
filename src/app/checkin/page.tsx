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
  const [clock, setClock] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Manual Entry States
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const manualInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/sessions/active')
      .then(res => res.json())
      .then(data => { if (data.id) setActiveSession(data); });
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const processCheckin = async (codeToSubmit: string, isManual = false) => {
    if (!codeToSubmit.trim()) return;
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentCode: codeToSubmit.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'สแกนสำเร็จ! บันทึกเวลาแล้ว', student: data.student });
      } else if (data.error === 'DUPLICATE') {
        setStatus({ type: 'duplicate', message: 'แจ้งเตือน: สแกนซ้ำในรอบนี้', subMessage: `รหัสนิสิต ${codeToSubmit} ได้สแกนชื่อในรอบนี้ไปแล้ว` });
      } else if (data.error === 'NOT_FOUND') {
        setStatus({ type: 'error', message: 'ข้อผิดพลาด: ไม่พบข้อมูลนิสิต', subMessage: `ไม่พบรหัส ${codeToSubmit} ในระบบ` });
      } else {
        setStatus({ type: 'error', message: 'ข้อผิดพลาด', subMessage: data.message || 'เกิดข้อผิดพลาดบางอย่าง' });
      }
    } catch {
      setStatus({ type: 'error', message: 'ระบบขัดข้อง', subMessage: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
    }
    if (isManual) { setManualCode(''); manualInputRef.current?.focus(); }
    else { setStudentCode(''); inputRef.current?.focus(); }
    setTimeout(() => setStatus(null), 6000);
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); processCheckin(studentCode, false); };
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckin(manualCode, true);
    setShowManualModal(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased">
      <div className="px-space-lg py-space-md max-w-[1280px] w-full mx-auto flex flex-col gap-space-lg">

        {/* ── Heroic Status Deck ── */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
          {/* Ambient gradient */}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 via-tertiary-fixed/10 to-transparent pointer-events-none blur-3xl" />

          <div className="flex flex-col gap-space-xs z-10">
            <div className="flex items-center gap-space-sm flex-wrap">
              {activeSession ? (
                <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping" />
                  สถานะ: กำลังเปิดรับสแกน (Active)
                </span>
              ) : (
                <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  ยังไม่มีการเปิดรอบสแกน
                </span>
              )}
              <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">desktop_windows</span>
                จุดสแกนเช็คชื่อหลัก
              </span>
              <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[15px]">usb</span>
                USB HID Scanner พร้อมใช้งาน
              </span>
            </div>

            <div className="flex flex-col mt-space-2xs">
              {activeSession ? (
                <>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    รอบที่ {activeSession.roundNumber} : วันที่ {activeSession.dayNumber} {activeSession.roundName} ({activeSession.startTime} - {activeSession.endTime} น.)
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">mindfulness</span>
                    โครงการปฏิบัติธรรมวิปัสสนากัมมัฏฐาน ประจำปีการศึกษา 2567 • ศาลาปฏิบัติธรรมกลาง ชั้น 2
                  </p>
                </>
              ) : (
                <h1 className="font-headline-lg text-headline-lg text-on-surface-variant">
                  กรุณาให้ Admin เปิดรอบการเช็คชื่อก่อนเริ่มสแกน
                </h1>
              )}
            </div>
          </div>

          {/* Live clock */}
          <div className="flex items-center gap-space-md z-10 w-full lg:w-auto justify-between lg:justify-end">
            <div className="bg-surface-container-low px-space-lg py-space-sm rounded-xl flex flex-col items-end min-w-[170px]">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">เวลาปัจจุบัน (ICT)</span>
              <span className="font-code-md text-[28px] leading-8 font-semibold text-primary tracking-tight">{clock}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">ระบบเทียบเวลาเซิร์ฟเวอร์</span>
            </div>
          </div>
        </div>

        {/* ── Main Workspace: 2-column ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">

          {/* Left: Scanner Input (7 cols) */}
          <div className="xl:col-span-7 flex flex-col gap-space-lg">

            {/* Barcode Input Stage */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md relative">
              <div className="flex items-center justify-between">
                <label className="font-title-lg text-title-lg text-on-surface flex items-center gap-space-xs" htmlFor="barcode-input">
                  <span className="material-symbols-outlined text-primary text-[24px]">barcode_scanner</span>
                  กล่องสแกนบาร์โค้ดบัตรนิสิต
                </label>
                <div className="flex items-center gap-space-xs text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-label-sm text-label-sm text-primary font-semibold">Auto-Focus ล็อกเป้าพร้อมยิง</span>
                </div>
              </div>

              {/* Input field */}
              <div className="relative flex items-center">
                <div className="absolute left-space-md flex items-center pointer-events-none text-primary">
                  <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
                </div>
                <form onSubmit={handleSubmit} className="w-full">
                  <input
                    ref={inputRef}
                    id="barcode-input"
                    type="text"
                    value={studentCode}
                    onChange={e => setStudentCode(e.target.value)}
                    placeholder="ยิงบาร์โค้ดบัตรนิสิต (Code 128) หรือพิมพ์รหัส..."
                    className="w-full h-16 pl-16 pr-48 rounded-xl bg-surface-container-low text-on-surface font-code-md text-headline-sm placeholder:text-outline/70 transition-all duration-200 outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_3px_rgba(0,69,50,0.2)]"
                    autoFocus
                    autoComplete="off"
                    disabled={!activeSession}
                  />
                  <button
                    type="button"
                    onClick={() => setShowManualModal(true)}
                    disabled={!activeSession}
                    className="absolute right-[7rem] top-2 bottom-2 px-space-md rounded-lg bg-surface-container text-on-surface-variant font-label-lg text-label-lg flex items-center gap-space-2xs hover:bg-surface-container-high transition-all disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[18px]">keyboard</span>
                    พิมพ์รหัส
                  </button>
                  <button
                    type="submit"
                    disabled={!activeSession || !studentCode.trim()}
                    className="absolute right-2 top-2 bottom-2 px-space-md rounded-lg bg-primary text-on-primary font-label-lg text-label-lg flex items-center gap-space-2xs hover:bg-primary-container transition-all active:scale-95 shadow-sm disabled:opacity-40"
                  >
                    <span>บันทึก</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </form>
              </div>

              {/* Helper legend */}
              <div className="flex items-center justify-between flex-wrap gap-space-xs pt-space-2xs">
                <div className="flex items-center gap-space-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">keyboard_return</span>
                  <span className="font-label-sm text-label-sm">เครื่องสแกนบาร์โค้ดจะกด Enter ทันทีเมื่ออ่านค่าเสร็จ (HID Standard)</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high font-code-md text-label-sm text-on-surface">Code 128</span>
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high font-code-md text-label-sm text-on-surface">QR Code</span>
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high font-code-md text-label-sm text-on-surface">8 หลัก</span>
                </div>
              </div>
            </div>

            {/* Live Feedback Card */}
            {status ? (
              <div className={`rounded-xl p-space-lg shadow-sm relative overflow-hidden flex flex-col gap-space-md transition-all ${
                status.type === 'success' ? 'bg-surface-container-lowest' :
                status.type === 'duplicate' ? 'bg-[#FFFBEB]' : 'bg-error-container/30'
              }`}>
                {/* Edge indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                  status.type === 'success' ? 'bg-primary-container' :
                  status.type === 'duplicate' ? 'bg-[#F59E0B]' : 'bg-error'
                }`} />
                <div className="flex items-center justify-between pl-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      status.type === 'success' ? 'bg-primary-fixed text-on-primary-fixed' :
                      status.type === 'duplicate' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-error-container text-on-error-container'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">
                        {status.type === 'success' ? 'check_circle' : status.type === 'duplicate' ? 'warning' : 'error'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-headline-sm text-headline-sm tracking-tight ${
                        status.type === 'success' ? 'text-primary' :
                        status.type === 'duplicate' ? 'text-[#92400E]' : 'text-error'
                      }`}>{status.message}</span>
                      {status.subMessage && <span className="font-label-sm text-label-sm text-on-surface-variant">{status.subMessage}</span>}
                    </div>
                  </div>
                </div>

                {status.student && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-space-md bg-surface-container-low/80 p-space-md rounded-xl ml-space-xs">
                    <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[36px] text-on-surface-variant">person</span>
                    </div>
                    <div className="flex flex-col gap-space-xs w-full">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-2xs">
                        <div>
                          <span className="font-code-md text-title-lg text-primary font-bold tracking-wider">{status.student.studentCode}</span>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{status.student.fullName}</h3>
                        </div>
                        <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          เข้าตรงเวลา (On Time)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-space-sm mt-space-2xs pt-space-xs bg-surface-container-lowest/70 p-space-xs rounded-lg">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-outline">กลุ่ม</span>
                          <span className="font-body-md text-body-md text-on-surface font-medium">{status.student.groupName}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-outline">ความก้าวหน้า</span>
                          <div className="flex items-center gap-space-xs mt-0.5">
                            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden flex-1">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${(status.student.attended / 40) * 100}%` }} />
                            </div>
                            <span className="font-code-md text-label-sm text-primary font-bold">{status.student.attended}/40</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm relative overflow-hidden flex flex-col gap-space-md opacity-40">
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-surface-container-high" />
                <div className="flex items-center gap-space-sm pl-space-xs">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px] text-on-surface-variant">person</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface-variant">รอการสแกนบัตร...</span>
                    <span className="font-label-sm text-label-sm text-outline">ผลลัพธ์จะแสดงที่นี่หลังสแกน</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Instructions (5 cols) */}
          <div className="xl:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">info</span>
                <span className="font-title-lg text-title-lg text-on-surface">คู่มือการใช้งาน</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {[
                  { icon: 'badge', text: 'ชี้บาร์โค้ดที่บัตรนิสิตเข้าหาเครื่องอ่าน' },
                  { icon: 'qr_code_scanner', text: 'เครื่องอ่านจะส่งรหัสและกด Enter อัตโนมัติ' },
                  { icon: 'check_circle', text: 'ระบบบันทึกเวลาและแสดงผลใน < 1 วินาที' },
                  { icon: 'keyboard', text: 'กดปุ่ม "พิมพ์รหัส" หากบาร์โค้ดสแกนไม่ผ่าน' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
                    <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-primary text-[16px]">{step.icon}</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-tertiary text-[18px]">shield</span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">ระบบป้องกันการสแกนซ้ำ</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">นิสิตแต่ละคนสามารถสแกนได้เพียง 1 ครั้งต่อรอบ ระบบจะแจ้งเตือนหากพบการสแกนซ้ำ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-space-lg py-space-md border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="font-title-lg text-title-lg text-on-surface flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">keyboard</span>
                บันทึกรหัสนิสิตแบบแมนนวล
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-on-surface-variant hover:text-error text-xl font-bold leading-none">×</button>
            </div>
            <div className="p-space-lg">
              <form onSubmit={handleManualSubmit}>
                <label className="block font-label-lg text-label-lg text-on-surface mb-space-xs">รหัสประจำตัวนิสิต</label>
                <input
                  ref={manualInputRef}
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  placeholder="กรอกรหัสนิสิต (เช่น 66012345)"
                  className="w-full px-space-md py-space-sm bg-surface-container-low border border-outline-variant rounded-xl font-code-md text-title-lg text-on-surface focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,69,50,0.2)] focus:bg-surface-container-lowest"
                  autoFocus
                />
                <div className="mt-space-lg flex justify-end gap-space-sm">
                  <button type="button" onClick={() => setShowManualModal(false)}
                    className="px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container rounded-lg font-label-lg text-label-lg transition-colors">
                    ยกเลิก
                  </button>
                  <button type="submit" disabled={!manualCode.trim()}
                    className="px-space-lg py-space-sm bg-primary text-on-primary font-label-lg text-label-lg rounded-lg hover:bg-primary-container transition-all active:scale-95 disabled:opacity-40 flex items-center gap-space-2xs">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
