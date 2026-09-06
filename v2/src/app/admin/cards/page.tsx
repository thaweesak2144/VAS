'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import JsBarcode from 'jsbarcode';

const Barcode = dynamic(() => import('@/components/Barcode'), { ssr: false });

interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  groupName: string;
}

interface CardStudent extends Student {
  selected: boolean;
}

// ------------------------------------------------------------------
// Print card (self-contained barcode via useRef + JsBarcode)
// ------------------------------------------------------------------
function PrintCard({ student }: { student: Student }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && student.studentCode) {
      try {
        JsBarcode(svgRef.current, student.studentCode, {
          format: 'CODE128',
          width: 1.5,
          height: 45,
          displayValue: true,
          fontSize: 10,
          margin: 2,
        });
      } catch { /* ignore */ }
    }
  }, [student.studentCode]);

  return (
    <div style={{
      width: '85.6mm',
      height: '54mm',
      border: '2px solid #065F46',
      borderRadius: '8px',
      overflow: 'hidden',
      pageBreakInside: 'avoid',
      fontFamily: 'sans-serif',
      backgroundColor: 'white',
      display: 'inline-block',
      margin: '4px',
      verticalAlign: 'top',
    }}>
      {/* Header */}
      <div style={{ backgroundColor: '#065F46', color: 'white', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: 14 }}>🧘</span>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600 }}>โครงการปฏิบัติธรรมวิปัสสนากรรมฐาน</div>
          <div style={{ fontSize: 8, opacity: 0.8 }}>บัตรเข้าร่วมโครงการ</div>
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: '6px 10px', display: 'flex', gap: '8px', alignItems: 'center', height: 'calc(100% - 34px)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#1f2937', lineHeight: 1.3 }}>{student.fullName}</div>
          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>
            รหัส: <strong style={{ color: '#065F46', fontFamily: 'monospace' }}>{student.studentCode}</strong>
          </div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>กลุ่ม: {student.groupName}</div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <svg ref={svgRef} />
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Preview card (uses dynamic Barcode component)
// ------------------------------------------------------------------
function PreviewCard({ student }: { student: Student }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="bg-primary text-white px-4 py-2 flex items-center gap-2">
        <span className="text-lg">🧘</span>
        <div>
          <p className="text-xs font-medium opacity-90">โครงการปฏิบัติธรรมวิปัสสนากรรมฐาน</p>
          <p className="text-xs opacity-75">บัตรเข้าร่วมโครงการ</p>
        </div>
      </div>
      <div className="px-4 py-3 flex gap-4 items-center">
        <div className="flex-1">
          <p className="text-base font-bold text-text-main leading-tight">{student.fullName}</p>
          <p className="text-sm text-text-muted mt-0.5">รหัส: <span className="font-mono font-semibold text-primary">{student.studentCode}</span></p>
          <p className="text-xs text-text-muted mt-0.5">กลุ่ม: {student.groupName}</p>
        </div>
        <div className="flex-shrink-0">
          <Barcode value={student.studentCode} width={1.5} height={50} />
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main Page
// ------------------------------------------------------------------
export default function CardsPage() {
  const [students, setStudents] = useState<CardStudent[]>([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualGroup, setManualGroup] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      const data: Student[] = await res.json();
      setStudents(data.map(s => ({ ...s, selected: false })));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const toggleSelect = (id: number) =>
    setStudents(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));

  const selectAll = () => setStudents(prev => prev.map(s => ({ ...s, selected: true })));
  const deselectAll = () => setStudents(prev => prev.map(s => ({ ...s, selected: false })));
  const selectFiltered = () => {
    const ids = new Set(filtered.map(s => s.id));
    setStudents(prev => prev.map(s => ids.has(s.id) ? { ...s, selected: true } : s));
  };

  const addManual = () => {
    if (!manualCode.trim() || !manualName.trim() || !manualGroup.trim()) return;
    setStudents(prev => [{
      id: Date.now(),
      studentCode: manualCode.trim(),
      fullName: manualName.trim(),
      groupName: manualGroup.trim(),
      selected: true,
    }, ...prev]);
    setManualCode(''); setManualName(''); setManualGroup('');
    setShowManual(false);
  };

  const groups = Array.from(new Set(students.map(s => s.groupName))).sort();
  const filtered = students.filter(s => {
    const matchSearch = !search || s.studentCode.includes(search) || s.fullName.includes(search);
    const matchGroup = !filterGroup || s.groupName === filterGroup;
    return matchSearch && matchGroup;
  });
  const selected = students.filter(s => s.selected);

  return (
    <>
      {/* Print CSS */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-area { display: block !important; }
          #print-area * { visibility: visible !important; }
          @page { size: A4; margin: 10mm; }
        }
        #print-area { display: none; }
      `}</style>

      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-text-main">🪪 พิมพ์บัตรสแกน</h1>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-sm text-text-muted">เลือกแล้ว {selected.length} คน</span>
            <button onClick={() => setShowManual(!showManual)}
              className="bg-white border border-border hover:bg-surface-low text-text-main px-4 py-2 rounded-lg text-sm font-medium transition">
              + เพิ่มด้วยตนเอง
            </button>
            <button
              onClick={() => window.print()}
              disabled={selected.length === 0}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40">
              🖨️ พิมพ์บัตร ({selected.length})
            </button>
          </div>
        </div>

        {/* Manual Add Form */}
        {showManual && (
          <div className="bg-surface-low border border-border rounded-xl p-5 mb-5">
            <h2 className="font-semibold text-text-main mb-3">เพิ่มนิสิตด้วยตนเอง</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="รหัสนิสิต" value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addManual()}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              <input placeholder="ชื่อ-นามสกุล" value={manualName}
                onChange={e => setManualName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addManual()}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              <input placeholder="กลุ่ม / หมู่เรียน" value={manualGroup}
                onChange={e => setManualGroup(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addManual()}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={addManual}
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg text-sm font-medium transition">
                เพิ่มและเลือก
              </button>
              <button onClick={() => setShowManual(false)}
                className="bg-white border border-border hover:bg-surface-low text-text-main px-5 py-2 rounded-lg text-sm font-medium transition">
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Student selector */}
          <div className="bg-white rounded-xl shadow-card p-4 border border-border">
            <h2 className="font-semibold text-text-main mb-3">เลือกนิสิต ({students.length} คน)</h2>

            <div className="flex gap-2 mb-3 flex-wrap">
              <input type="text" placeholder="ค้นหารหัส / ชื่อ..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-0" />
              <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">ทุกกลุ่ม</option>
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="flex gap-3 mb-3 text-xs font-medium">
              <button onClick={selectAll} className="text-primary hover:underline">เลือกทั้งหมด</button>
              <span className="text-gray-300">|</span>
              <button onClick={selectFiltered} className="text-primary hover:underline">เลือกที่กรอง</button>
              <span className="text-gray-300">|</span>
              <button onClick={deselectAll} className="text-error hover:underline">ยกเลิกทั้งหมด</button>
            </div>

            {loading ? (
              <p className="text-text-muted text-sm text-center py-10">กำลังโหลด...</p>
            ) : (
              <div className="max-h-[520px] overflow-y-auto space-y-1 pr-1">
                {filtered.map(s => (
                  <div key={s.id}
                    onClick={() => toggleSelect(s.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition select-none border ${
                      s.selected
                        ? 'bg-primary-light border-primary bg-opacity-50'
                        : 'hover:bg-surface-low border-transparent'
                    }`}>
                    <input type="checkbox" checked={s.selected}
                      onChange={() => toggleSelect(s.id)}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 text-primary focus:ring-primary rounded shrink-0 border-gray-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-main truncate">{s.fullName}</p>
                      <p className="text-xs text-text-muted">{s.studentCode} · {s.groupName}</p>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && !loading && (
                  <p className="text-text-muted text-sm text-center py-10">ไม่พบนิสิต</p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Preview */}
          <div className="bg-white rounded-xl shadow-card p-4 border border-border">
            <h2 className="font-semibold text-text-main mb-3">
              ตัวอย่างบัตร
              {selected.length > 0 && (
                <span className="ml-2 text-xs text-text-muted font-normal">({selected.length} ใบ)</span>
              )}
            </h2>

            {selected.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl p-16 text-center text-text-muted">
                <div className="text-5xl mb-3">🪪</div>
                <p className="text-sm">เลือกนิสิตทางซ้ายเพื่อแสดงตัวอย่างบัตร</p>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto space-y-3 pr-1">
                {selected.map(s => (
                  <PreviewCard key={s.id} student={s} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT AREA */}
      <div id="print-area">
        <div style={{ textAlign: 'center', marginBottom: 12, fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: 14, fontWeight: 'bold', color: '#065F46' }}>
            บัตรเข้าร่วมโครงการปฏิบัติธรรมวิปัสสนากรรมฐาน
          </h2>
          <p style={{ fontSize: 11, color: '#64748b' }}>จำนวน {selected.length} ใบ</p>
        </div>
        {selected.map(s => (
          <PrintCard key={s.id} student={s} />
        ))}
      </div>
    </>
  );
}
