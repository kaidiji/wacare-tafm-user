import React, { useState, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  MoreVertical,
  HelpCircle,
  Wand2,
  Bluetooth,
  Info,
  Calendar,
  Clock,
  X,
  Check,
  Award,
  Sparkles,
  MessageSquare,
  User,
  Activity,
  Heart
} from 'lucide-react';
import { VitalsData } from './heartCareData';

export interface BPRecordItem {
  id: string;
  dateStr: string; // e.g. "2026-08-10"
  timeStr: string; // e.g. "11:48 午間"
  fullDateTime: string; // e.g. "2026-08-10 11:48"
  systolic: number;
  diastolic: number;
  pulse: number;
  status: 'normal' | 'warning' | 'urgent'; // 普通 | 留意 | 緊急
  statusLabel: string;
  isStrikethrough?: boolean;
  note?: string;
}

export const INITIAL_BP_RECORDS: BPRecordItem[] = [
  {
    id: 'bp_1',
    dateStr: '2026-08-10',
    timeStr: '11:48 午間',
    fullDateTime: '2026-08-10 11:48',
    systolic: 135,
    diastolic: 85,
    pulse: 72,
    status: 'warning',
    statusLabel: '留意',
    isStrikethrough: false,
    note: '早起休息後量測',
  },
  {
    id: 'bp_2',
    dateStr: '2026-08-08',
    timeStr: '11:05 午間',
    fullDateTime: '2026-08-08 11:05',
    systolic: 106,
    diastolic: 84,
    pulse: 79,
    status: 'warning',
    statusLabel: '留意',
    isStrikethrough: false,
    note: '',
  },
  {
    id: 'bp_3',
    dateStr: '2026-08-04',
    timeStr: '12:48 午間',
    fullDateTime: '2026-08-04 12:48',
    systolic: 180,
    diastolic: 91,
    pulse: 65,
    status: 'urgent',
    statusLabel: '緊急',
    isStrikethrough: true,
    note: '運動後量測數值偏高，已休息重測',
  },
  {
    id: 'bp_4',
    dateStr: '2026-08-03',
    timeStr: '11:19 午間',
    fullDateTime: '2026-08-03 11:19',
    systolic: 121,
    diastolic: 83,
    pulse: 61,
    status: 'normal',
    statusLabel: '普通',
    isStrikethrough: false,
    note: '',
  },
  {
    id: 'bp_5',
    dateStr: '2026-07-23',
    timeStr: '16:20 午間',
    fullDateTime: '2026-07-23 16:20',
    systolic: 160,
    diastolic: 90,
    pulse: 68,
    status: 'warning',
    statusLabel: '留意',
    isStrikethrough: true,
    note: '',
  },
  {
    id: 'bp_6',
    dateStr: '2026-07-23',
    timeStr: '16:19 午間',
    fullDateTime: '2026-07-23 16:19',
    systolic: 150,
    diastolic: 65,
    pulse: 69,
    status: 'warning',
    statusLabel: '留意',
    isStrikethrough: true,
    note: '',
  },
  {
    id: 'bp_7',
    dateStr: '2026-06-16',
    timeStr: '09:30 早晨',
    fullDateTime: '2026-06-16 09:30',
    systolic: 123,
    diastolic: 85,
    pulse: 85,
    status: 'normal',
    statusLabel: '普通',
    isStrikethrough: false,
  },
  {
    id: 'bp_8',
    dateStr: '2026-06-12',
    timeStr: '08:15 早晨',
    fullDateTime: '2026-06-12 08:15',
    systolic: 126,
    diastolic: 83,
    pulse: 65,
    status: 'normal',
    statusLabel: '普通',
    isStrikethrough: false,
  },
  {
    id: 'bp_9',
    dateStr: '2026-06-03',
    timeStr: '07:45 早晨',
    fullDateTime: '2026-06-03 07:45',
    systolic: 135,
    diastolic: 87,
    pulse: 68,
    status: 'warning',
    statusLabel: '留意',
    isStrikethrough: false,
  },
];

interface Props {
  onBack: () => void;
  nickname?: string;
  currentVitals?: VitalsData;
  onUpdateVitals?: (vitals: Partial<VitalsData>) => void;
}

export const BloodPressureDetailScreen: React.FC<Props> = ({ onBack, nickname = '陳小明', currentVitals, onUpdateVitals }) => {
  const [records, setRecords] = useState<BPRecordItem[]>(() => {
    if (currentVitals && currentVitals.sysBP && currentVitals.diaBP) {
      const s = currentVitals.sysBP;
      const d = currentVitals.diaBP;
      const p = currentVitals.heartRate || 72;
      let status: 'normal' | 'warning' | 'urgent' = 'normal';
      let statusLabel = '普通';
      if (s < 90 || s >= 180 || d >= 110) {
        status = 'urgent';
        statusLabel = '緊急';
      } else if (s >= 140 || s <= 99 || d >= 90) {
        status = 'warning';
        statusLabel = '留意';
      }

      return [
        {
          id: 'bp_current',
          dateStr: '2026-08-10',
          timeStr: '11:48 午間',
          fullDateTime: '2026-08-10 11:48',
          systolic: s,
          diastolic: d,
          pulse: p,
          status,
          statusLabel,
          isStrikethrough: false,
          note: '最新量測紀錄',
        },
        ...INITIAL_BP_RECORDS.slice(1),
      ];
    }
    return INITIAL_BP_RECORDS;
  });
  const [activeChartSlide, setActiveChartSlide] = useState<number>(0); // 0: Line Chart (IMG_8884), 1: Box Plot (IMG_8887)
  const [selectedFilter, setSelectedFilter] = useState<string>('所有');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState<boolean>(false);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<BPRecordItem | null>(null);
  const [show722Modal, setShow722Modal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Touch & drag swipe support for charts
  const touchStartXRef = useRef<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartXRef.current = clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartXRef.current === null) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = touchStartXRef.current - clientX;
    if (diff > 40) {
      // Swiped Left -> go to Box Plot
      setActiveChartSlide(1);
    } else if (diff < -40) {
      // Swiped Right -> go to Line Chart
      setActiveChartSlide(0);
    }
    touchStartXRef.current = null;
  };

  // Measurement Modal Form States
  const [measureDateTime, setMeasureDateTime] = useState<string>(() => {
    const d = new Date();
    const YYYY = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${YYYY}/${MM}/${DD} ${hh}:${mm}`;
  });
  const [activeInputSlot, setActiveInputSlot] = useState<'sys' | 'dia' | 'pulse'>('sys');
  const [inputSys, setInputSys] = useState<string>('');
  const [inputDia, setInputDia] = useState<string>('');
  const [inputPulse, setInputPulse] = useState<string>('');
  const [inputNote, setInputNote] = useState<string>('');
  const [showWheelDatePicker, setShowWheelDatePicker] = useState<boolean>(false);
  const [showInstructionHelp, setShowInstructionHelp] = useState<boolean>(false);

  // Keypad Click Handler
  const handleKeypadPress = (key: string) => {
    if (key === 'DEL') {
      if (activeInputSlot === 'sys') setInputSys((prev) => prev.slice(0, -1));
      else if (activeInputSlot === 'dia') setInputDia((prev) => prev.slice(0, -1));
      else if (activeInputSlot === 'pulse') setInputPulse((prev) => prev.slice(0, -1));
    } else {
      // Numbers 0-9
      if (activeInputSlot === 'sys') {
        if (inputSys.length < 3) {
          const next = inputSys + key;
          setInputSys(next);
          if (next.length === 3) setActiveInputSlot('dia');
        }
      } else if (activeInputSlot === 'dia') {
        if (inputDia.length < 3) {
          const next = inputDia + key;
          setInputDia(next);
          if (next.length === 3) setActiveInputSlot('pulse');
        }
      } else if (activeInputSlot === 'pulse') {
        if (inputPulse.length < 3) {
          setInputPulse((prev) => prev + key);
        }
      }
    }
  };

  const isFormComplete = Boolean(inputSys && inputDia);

  const handleSaveMeasurement = () => {
    if (!isFormComplete) return;

    const s = parseInt(inputSys, 10) || 120;
    const d = parseInt(inputDia, 10) || 80;
    const p = parseInt(inputPulse, 10) || 72;

    let status: 'normal' | 'warning' | 'urgent' = 'normal';
    let statusLabel = '普通';

    if (s >= 180 || s < 90 || d >= 110) {
      status = 'urgent';
      statusLabel = '緊急';
    } else if (s >= 140 || d >= 90 || (s >= 90 && s < 100)) {
      status = 'warning';
      statusLabel = '留意';
    }

    const now = new Date();
    const hours = now.getHours();
    const period = hours < 12 ? '早晨' : hours < 18 ? '午間' : '晚間';
    const timeFormatted = `${String(hours).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${period}`;
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const newRecord: BPRecordItem = {
      id: `bp_${Date.now()}`,
      dateStr: dateFormatted,
      timeStr: timeFormatted,
      fullDateTime: `${dateFormatted} ${timeFormatted}`,
      systolic: s,
      diastolic: d,
      pulse: p,
      status,
      statusLabel,
      isStrikethrough: false,
      note: inputNote,
    };

    setRecords([newRecord, ...records]);
    if (onUpdateVitals) {
      onUpdateVitals({
        sysBP: s,
        diaBP: d,
        heartRate: p,
      });
    }

    setShowMeasurementModal(false);
    // Reset fields
    setInputSys('');
    setInputDia('');
    setInputPulse('');
    setInputNote('');
    setActiveInputSlot('sys');

    setToastMessage('血壓量測紀錄已成功儲存！');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (selectedFilter === '所有') return records;
    if (selectedFilter === '早晨') return records.filter((r) => r.timeStr.includes('早晨'));
    if (selectedFilter === '午間') return records.filter((r) => r.timeStr.includes('午間'));
    if (selectedFilter === '晚間') return records.filter((r) => r.timeStr.includes('晚間'));
    return records;
  }, [records, selectedFilter]);

  // Chart data calculation (sorted by chronological date for line chart)
  const chartPoints = useMemo(() => {
    const list = [...records].slice(0, 7).reverse();
    return list.map((r) => {
      const parts = r.dateStr.split('-');
      const shortDate = parts.length >= 3 ? `${parts[1]}/${parts[2]}` : r.dateStr;
      return {
        date: shortDate,
        sys: r.systolic,
        dia: r.diastolic,
        pulse: r.pulse,
      };
    });
  }, [records]);

  // SVG Chart Geometry Constants
  const chartWidth = 340;
  const chartHeight = 160;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 15;
  const paddingBottom = 25;

  // Scale map: mmHg (40 ~ 200) -> SVG Y
  const minY = 40;
  const maxY = 200;
  const getY = (val: number) => {
    const ratio = (val - minY) / (maxY - minY);
    return paddingTop + (1 - ratio) * (chartHeight - paddingTop - paddingBottom);
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return paddingLeft + (chartWidth - paddingLeft - paddingRight) / 2;
    const step = (chartWidth - paddingLeft - paddingRight) / (total - 1);
    return paddingLeft + index * step;
  };

  // Box plot statistical values (calculating Min, Q1, Median, Q3, Max)
  const boxPlotStats = useMemo(() => {
    const sysValues = records.map((r) => r.systolic).sort((a, b) => a - b);
    const diaValues = records.map((r) => r.diastolic).sort((a, b) => a - b);

    const getStats = (arr: number[]) => {
      if (arr.length === 0) return { min: 100, q1: 115, median: 120, q3: 130, max: 150 };
      const min = arr[0];
      const max = arr[arr.length - 1];
      const median = arr[Math.floor(arr.length / 2)];
      const q1 = arr[Math.floor(arr.length * 0.25)];
      const q3 = arr[Math.floor(arr.length * 0.75)];
      return { min, q1, median, q3, max };
    };

    return {
      sys: getStats(sysValues),
      dia: getStats(diaValues),
    };
  }, [records]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-800 overflow-hidden relative select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-4 right-4 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TOP HEADER: (Back Button | Kai 血壓 | + Button) */}
      {/* ========================================================= */}
      <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-slate-200 shrink-0 sticky top-0 z-30">
        {/* Left: Back Circular Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
          aria-label="返回"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Center: Title (帳號暱稱＋專屬頁面名稱) */}
        <h1 className="text-[1.1875rem] font-black text-slate-900 tracking-tight">
          {nickname} 血壓
        </h1>

        {/* Right: + Circular Button (Opens Blood Pressure Measurement Screen IMG_8886) */}
        <button
          type="button"
          onClick={() => {
            setShowMeasurementModal(true);
            setActiveInputSlot('sys');
          }}
          className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
          aria-label="新增血壓量測"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* SCROLLABLE MAIN CONTENT */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {/* 1. TOP PROMO BANNER (Matching IMG_8884) */}
        <div className="p-3.5 pb-2">
          <div className="bg-gradient-to-r from-pink-50 via-orange-50/70 to-amber-50 rounded-2xl p-3 border border-pink-200/80 shadow-xs flex items-center justify-between relative overflow-hidden">
            <div className="flex flex-col gap-1 z-10">
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/90 border border-orange-300 text-[10px] font-extrabold text-[#e25c1d] self-start shadow-2xs">
                好評延長加碼日日抽！
              </div>
              <div className="text-[1.1875rem] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800">
                量血壓 贏健康
              </div>
            </div>

            {/* Right: "賺 獎 金" Orange Badges */}
            <div className="flex items-center gap-1 z-10">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-[13px] flex items-center justify-center shadow-md border-2 border-white text-center leading-none">
                賺
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-[13px] flex items-center justify-center shadow-md border-2 border-white text-center leading-none">
                獎
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-[13px] flex items-center justify-center shadow-md border-2 border-white text-center leading-none">
                金
              </div>
            </div>

            {/* Bottom-right Ad Label */}
            <span className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-medium scale-90">
              廣告
            </span>
          </div>
        </div>

        {/* 2. FILTER & ACTION ROW (所有 ▾ | ⊕ ⋮) */}
        <div className="px-4 py-1.5 flex items-center justify-between relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1 text-[1.0625rem] font-black text-slate-900 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <span>{selectedFilter}</span>
              <span className="text-xs text-slate-500">▾</span>
            </button>

            {/* Dropdown Menu */}
            {showFilterDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 w-36 text-xs font-bold text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                {['所有', '早晨', '午間', '晚間'].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setSelectedFilter(f);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center justify-between ${
                      selectedFilter === f ? 'text-orange-600 font-black bg-orange-50/50' : ''
                    }`}
                  >
                    <span>{f}</span>
                    {selectedFilter === f && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <button
              onClick={() => {
                setToastMessage('已重整最新統計趨勢');
                setTimeout(() => setToastMessage(null), 2000);
              }}
              className="p-1.5 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer"
              title="搜尋與縮放"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer"
              title="功能說明"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3. INTERACTIVE SWIPEABLE CHARTS SECTION (Line Chart <-> Box Plot) */}
        <div
          ref={chartContainerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          className="px-3 py-1 relative cursor-grab active:cursor-grabbing"
        >
          <div className="bg-white rounded-3xl p-3 shadow-xs border border-slate-200/80 overflow-hidden">
            {/* Slide 0: LINE TREND CHART (IMG_8884) */}
            {activeChartSlide === 0 ? (
              <div className="animate-in fade-in duration-200">
                {/* Legends Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-bold text-slate-700 px-3 pt-1 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                    <span>收縮壓</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                    <span>舒張壓</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                    <span>心律</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-2.5 rounded-xs bg-[#fef08a]/70 border border-[#fde047]" />
                    <span>收縮壓標準</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-2.5 rounded-xs bg-[#bae6fd]/60 border border-[#7dd3fc]" />
                    <span>舒張壓標準</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 border-b border-dashed border-slate-500" />
                    <span>平均(近10筆)</span>
                  </div>
                </div>

                {/* SVG Line Chart */}
                <div className="relative w-full h-[180px] mt-1 select-none">
                  {/* Left Y Axis Label */}
                  <div
                    className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}
                  >
                    血壓單位 (mmHg)
                  </div>

                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full overflow-visible"
                  >
                    {/* Background Target Bands */}
                    {/* Systolic Standard Band (119 ~ 125) */}
                    <rect
                      x={paddingLeft}
                      y={getY(125)}
                      width={chartWidth - paddingLeft - paddingRight}
                      height={getY(119) - getY(125)}
                      fill="#fef08a"
                      opacity="0.45"
                    />
                    {/* Diastolic Standard Band (60 ~ 82) */}
                    <rect
                      x={paddingLeft}
                      y={getY(82)}
                      width={chartWidth - paddingLeft - paddingRight}
                      height={getY(60) - getY(82)}
                      fill="#bae6fd"
                      opacity="0.4"
                    />

                    {/* Dashed Threshold Lines */}
                    <line
                      x1={paddingLeft}
                      y1={getY(125)}
                      x2={chartWidth - paddingRight}
                      y2={getY(125)}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                    <text x={paddingLeft - 2} y={getY(125) + 3} textAnchor="end" fontSize="9" fill="#e25c1d" fontWeight="bold">
                      125
                    </text>

                    <line
                      x1={paddingLeft}
                      y1={getY(119)}
                      x2={chartWidth - paddingRight}
                      y2={getY(119)}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                    <text x={paddingLeft - 2} y={getY(119) + 3} textAnchor="end" fontSize="9" fill="#64748b" fontWeight="bold">
                      119
                    </text>

                    <line
                      x1={paddingLeft}
                      y1={getY(82)}
                      x2={chartWidth - paddingRight}
                      y2={getY(82)}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                    <text x={paddingLeft - 2} y={getY(82) + 3} textAnchor="end" fontSize="9" fill="#0284c7" fontWeight="bold">
                      82
                    </text>

                    <line
                      x1={paddingLeft}
                      y1={getY(60)}
                      x2={chartWidth - paddingRight}
                      y2={getY(60)}
                      stroke="#cbd5e1"
                      strokeWidth="0.6"
                    />
                    <text x={paddingLeft - 2} y={getY(60) + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="bold">
                      60
                    </text>

                    {/* Bottom Axis Line */}
                    <line
                      x1={paddingLeft}
                      y1={chartHeight - paddingBottom}
                      x2={chartWidth - paddingRight}
                      y2={chartHeight - paddingBottom}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                    />

                    {/* Polylines for Sys (Orange), Dia (Blue), Pulse (Yellow) */}
                    {/* 1. Systolic Path */}
                    <polyline
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartPoints
                        .map((pt, i) => `${getX(i, chartPoints.length)},${getY(pt.sys)}`)
                        .join(' ')}
                    />
                    {/* 2. Diastolic Path */}
                    <polyline
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartPoints
                        .map((pt, i) => `${getX(i, chartPoints.length)},${getY(pt.dia)}`)
                        .join(' ')}
                    />
                    {/* 3. Pulse Path */}
                    <polyline
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartPoints
                        .map((pt, i) => `${getX(i, chartPoints.length)},${getY(pt.pulse)}`)
                        .join(' ')}
                    />

                    {/* Data Points Nodes */}
                    {chartPoints.map((pt, i) => {
                      const x = getX(i, chartPoints.length);
                      return (
                        <g key={i}>
                          {/* X-axis tick & label */}
                          <line
                            x1={x}
                            y1={chartHeight - paddingBottom}
                            x2={x}
                            y2={chartHeight - paddingBottom + 4}
                            stroke="#94a3b8"
                            strokeWidth="0.8"
                          />
                          <text
                            x={x}
                            y={chartHeight - paddingBottom + 14}
                            textAnchor="middle"
                            fontSize="8.5"
                            fill="#64748b"
                            fontWeight="bold"
                          >
                            {pt.date}
                          </text>

                          {/* Systolic Dot */}
                          <circle cx={x} cy={getY(pt.sys)} r="3.5" fill="#f97316" stroke="#fff" strokeWidth="1" />
                          {/* Diastolic Dot */}
                          <circle cx={x} cy={getY(pt.dia)} r="3.5" fill="#0284c7" stroke="#fff" strokeWidth="1" />
                          {/* Pulse Dot */}
                          <circle cx={x} cy={getY(pt.pulse)} r="3.5" fill="#eab308" stroke="#fff" strokeWidth="1" />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            ) : (
              /* Slide 1: BOX PLOT (IMG_8887) */
              <div className="animate-in fade-in duration-200">
                <div className="text-center pb-1">
                  <span className="text-xs font-black text-slate-700">血壓數值分佈 (箱型盒鬚圖)</span>
                </div>

                <div className="relative w-full h-[180px] mt-1 select-none">
                  {/* Left Y Axis Label */}
                  <div
                    className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}
                  >
                    血壓單位 (mmHg)
                  </div>

                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full overflow-visible"
                  >
                    {/* Background Target Bands */}
                    <rect
                      x={paddingLeft}
                      y={getY(125)}
                      width={chartWidth - paddingLeft - paddingRight}
                      height={getY(119) - getY(125)}
                      fill="#fef08a"
                      opacity="0.45"
                    />
                    <rect
                      x={paddingLeft}
                      y={getY(82)}
                      width={chartWidth - paddingLeft - paddingRight}
                      height={getY(60) - getY(82)}
                      fill="#bae6fd"
                      opacity="0.4"
                    />

                    {/* Dashed Threshold Lines */}
                    <line
                      x1={paddingLeft}
                      y1={getY(125)}
                      x2={chartWidth - paddingRight}
                      y2={getY(125)}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                    <text x={paddingLeft - 2} y={getY(125) + 3} textAnchor="end" fontSize="9" fill="#e25c1d" fontWeight="bold">
                      125
                    </text>

                    <line
                      x1={paddingLeft}
                      y1={getY(119)}
                      x2={chartWidth - paddingRight}
                      y2={getY(119)}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                    <text x={paddingLeft - 2} y={getY(119) + 3} textAnchor="end" fontSize="9" fill="#64748b" fontWeight="bold">
                      119
                    </text>

                    <line
                      x1={paddingLeft}
                      y1={getY(82)}
                      x2={chartWidth - paddingRight}
                      y2={getY(82)}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                    <text x={paddingLeft - 2} y={getY(82) + 3} textAnchor="end" fontSize="9" fill="#0284c7" fontWeight="bold">
                      82
                    </text>

                    <line
                      x1={paddingLeft}
                      y1={getY(60)}
                      x2={chartWidth - paddingRight}
                      y2={getY(60)}
                      stroke="#cbd5e1"
                      strokeWidth="0.6"
                    />
                    <text x={paddingLeft - 2} y={getY(60) + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="bold">
                      60
                    </text>

                    {/* Bottom Axis Line */}
                    <line
                      x1={paddingLeft}
                      y1={chartHeight - paddingBottom}
                      x2={chartWidth - paddingRight}
                      y2={chartHeight - paddingBottom}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                    />

                    {/* BOX PLOT 1: 收縮壓 (Orange) */}
                    {(() => {
                      const centerX = paddingLeft + (chartWidth - paddingLeft - paddingRight) * 0.32;
                      const boxW = 55;
                      const stats = boxPlotStats.sys;
                      const yMax = getY(Math.min(stats.max, 175));
                      const yMin = getY(Math.max(stats.min, 100));
                      const yQ3 = getY(stats.q3);
                      const yQ1 = getY(stats.q1);
                      const yMedian = getY(stats.median);

                      return (
                        <g>
                          {/* Upper whisker & cap */}
                          <line x1={centerX} y1={yQ3} x2={centerX} y2={yMax} stroke="#f97316" strokeWidth="2" />
                          <line x1={centerX - 16} y1={yMax} x2={centerX + 16} y2={yMax} stroke="#f97316" strokeWidth="2" />

                          {/* Lower whisker & cap */}
                          <line x1={centerX} y1={yQ1} x2={centerX} y2={yMin} stroke="#f97316" strokeWidth="2" />
                          <line x1={centerX - 16} y1={yMin} x2={centerX + 16} y2={yMin} stroke="#f97316" strokeWidth="2" />

                          {/* Box IQR */}
                          <rect
                            x={centerX - boxW / 2}
                            y={yQ3}
                            width={boxW}
                            height={Math.max(yQ1 - yQ3, 6)}
                            fill="#fff"
                            stroke="#f97316"
                            strokeWidth="2.5"
                          />

                          {/* Median horizontal line */}
                          <line
                            x1={centerX - boxW / 2}
                            y1={yMedian}
                            x2={centerX + boxW / 2}
                            y2={yMedian}
                            stroke="#f97316"
                            strokeWidth="2.5"
                          />

                          {/* X Axis Label */}
                          <text
                            x={centerX}
                            y={chartHeight - paddingBottom + 15}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#475569"
                            fontWeight="bold"
                          >
                            收縮壓
                          </text>
                        </g>
                      );
                    })()}

                    {/* BOX PLOT 2: 舒張壓 (Blue) */}
                    {(() => {
                      const centerX = paddingLeft + (chartWidth - paddingLeft - paddingRight) * 0.72;
                      const boxW = 55;
                      const stats = boxPlotStats.dia;
                      const yMax = getY(Math.min(stats.max, 95));
                      const yMin = getY(Math.max(stats.min, 62));
                      const yQ3 = getY(stats.q3);
                      const yQ1 = getY(stats.q1);
                      const yMedian = getY(stats.median);

                      return (
                        <g>
                          {/* Upper whisker & cap */}
                          <line x1={centerX} y1={yQ3} x2={centerX} y2={yMax} stroke="#0284c7" strokeWidth="2" />
                          <line x1={centerX - 16} y1={yMax} x2={centerX + 16} y2={yMax} stroke="#0284c7" strokeWidth="2" />

                          {/* Lower whisker & cap */}
                          <line x1={centerX} y1={yQ1} x2={centerX} y2={yMin} stroke="#0284c7" strokeWidth="2" />
                          <line x1={centerX - 16} y1={yMin} x2={centerX + 16} y2={yMin} stroke="#0284c7" strokeWidth="2" />

                          {/* Box IQR */}
                          <rect
                            x={centerX - boxW / 2}
                            y={yQ3}
                            width={boxW}
                            height={Math.max(yQ1 - yQ3, 6)}
                            fill="#fff"
                            stroke="#0284c7"
                            strokeWidth="2.5"
                          />

                          {/* Median horizontal line */}
                          <line
                            x1={centerX - boxW / 2}
                            y1={yMedian}
                            x2={centerX + boxW / 2}
                            y2={yMedian}
                            stroke="#0284c7"
                            strokeWidth="2.5"
                          />

                          {/* X Axis Label */}
                          <text
                            x={centerX}
                            y={chartHeight - paddingBottom + 15}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#475569"
                            fontWeight="bold"
                          >
                            舒張壓
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}

            {/* Pagination Indicators (• •) */}
            <div className="flex items-center justify-center gap-2 pt-2 pb-1">
              <button
                type="button"
                onClick={() => setActiveChartSlide(0)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  activeChartSlide === 0 ? 'bg-slate-800 scale-125' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label="切換至折線趨勢圖"
              />
              <button
                type="button"
                onClick={() => setActiveChartSlide(1)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  activeChartSlide === 1 ? 'bg-slate-800 scale-125' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label="切換至盒鬚分佈圖"
              />
            </div>
          </div>
        </div>

        {/* 4. 722 BLOOD PRESSURE SUMMARY CARD BUTTON (IMG_8885) */}
        <div className="px-3.5 pt-3 pb-1.5">
          <button
            type="button"
            onClick={() => setShow722Modal(true)}
            className="w-full bg-white rounded-2xl border border-slate-200/90 px-4 py-3.5 shadow-xs hover:border-orange-400 transition-all flex items-center justify-between group cursor-pointer"
          >
            <span className="font-extrabold text-[1.0625rem] text-slate-900 group-hover:text-orange-600 transition-colors">
              722血壓量測數據紀錄
            </span>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 transition-colors" />
          </button>
        </div>

        {/* 5. DAILY MEASUREMENT RECORDS TABLE (IMG_8885) */}
        <div className="mt-2 bg-white border-y border-slate-200">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-3 border-b border-slate-100 text-xs font-bold text-slate-500 bg-slate-50/70">
            <div className="col-span-4 text-left">時間</div>
            <div className="col-span-3 text-center">
              <div>收縮壓</div>
              <div className="text-[10px] text-slate-400">mmHg</div>
            </div>
            <div className="col-span-2 text-center">
              <div>舒張壓</div>
              <div className="text-[10px] text-slate-400">mmHg</div>
            </div>
            <div className="col-span-3 text-right pr-2">心律</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRecordDetail(r)}
                className="grid grid-cols-12 px-4 py-3 items-center hover:bg-orange-50/30 transition-colors cursor-pointer"
              >
                {/* 1. 時間 */}
                <div className="col-span-4 text-left">
                  <div
                    className={`text-[13px] font-bold ${
                      r.isStrikethrough ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {r.dateStr}
                  </div>
                  <div
                    className={`text-xs ${
                      r.isStrikethrough ? 'line-through text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {r.timeStr}
                  </div>
                </div>

                {/* 2. 收縮壓 */}
                <div className="col-span-3 text-center">
                  <span
                    className={`text-[15px] font-black ${
                      r.isStrikethrough
                        ? 'line-through text-slate-400'
                        : r.systolic >= 140
                        ? 'text-red-600'
                        : 'text-slate-900'
                    }`}
                  >
                    {r.systolic}
                  </span>
                </div>

                {/* 3. 舒張壓 */}
                <div className="col-span-2 text-center">
                  <span
                    className={`text-[15px] font-black ${
                      r.isStrikethrough
                        ? 'line-through text-slate-400'
                        : r.diastolic >= 90
                        ? 'text-red-600'
                        : 'text-slate-900'
                    }`}
                  >
                    {r.diastolic}
                  </span>
                </div>

                {/* 4. 心律 + 狀態 Badge + Arrow */}
                <div className="col-span-3 flex items-center justify-end gap-1.5">
                  <span
                    className={`text-[13px] font-bold ${
                      r.isStrikethrough ? 'line-through text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {r.pulse}
                  </span>

                  {/* Status Pill Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border leading-none ${
                      r.status === 'urgent'
                        ? 'bg-red-50 text-red-600 border-red-300'
                        : r.status === 'warning'
                        ? 'bg-amber-50 text-amber-600 border-amber-300'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-300'
                    }`}
                  >
                    {r.statusLabel}
                  </span>

                  {/* Right Arrow */}
                  <ChevronRight className="w-4 h-4 text-orange-500 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BLOOD PRESSURE MEASUREMENT MODAL / SHEET (IMG_8886) */}
      {/* ========================================================= */}
      {showMeasurementModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-4 shadow-2xl w-full border-t border-slate-200 max-h-[96%] overflow-y-auto animate-in slide-in-from-bottom duration-250 flex flex-col justify-between">
            {/* Header: 請測量您的血壓 ⓠ */}
            <div className="flex items-center justify-center relative pb-2 pt-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[1.25rem] font-black text-slate-900 tracking-tight">
                  請測量您的血壓
                </h2>
                <button
                  type="button"
                  onClick={() => setShowInstructionHelp(true)}
                  className="text-slate-700 hover:text-orange-600 transition-colors p-1"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowMeasurementModal(false)}
                className="absolute right-0 text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Date & Time Selector Dropdown Button */}
            <div className="pt-2 pb-3 flex justify-center">
              <button
                type="button"
                onClick={() => setShowWheelDatePicker(!showWheelDatePicker)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-50/50 flex items-center justify-between text-slate-800 font-extrabold text-[1.0625rem] hover:border-orange-400 transition-all cursor-pointer shadow-2xs"
              >
                <span>{measureDateTime}</span>
                <span className="text-sm text-slate-500">∨</span>
              </button>
            </div>

            {/* 3 Input Value Boxes (收縮壓 | 舒張壓 | 心律) */}
            <div className="grid grid-cols-3 gap-2.5 pb-3">
              {/* 1. 收縮壓 */}
              <div
                onClick={() => setActiveInputSlot('sys')}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xs font-black text-slate-700">收縮壓</span>
                <div
                  className={`w-full h-13 rounded-xl border-2 flex items-center justify-center text-center transition-all bg-white shadow-2xs ${
                    activeInputSlot === 'sys'
                      ? 'border-[#f97316] ring-2 ring-orange-200/60'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span
                    className={`text-[1.1875rem] font-black ${
                      inputSys ? 'text-slate-900' : 'text-slate-400 font-normal'
                    }`}
                  >
                    {inputSys || 'mmHg'}
                  </span>
                </div>
              </div>

              {/* 2. 舒張壓 */}
              <div
                onClick={() => setActiveInputSlot('dia')}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xs font-black text-slate-700">舒張壓</span>
                <div
                  className={`w-full h-13 rounded-xl border-2 flex items-center justify-center text-center transition-all bg-white shadow-2xs ${
                    activeInputSlot === 'dia'
                      ? 'border-[#f97316] ring-2 ring-orange-200/60'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span
                    className={`text-[1.1875rem] font-black ${
                      inputDia ? 'text-slate-900' : 'text-slate-400 font-normal'
                    }`}
                  >
                    {inputDia || 'mmHg'}
                  </span>
                </div>
              </div>

              {/* 3. 心律 */}
              <div
                onClick={() => setActiveInputSlot('pulse')}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xs font-black text-slate-700">心律</span>
                <div
                  className={`w-full h-13 rounded-xl border-2 flex items-center justify-center text-center transition-all bg-white shadow-2xs ${
                    activeInputSlot === 'pulse'
                      ? 'border-[#f97316] ring-2 ring-orange-200/60'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span
                    className={`text-[1.1875rem] font-black ${
                      inputPulse ? 'text-slate-900' : 'text-slate-400 font-normal'
                    }`}
                  >
                    {inputPulse || '次/分'}
                  </span>
                </div>
              </div>
            </div>

            {/* 12-BUTTON NUMERIC KEYPAD (IMG_8886) */}
            <div className="bg-slate-100/80 rounded-2xl p-2.5 mb-3 border border-slate-200/80">
              <div className="grid grid-cols-3 gap-2 text-[1.4375rem] font-bold text-slate-900">
                {/* Row 1: 7, 8, 9 */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('7')}
                  className="h-11 rounded-xl bg-white shadow-2xs hover:bg-orange-50 active:bg-orange-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  7
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('8')}
                  className="h-11 rounded-xl bg-white shadow-2xs hover:bg-orange-50 active:bg-orange-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  8
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('9')}
                  className="h-11 rounded-xl bg-white shadow-2xs hover:bg-orange-50 active:bg-orange-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  9
                </button>

                {/* Row 2: 4, 5, 6 */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('4')}
                  className="h-11 rounded-xl bg-white shadow-2xs hover:bg-orange-50 active:bg-orange-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('5')}
                  className="h-11 rounded-xl bg-white shadow-2xs hover:bg-orange-50 active:bg-orange-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('6')}
                  className="h-11 rounded-xl bg-white shadow-2xs hover:bg-orange-50 active:bg-orange-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  6
                </button>

                {/* Row 3: 1, 2, 3 */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('1')}
                  className="h-11 rounded-xl bg-white shadow-2xs hover:bg-orange-50 active:bg-orange-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('2')}
                  className="h-11 rounded-xl bg-white shadow-2xs hover:bg-orange-50 active:bg-orange-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('3')}
                  className="h-11 rounded-xl bg-white shadow-2xs hover:bg-orange-50 active:bg-orange-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  3
                </button>

                {/* Row 4: Blank, 0, 刪除 */}
                <div className="h-11" />
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-11 rounded-xl bg-white shadow-2xs hover:bg-orange-50 active:bg-orange-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('DEL')}
                  className="h-11 rounded-xl bg-white shadow-2xs text-red-600 font-extrabold hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center text-[1.1875rem] cursor-pointer"
                >
                  刪除
                </button>
              </div>
            </div>

            {/* Quick Upload Action Buttons (拍照上傳 | 藍牙上傳) */}
            <div className="space-y-1.5 mb-3">
              <div className="grid grid-cols-2 gap-2.5">
                {/* 拍照上傳 */}
                <button
                  type="button"
                  onClick={() => {
                    setInputSys('124');
                    setInputDia('82');
                    setInputPulse('70');
                    setToastMessage('已透過影像辨識自動填入血壓值 124/82 mmHg');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#f97316] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#ea580c] active:scale-98 transition-all cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>拍照上傳</span>
                </button>

                {/* 藍牙上傳 */}
                <button
                  type="button"
                  onClick={() => {
                    setInputSys('118');
                    setInputDia('78');
                    setInputPulse('68');
                    setToastMessage('已成功同步歐姆龍藍牙血壓計數值');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white border-2 border-[#f97316] text-[#f97316] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:bg-orange-50 active:scale-98 transition-all cursor-pointer"
                >
                  <Bluetooth className="w-4 h-4 text-[#f97316]" />
                  <span>藍牙上傳</span>
                </button>
              </div>

              {/* 使用說明 link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowInstructionHelp(true)}
                  className="text-[11px] font-extrabold text-[#f97316] hover:underline inline-flex items-center gap-0.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>使用說明</span>
                </button>
              </div>
            </div>

            {/* Note field */}
            <div className="mb-4">
              <input
                type="text"
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
                placeholder="備註"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            {/* Bottom Buttons: (取消 | 完成) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowMeasurementModal(false)}
                className="py-3 rounded-full border-2 border-[#f97316] text-[#f97316] font-black text-sm bg-white hover:bg-orange-50 active:scale-98 transition-all cursor-pointer"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleSaveMeasurement}
                disabled={!isFormComplete}
                className={`py-3 rounded-full font-black text-sm transition-all shadow-md cursor-pointer ${
                  isFormComplete
                    ? 'bg-[#f97316] text-white hover:bg-[#ea580c] active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 722 BLOOD PRESSURE GUIDELINE & STATS MODAL */}
      {/* ========================================================= */}
      {show722Modal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-black text-slate-900 text-base">📊 722 血壓量測原則</h3>
              <button onClick={() => setShow722Modal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 font-medium">
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 space-y-1">
                <div className="font-extrabold text-orange-700">什麼是 722 原則？</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><strong>「7」連續七天</strong>：每週連續記錄 7 天</li>
                  <li><strong>「2」早晚各量一回</strong>：起床後與就寢前各量 1 次</li>
                  <li><strong>「2」每次量兩遍</strong>：間隔 1 分鐘量兩遍並取平均值</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-800">您的近7天達成率</div>
                <div className="flex items-center justify-between text-[11px] font-bold pt-1">
                  <span>早晨達標：5 / 7 天</span>
                  <span className="text-emerald-600">良好</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>晚間達標：4 / 7 天</span>
                  <span className="text-amber-600">需留意</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShow722Modal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RECORD DETAIL & STRIKETHROUGH TOGGLE MODAL */}
      {/* ========================================================= */}
      {selectedRecordDetail && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-black text-slate-900 text-base">血壓量測詳細記錄</h3>
              <button onClick={() => setSelectedRecordDetail(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">量測時間</span>
                <span className="text-slate-900 font-extrabold">{selectedRecordDetail.fullDateTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">收縮壓 (SBP)</span>
                <span className="text-orange-600 font-black text-sm">{selectedRecordDetail.systolic} mmHg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">舒張壓 (DBP)</span>
                <span className="text-sky-600 font-black text-sm">{selectedRecordDetail.diastolic} mmHg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">心律 (HR)</span>
                <span className="text-amber-600 font-black text-sm">{selectedRecordDetail.pulse} 次/分</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">評估狀態</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedRecordDetail.status === 'urgent' ? 'bg-red-100 text-red-700' : selectedRecordDetail.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedRecordDetail.statusLabel}
                </span>
              </div>
              {selectedRecordDetail.note && (
                <div className="py-1">
                  <span className="text-slate-500 font-bold">備註：</span>
                  <p className="text-slate-700 mt-0.5">{selectedRecordDetail.note}</p>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setRecords((prev) =>
                    prev.map((r) =>
                      r.id === selectedRecordDetail.id
                        ? { ...r, isStrikethrough: !r.isStrikethrough }
                        : r
                    )
                  );
                  setSelectedRecordDetail(null);
                  setToastMessage('已更新此筆量測標記狀態');
                  setTimeout(() => setToastMessage(null), 2000);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                {selectedRecordDetail.isStrikethrough ? '恢復此筆有效紀錄' : '劃除此筆異常紀錄 (刪除線)'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecordDetail(null)}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* INSTRUCTION & MEASUREMENT GUIDE MODAL */}
      {/* ========================================================= */}
      {showInstructionHelp && (
        <div className="absolute inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-slate-900 text-base">ⓘ 正確血壓量測指引</h3>
              <button onClick={() => setShowInstructionHelp(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <div className="flex items-start gap-2">
                <span className="font-bold text-orange-600">1.</span>
                <span>量測前請在安靜環境坐著休息 5 分鐘，不說話、不滑手機。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-orange-600">2.</span>
                <span>壓脈帶綁於手肘上方 1~2 公分處，鬆緊度以可伸入 1~2 根手指為宜。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-orange-600">3.</span>
                <span>手部平放桌上，壓脈帶中心點保持與心臟同高。</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInstructionHelp(false)}
              className="w-full py-2.5 bg-[#f97316] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#ea580c] transition-all cursor-pointer"
            >
              了解
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
