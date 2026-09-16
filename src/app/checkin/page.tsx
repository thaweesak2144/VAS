'use client';

import { useState, useEffect, useRef } from 'react';

interface CheckinStatus {
  type: 'success' | 'error' | 'duplicate';
  message: string;
  subMessage?: string;
  isLate?: boolean;
  statusLabel?: string;
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
  const [isTvMode, setIsTvMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Manual Entry States
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const manualInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkActive = () => {
      fetch('/api/sessions/active')
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setActiveSession(data);
          } else {
            setActiveSession(null);
          }
        })
        .catch(err => console.error(err));
    };

    checkActive();
    const interval = setInterval(checkActive, 10000);
    return () => clearInterval(interval);
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Fullscreen toggle
  const toggleTvMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsTvMode(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsTvMode(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsTvMode(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const processCheckin = async (codeToSubmit: string, isManual = false) => {
    if (!codeToSubmit.trim()) return;
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentCode: codeToSubmit.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({
          type: 'success',
          message: data.isLate ? 'สแกนสำเร็จ! บันทึกเวลา: สาย' : 'สแกนสำเร็จ! บันทึกเวลาแล้ว',
          subMessage: data.isLate ? 'เกินเวลาปกติ ปรับสถานะเป็นมาสาย' : undefined,
          isLate: data.isLate,
          statusLabel: data.statusLabel,
          student: data.student,
        });
      } else if (data.error === 'DUPLICATE') {
        setStatus({
          type: 'duplicate',
          message: 'แจ้งเตือน: สแกนซ้ำในรอบนี้',
          subMessage: `รหัสนิสิต ${codeToSubmit} ได้สแกนชื่อในรอบนี้ไปแล้ว`,
        });
      } else if (data.error === 'NOT_FOUND') {
        setStatus({
          type: 'error',
          message: 'ข้อผิดพลาด: ไม่พบข้อมูลนิสิต',
          subMessage: `ไม่พบรหัส ${codeToSubmit} ในระบบ`,
        });
      } else {
        setStatus({
          type: 'error',
          message: 'ข้อผิดพลาด',
          subMessage: data.message || 'เกิดข้อผิดพลาดบางอย่าง',
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'ระบบขัดข้อง',
        subMessage: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
      });
    }
    if (isManual) {
      setManualCode('');
      manualInputRef.current?.focus();
    } else {
      setStudentCode('');
      inputRef.current?.focus();
    }
    setTimeout(() => setStatus(null), isTvMode ? 8000 : 6000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckin(studentCode, false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckin(manualCode, true);
    setShowManualModal(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div
      className={`min-h-screen bg-background font-body-md text-on-surface antialiased transition-all ${
        isTvMode ? 'p-6 flex flex-col justify-center' : ''
      }`}
    >
      <div
        className={`w-full mx-auto flex flex-col gap-space-lg transition-all ${
          isTvMode ? 'max-w-[1600px] gap-6' : 'max-w-[1280px] px-space-lg py-space-md'
        }`}
      >
        {/* ── Top Status Banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg border border-outline-variant/30">
          {/* Ambient gradient */}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 via-tertiary-fixed/10 to-transparent pointer-events-none blur-3xl" />

          <div className="flex flex-col gap-space-xs z-10">
            <div className="flex items-center gap-space-sm flex-wrap">
              {activeSession ? (
                <span
                  className={`inline-flex items-center gap-space-2xs rounded-full bg-primary-container text-on-primary font-semibold tracking-wide uppercase ${
                    isTvMode ? 'px-4 py-1.5 text-sm' : 'px-space-sm py-space-2xs text-xs'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed animate-ping" />
                  สถานะ: กำลังเปิดรับสแกน (Active)
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-space-2xs rounded-full bg-error-container text-on-error-container font-semibold ${
                    isTvMode ? 'px-4 py-1.5 text-sm' : 'px-space-sm py-space-2xs text-xs'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-error" />
                  ยังไม่มีการเปิดรอบสแกน
                </span>
              )}
              <span
                className={`inline-flex items-center gap-space-2xs rounded-full bg-surface-container text-on-surface-variant font-medium ${
                  isTvMode ? 'px-4 py-1.5 text-sm' : 'px-space-sm py-space-2xs text-xs'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-primary">desktop_windows</span>
                จุดสแกนเช็คชื่อหลัก
              </span>
              <span
                className={`inline-flex items-center gap-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-medium ${
                  isTvMode ? 'px-4 py-1.5 text-sm' : 'px-space-sm py-space-2xs text-xs'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">usb</span>
                USB HID Scanner พร้อมใช้งาน
              </span>
            </div>

            <div className="flex flex-col mt-space-2xs">
              {activeSession ? (
                <>
                  <h1
                    className={`font-bold text-on-surface tracking-tight ${
                      isTvMode ? 'text-3xl lg:text-4xl' : 'text-2xl lg:text-3xl font-headline-lg'
                    }`}
                  >
                    รอบที่ {activeSession.roundNumber} : วันที่ {activeSession.dayNumber}{' '}
                    {activeSession.roundName} ({activeSession.startTime} - {activeSession.endTime} น.)
                  </h1>
                  <p
                    className={`text-on-surface-variant flex items-center gap-space-xs ${
                      isTvMode ? 'text-base mt-1' : 'text-sm mt-0.5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-tertiary">mindfulness</span>
                    โครงการปฏิบัติธรรมวิปัสสนากัมมัฏฐาน ประจำปีการศึกษา 2567 • ศาลาปฏิบัติธรรมกลาง ชั้น 2
                  </p>
                </>
              ) : (
                <h1 className="text-2xl font-headline-lg text-on-surface-variant">
                  กรุณาให้ Admin เปิดรอบการเช็คชื่อก่อนเริ่มสแกน
                </h1>
              )}
            </div>
          </div>

          {/* Live clock + TV/Projector Button */}
          <div className="flex items-center gap-4 z-10 w-full lg:w-auto justify-between lg:justify-end">
            <div
              className={`bg-surface-container-low rounded-2xl flex flex-col items-end border border-outline-variant/30 ${
                isTvMode ? 'px-6 py-3 min-w-[220px]' : 'px-space-lg py-space-sm min-w-[170px]'
              }`}
            >
              <span className="text-xs uppercase tracking-wider text-outline font-medium">เวลาปัจจุบัน (ICT)</span>
              <span
                className={`font-semibold text-primary tracking-tight font-code-md ${
                  isTvMode ? 'text-4xl leading-tight' : 'text-[28px] leading-8'
                }`}
              >
                {clock}
              </span>
              <span className="text-[11px] text-on-surface-variant">ระบบเทียบเวลาเซิร์ฟเวอร์</span>
            </div>

            {/* TV / Projector Toggle Button */}
            <button
              type="button"
              onClick={toggleTvMode}
              title={isTvMode ? 'ออกจากโหมดทีวี / โปรเจกเตอร์' : 'เปิดโหมดทีวี / โปรเจกเตอร์ (Full Screen)'}
              className={`rounded-2xl border flex items-center justify-center transition-all ${
                isTvMode
                  ? 'w-14 h-14 bg-primary text-white border-primary shadow-md hover:bg-primary-container'
                  : 'w-12 h-12 bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-high hover:text-primary shadow-xs'
              }`}
            >
              <span className="material-symbols-outlined text-[26px]">
                {isTvMode ? 'fullscreen_exit' : 'tv'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Main Workspace ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Left: Scanner Input (7 cols on normal, 8 cols on TV mode) */}
          <div className={`flex flex-col gap-space-lg ${isTvMode ? 'xl:col-span-8' : 'xl:col-span-7'}`}>
            {/* Barcode Input Stage */}
            <div
              className={`bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-md relative border border-outline-variant/30 ${
                isTvMode ? 'p-8' : 'p-space-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <label
                  className={`font-semibold text-on-surface flex items-center gap-space-xs ${
                    isTvMode ? 'text-2xl' : 'text-lg font-title-lg'
                  }`}
                  htmlFor="barcode-input"
                >
                  <span className="material-symbols-outlined text-primary text-[28px]">barcode_scanner</span>
                  กล่องสแกนบาร์โค้ดบัตรนิสิต
                </label>
                <div className="flex items-center gap-space-xs text-on-surface-variant">
                  <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span
                    className={`text-primary font-semibold ${isTvMode ? 'text-base' : 'text-xs font-label-sm'}`}
                  >
                    Auto-Focus ล็อกเป้าพร้อมยิง
                  </span>
                </div>
              </div>

              {/* Input field */}
              <div className="relative flex items-center">
                <div className="absolute left-space-md flex items-center pointer-events-none text-primary">
                  <span className={`material-symbols-outlined ${isTvMode ? 'text-[40px]' : 'text-[32px]'}`}>
                    qr_code_scanner
                  </span>
                </div>
                <form onSubmit={handleSubmit} className="w-full">
                  <input
                    ref={inputRef}
                    id="barcode-input"
                    type="text"
                    value={studentCode}
                    onChange={e => setStudentCode(e.target.value)}
                    placeholder="ยิงบาร์โค้ดบัตรนิสิต (Code 128) หรือพิมพ์รหัส..."
                    className={`w-full rounded-xl bg-surface-container-low text-on-surface font-code-md placeholder:text-outline/70 transition-all duration-200 outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_3px_rgba(0,69,50,0.2)] ${
                      isTvMode
                        ? 'h-20 pl-20 pr-56 text-2xl font-bold'
                        : 'h-16 pl-16 pr-48 text-headline-sm'
                    }`}
                    autoFocus
                    autoComplete="off"
                    disabled={!activeSession}
                  />
                  <button
                    type="button"
                    onClick={() => setShowManualModal(true)}
                    disabled={!activeSession}
                    className={`absolute right-[7.5rem] top-2 bottom-2 rounded-lg bg-surface-container text-on-surface-variant font-medium flex items-center gap-1.5 hover:bg-surface-container-high transition-all disabled:opacity-40 ${
                      isTvMode ? 'px-5 text-base' : 'px-space-md text-sm font-label-lg'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">keyboard</span>
                    พิมพ์รหัส
                  </button>
                  <button
                    type="submit"
                    disabled={!activeSession || !studentCode.trim()}
                    className={`absolute right-2 top-2 bottom-2 rounded-lg bg-primary text-on-primary font-semibold flex items-center gap-1.5 hover:bg-primary-container transition-all active:scale-95 shadow-sm disabled:opacity-40 ${
                      isTvMode ? 'px-6 text-base' : 'px-space-md text-sm font-label-lg'
                    }`}
                  >
                    <span>บันทึก</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </form>
              </div>

              {/* Helper legend */}
              <div className="flex items-center justify-between flex-wrap gap-space-xs pt-space-2xs">
                <div
                  className={`flex items-center gap-space-xs text-on-surface-variant ${
                    isTvMode ? 'text-sm' : 'text-xs font-label-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">keyboard_return</span>
                  <span>เครื่องสแกนบาร์โค้ดจะกด Enter ทันทีเมื่ออ่านค่าเสร็จ (HID Standard)</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high font-code-md text-xs text-on-surface font-medium">
                    Code 128
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high font-code-md text-xs text-on-surface font-medium">
                    QR Code
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high font-code-md text-xs text-on-surface font-medium">
                    8 หลัก
                  </span>
                </div>
              </div>
            </div>

            {/* Live Feedback Card (Large and high-visibility on TV mode) */}
            {status ? (
              <div
                className={`rounded-2xl shadow-sm relative overflow-hidden flex flex-col gap-space-md transition-all border border-outline-variant/30 ${
                  isTvMode ? 'p-8 animate-bounce-once' : 'p-space-lg'
                } ${
                  status.type === 'success'
                    ? 'bg-surface-container-lowest'
                    : status.type === 'duplicate'
                    ? 'bg-[#FFFBEB]'
                    : 'bg-error-container/30'
                }`}
              >
                {/* Edge indicator */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-3 ${
                    status.type === 'success'
                      ? 'bg-primary-container'
                      : status.type === 'duplicate'
                      ? 'bg-[#F59E0B]'
                      : 'bg-error'
                  }`}
                />
                <div className="flex items-center justify-between pl-space-xs">
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-full flex items-center justify-center ${
                        isTvMode ? 'w-14 h-14' : 'w-10 h-10'
                      } ${
                        status.type === 'success'
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : status.type === 'duplicate'
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      <span className={`material-symbols-outlined ${isTvMode ? 'text-[32px]' : 'text-[24px]'}`}>
                        {status.type === 'success' ? 'check_circle' : status.type === 'duplicate' ? 'warning' : 'error'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`font-bold tracking-tight ${
                          isTvMode ? 'text-2xl lg:text-3xl' : 'text-xl font-headline-sm'
                        } ${
                          status.type === 'success'
                            ? 'text-primary'
                            : status.type === 'duplicate'
                            ? 'text-[#92400E]'
                            : 'text-error'
                        }`}
                      >
                        {status.message}
                      </span>
                      {status.subMessage && (
                        <span className={`text-on-surface-variant ${isTvMode ? 'text-base mt-0.5' : 'text-xs'}`}>
                          {status.subMessage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {status.student && (
                  <div
                    className={`flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-surface-container-low/80 rounded-2xl ml-space-xs border border-outline-variant/30 ${
                      isTvMode ? 'p-6' : 'p-space-md'
                    }`}
                  >
                    <div
                      className={`rounded-xl bg-surface-container flex items-center justify-center shrink-0 ${
                        isTvMode ? 'w-24 h-24' : 'w-16 h-16'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-on-surface-variant ${
                          isTvMode ? 'text-[52px]' : 'text-[36px]'
                        }`}
                      >
                        person
                      </span>
                    </div>
                    <div className="flex flex-col gap-space-xs w-full">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                        <div>
                          <span
                            className={`font-code-md text-primary font-bold tracking-wider ${
                              isTvMode ? 'text-2xl' : 'text-base'
                            }`}
                          >
                            {status.student.studentCode}
                          </span>
                          <h3
                            className={`font-bold text-on-surface ${
                              isTvMode ? 'text-3xl mt-1' : 'text-xl font-headline-sm'
                            }`}
                          >
                            {status.student.fullName}
                          </h3>
                        </div>
                        {status.isLate ? (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold ${
                              isTvMode ? 'px-4 py-2 text-base' : 'px-space-sm py-space-2xs text-xs'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                            สาย (Late)
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/80 text-on-primary-fixed-variant font-bold ${
                              isTvMode ? 'px-4 py-2 text-base' : 'px-space-sm py-space-2xs text-xs'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            เข้าตรงเวลา (On Time)
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-space-sm mt-space-2xs pt-space-xs bg-surface-container-lowest/80 p-space-sm rounded-xl">
                        <div className="flex flex-col">
                          <span className={`text-outline ${isTvMode ? 'text-xs' : 'text-[11px]'}`}>กลุ่ม</span>
                          <span
                            className={`font-semibold text-on-surface ${isTvMode ? 'text-lg' : 'text-sm'}`}
                          >
                            {status.student.groupName}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-outline ${isTvMode ? 'text-xs' : 'text-[11px]'}`}>
                            ความก้าวหน้าสะสม
                          </span>
                          <div className="flex items-center gap-space-xs mt-1">
                            <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden flex-1">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${(status.student.attended / 40) * 100}%` }}
                              />
                            </div>
                            <span
                              className={`font-code-md text-primary font-bold ${
                                isTvMode ? 'text-lg' : 'text-xs'
                              }`}
                            >
                              {status.student.attended}/40
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`bg-surface-container-lowest rounded-2xl shadow-sm relative overflow-hidden flex flex-col gap-space-md opacity-50 border border-outline-variant/30 ${
                  isTvMode ? 'p-10' : 'p-space-lg'
                }`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-surface-container-high" />
                <div className="flex items-center gap-space-md pl-space-xs">
                  <div
                    className={`rounded-full bg-surface-container flex items-center justify-center ${
                      isTvMode ? 'w-16 h-16' : 'w-10 h-10'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-on-surface-variant ${
                        isTvMode ? 'text-[36px]' : 'text-[24px]'
                      }`}
                    >
                      person
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`font-bold text-on-surface-variant ${
                        isTvMode ? 'text-2xl' : 'text-base font-headline-sm'
                      }`}
                    >
                      รอการสแกนบัตรนิสิต...
                    </span>
                    <span className={`${isTvMode ? 'text-base' : 'text-xs text-outline'}`}>
                      ข้อมูลนิสิตและสถานะเช็คชื่อจะปรากฏที่นี่บนหน้าจอใหญ่
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Instructions & Projector Card */}
          <div className={`flex flex-col gap-space-lg ${isTvMode ? 'xl:col-span-4' : 'xl:col-span-5'}`}>
            <div
              className={`bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-md border border-outline-variant/30 ${
                isTvMode ? 'p-8' : 'p-space-lg'
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[26px]">tv</span>
                <span className={`font-bold text-on-surface ${isTvMode ? 'text-xl' : 'text-base'}`}>
                  โหมดฉายจอทีวี / โปรเจกเตอร์
                </span>
              </div>
              <p className={`text-on-surface-variant ${isTvMode ? 'text-sm' : 'text-xs'}`}>
                คลิกที่ปุ่ม <strong className="text-primary">รูปจอทีวี</strong> ที่มุมขวาบนเพื่อเข้าสู่โหมด
                Full Screen ขยายขนาดตัวหนังสือและข้อมูลนิสิตให้มองเห็นได้ชัดเจนจากระยะไกลในศาลาปฏิบัติธรรม
              </p>
            </div>

            <div
              className={`bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-md border border-outline-variant/30 ${
                isTvMode ? 'p-8' : 'p-space-lg'
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">info</span>
                <span className={`font-bold text-on-surface ${isTvMode ? 'text-xl' : 'text-base'}`}>
                  คู่มือการใช้งาน
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {[
                  { icon: 'badge', text: 'ชี้บาร์โค้ดที่บัตรนิสิตเข้าหาเครื่องอ่าน' },
                  { icon: 'qr_code_scanner', text: 'เครื่องอ่านจะส่งรหัสและกด Enter อัตโนมัติ' },
                  { icon: 'check_circle', text: 'ระบบบันทึกเวลาและแสดงผลบนจอทันที' },
                  { icon: 'schedule', text: 'สแกนเกินเวลาจะถูกปรับเป็นสถานะ "มาสาย" อัตโนมัติ' },
                  { icon: 'keyboard', text: 'กดปุ่ม "พิมพ์รหัส" หากบาร์โค้ดชำรุด' },
                ].map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-space-sm rounded-xl bg-surface-container-low ${
                      isTvMode ? 'p-3.5' : 'p-space-sm'
                    }`}
                  >
                    <div
                      className={`rounded-full bg-primary-container flex items-center justify-center shrink-0 ${
                        isTvMode ? 'w-8 h-8' : 'w-7 h-7'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-on-primary ${
                          isTvMode ? 'text-[18px]' : 'text-[16px]'
                        }`}
                      >
                        {step.icon}
                      </span>
                    </div>
                    <span className={`text-on-surface ${isTvMode ? 'text-sm font-medium' : 'text-xs'}`}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-space-lg flex flex-col gap-space-xs border border-outline-variant/30">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-tertiary text-[18px]">shield</span>
                <span className="text-xs font-semibold text-on-surface">ระบบป้องกันการสแกนซ้ำ</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                นิสิตแต่ละคนสามารถสแกนได้เพียง 1 ครั้งต่อรอบ ระบบจะแจ้งเตือนและขึ้นเสียงเตือนหากพบการสแกนซ้ำ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-outline-variant/30">
            <div className="px-space-lg py-space-md border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="font-semibold text-on-surface flex items-center gap-space-xs text-base">
                <span className="material-symbols-outlined text-primary text-[22px]">keyboard</span>
                บันทึกรหัสนิสิตแบบแมนนวล
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-on-surface-variant hover:text-error text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-space-lg">
              <form onSubmit={handleManualSubmit}>
                <label className="block text-sm font-medium text-on-surface mb-space-xs">
                  รหัสประจำตัวนิสิต
                </label>
                <input
                  ref={manualInputRef}
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  placeholder="กรอกรหัสนิสิต (เช่น 66012345)"
                  className="w-full px-space-md py-space-sm bg-surface-container-low border border-outline-variant rounded-xl font-code-md text-lg text-on-surface focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,69,50,0.2)] focus:bg-surface-container-lowest"
                  autoFocus
                />
                <div className="mt-space-lg flex justify-end gap-space-sm">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container rounded-xl text-sm font-medium transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={!manualCode.trim()}
                    className="px-space-lg py-space-sm bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary-container transition-all active:scale-95 disabled:opacity-40 flex items-center gap-space-2xs"
                  >
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
