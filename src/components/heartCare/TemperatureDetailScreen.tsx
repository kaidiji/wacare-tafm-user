import React, { useState, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  Plus,
  ChevronRight,
  HelpCircle,
  X,
  Check,
  Thermometer,
  Activity
} from 'lucide-react';
import { VitalsData } from './heartCareData';

export interface BTRecordItem {
  id: string;
  dateStr: string;
  timeStr: string;
  fullDateTime: string;
  bodyTemp: number; // e.g. 36.8 °C
  status: 'normal' | 'warning' | 'urgent'; // 普通 (36.0-37.5) | 留意 (37.6-37.9) | 緊急 (>=38.0 或 <35.0)
  statusLabel: string;
  isStrikethrough?: boolean;
  note?: string;
}

export const INITIAL_BT_RECORDS: BTRecordItem[] = [
  {
    id: 'bt_1',
    dateStr: '2026-08-10',
    timeStr: '08:30 早晨',
    fullDateTime: '2026-08-10 08:30',
    bodyTemp: 36.6,
    status: 'normal',
    statusLabel: '普通',
    isStrikethrough: false,
    note: '耳溫槍量測',
  },
  {
    id: 'bt_2',
    dateStr: '2026-08-08',
    timeStr: '19:40 晚間',
    fullDateTime: '2026-08-08 19:40',
    bodyTemp: 36.8,
    status: 'normal',
    statusLabel: '普通',
    isStrikethrough: false,
  },
  {
    id: 'bt_3',
    dateStr: '2026-08-05',
    timeStr: '14:10 午間',
    fullDateTime: '2026-08-05 14:10',
    bodyTemp: 37.7,
    status: 'warning',
    statusLabel: '留意',
    isStrikethrough: false,
    note: '感覺微熱，已多喝溫水休息',
  },
  {
    id: 'bt_4',
    dateStr: '2026-08-03',
    timeStr: '08:15 早晨',
    fullDateTime: '2026-08-03 08:15',
    bodyTemp: 36.5,
    status: 'normal',
    statusLabel: '普通',
    isStrikethrough: false,
  },
  {
    id: 'bt_5',
    dateStr: '2026-07-29',
    timeStr: '20:10 晚間',
    fullDateTime: '2026-07-29 20:10',
    bodyTemp: 38.3,
    status: 'urgent',
    statusLabel: '緊急',
    isStrikethrough: true,
    note: '剛喝熱湯後立即測量，數值偏高已重測作廢',
  },
  {
    id: 'bt_6',
    dateStr: '2026-07-22',
    timeStr: '08:20 早晨',
    fullDateTime: '2026-07-22 08:20',
    bodyTemp: 36.7,
    status: 'normal',
    statusLabel: '普通',
    isStrikethrough: false,
  },
  {
    id: 'bt_7',
    dateStr: '2026-07-15',
    timeStr: '08:10 早晨',
    fullDateTime: '2026-07-15 08:10',
    bodyTemp: 36.6,
    status: 'normal',
    statusLabel: '普通',
    isStrikethrough: false,
  },
];

interface Props {
  onBack: () => void;
  nickname?: string;
  currentVitals?: VitalsData;
  onUpdateVitals?: (vitals: Partial<VitalsData>) => void;
}

export const TemperatureDetailScreen: React.FC<Props> = ({
  onBack,
  nickname = '陳小明',
  currentVitals,
  onUpdateVitals,
}) => {
  const [records, setRecords] = useState<BTRecordItem[]>(() => {
    if (currentVitals && currentVitals.bodyTemp !== undefined) {
      const bt = currentVitals.bodyTemp;
      let status: 'normal' | 'warning' | 'urgent' = 'normal';
      let statusLabel = '普通';
      if (bt >= 38.0 || bt < 35.0) {
        status = 'urgent';
        statusLabel = '緊急';
      } else if (bt >= 37.6) {
        status = 'warning';
        statusLabel = '留意';
      }
      return [
        {
          id: 'bt_current',
          dateStr: '2026-08-10',
          timeStr: '08:30 早晨',
          fullDateTime: '2026-08-10 08:30',
          bodyTemp: bt,
          status,
          statusLabel,
          isStrikethrough: false,
          note: '最新量測紀錄',
        },
        ...INITIAL_BT_RECORDS.slice(1),
      ];
    }
    return INITIAL_BT_RECORDS;
  });

  const [activeChartSlide, setActiveChartSlide] = useState<number>(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('所有');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState<boolean>(false);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<BTRecordItem | null>(null);
  const [showGuidelineModal, setShowGuidelineModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Touch Swipe
  const touchStartXRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    touchStartXRef.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartXRef.current === null) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = touchStartXRef.current - clientX;
    if (diff > 40) setActiveChartSlide(1);
    else if (diff < -40) setActiveChartSlide(0);
    touchStartXRef.current = null;
  };

  // Measurement input states
  const [measureDateTime, setMeasureDateTime] = useState<string>(() => {
    const d = new Date();
    const YYYY = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${YYYY}/${MM}/${DD} ${hh}:${mm}`;
  });
  const [inputTemp, setInputTemp] = useState<string>('');
  const [inputNote, setInputNote] = useState<string>('');

  const handleKeypadPress = (key: string) => {
    if (key === 'DEL') {
      setInputTemp((prev) => prev.slice(0, -1));
    } else if (key === '.') {
      if (!inputTemp.includes('.') && inputTemp.length > 0) {
        setInputTemp((prev) => prev + '.');
      }
    } else {
      if (inputTemp.length < 4) {
        setInputTemp((prev) => prev + key);
      }
    }
  };

  const isFormComplete = Boolean(inputTemp && parseFloat(inputTemp) >= 30);

  const handleSaveMeasurement = () => {
    if (!isFormComplete) return;

    const bt = parseFloat(inputTemp) || 36.5;

    let status: 'normal' | 'warning' | 'urgent' = 'normal';
    let statusLabel = '普通';
    if (bt >= 38.0 || bt < 35.0) {
      status = 'urgent';
      statusLabel = '緊急';
    } else if (bt >= 37.6) {
      status = 'warning';
      statusLabel = '留意';
    }

    const [dPart, tPart] = measureDateTime.split(' ');
    const hour = parseInt(tPart.split(':')[0], 10);
    let timeLabel = '早晨';
    if (hour >= 11 && hour < 18) timeLabel = '午間';
    else if (hour >= 18) timeLabel = '晚間';

    const newRecord: BTRecordItem = {
      id: `bt_${Date.now()}`,
      dateStr: dPart.replace(/\//g, '-'),
      timeStr: `${tPart} ${timeLabel}`,
      fullDateTime: measureDateTime,
      bodyTemp: bt,
      status,
      statusLabel,
      isStrikethrough: false,
      note: inputNote,
    };

    setRecords([newRecord, ...records]);
    if (onUpdateVitals) {
      onUpdateVitals({
        bodyTemp: bt,
      });
    }

    setShowMeasurementModal(false);
    setInputTemp('');
    setInputNote('');

    setToastMessage('體溫量測紀錄已成功儲存！');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredRecords = useMemo(() => {
    if (selectedFilter === '所有') return records;
    if (selectedFilter === '早晨') return records.filter((r) => r.timeStr.includes('早晨'));
    if (selectedFilter === '午間') return records.filter((r) => r.timeStr.includes('午間'));
    if (selectedFilter === '晚間') return records.filter((r) => r.timeStr.includes('晚間'));
    return records;
  }, [records, selectedFilter]);

  const chartPoints = useMemo(() => {
    const list = [...records].slice(0, 7).reverse();
    return list.map((r) => {
      const parts = r.dateStr.split('-');
      const shortDate = parts.length >= 3 ? `${parts[1]}/${parts[2]}` : r.dateStr;
      return {
        date: shortDate,
        bodyTemp: r.bodyTemp,
      };
    });
  }, [records]);

  // Chart Geometry (Range: 35.0 ~ 39.5 °C)
  const chartWidth = 340;
  const chartHeight = 160;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 15;
  const paddingBottom = 25;

  const minY = 35.0;
  const maxY = 39.5;
  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    const ratio = (clamped - minY) / (maxY - minY);
    return paddingTop + (1 - ratio) * (chartHeight - paddingTop - paddingBottom);
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return paddingLeft + (chartWidth - paddingLeft - paddingRight) / 2;
    const step = (chartWidth - paddingLeft - paddingRight) / (total - 1);
    return paddingLeft + index * step;
  };

  const boxPlotStats = useMemo(() => {
    const btValues = records.map((r) => r.bodyTemp).sort((a, b) => a - b);
    const getStats = (arr: number[]) => {
      if (arr.length === 0) return { min: 36.2, q1: 36.5, median: 36.7, q3: 37.0, max: 37.8 };
      return {
        min: arr[0],
        q1: arr[Math.floor(arr.length * 0.25)],
        median: arr[Math.floor(arr.length / 2)],
        q3: arr[Math.floor(arr.length * 0.75)],
        max: arr[arr.length - 1],
      };
    };
    return getStats(btValues);
  }, [records]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-800 overflow-hidden relative select-none">
      {/* Toast */}
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

      {/* TOP HEADER: (Back Button | {nickname} 體溫 | + Button) */}
      <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-slate-200 shrink-0 sticky top-0 z-30">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
          aria-label="返回"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-[1.1875rem] font-black text-slate-900 tracking-tight">
          {nickname} 體溫
        </h1>

        <button
          type="button"
          onClick={() => setShowMeasurementModal(true)}
          className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
          aria-label="新增體溫量測"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* SCROLLABLE MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8 pt-2">
        {/* 2. FILTER & ACTION ROW */}
        <div className="px-4 py-1.5 flex items-center justify-between relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1 text-[1.0625rem] font-black text-slate-900 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <span>{selectedFilter}</span>
              <span className="text-xs text-slate-500">▾</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 w-36 text-xs font-bold text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                {['所有', '早晨', '午間', '晚間'].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setSelectedFilter(f);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center justify-between ${
                      selectedFilter === f ? 'text-rose-600 font-black bg-rose-50/50' : ''
                    }`}
                  >
                    <span>{f}</span>
                    {selectedFilter === f && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer"
              title="體溫說明"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3. CHARTS */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          className="px-3 py-1 relative cursor-grab active:cursor-grabbing"
        >
          <div className="bg-white rounded-3xl p-3 shadow-xs border border-slate-200/80 overflow-hidden">
            {activeChartSlide === 0 ? (
              <div className="animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-bold text-slate-700 px-3 pt-1 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>體溫 (°C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-2.5 rounded-xs bg-emerald-100 border border-emerald-300" />
                    <span>正常標準 (36.0~37.5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-2.5 rounded-xs bg-amber-100 border border-amber-300" />
                    <span>微熱留意 (37.6~37.9)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-2.5 rounded-xs bg-red-100 border border-red-300" />
                    <span>發燒警戒 (≥38.0)</span>
                  </div>
                </div>

                <div className="relative w-full h-[180px] mt-1 select-none">
                  <div
                    className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}
                  >
                    °C
                  </div>

                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                    {/* Normal Band (36.0 ~ 37.5) */}
                    <rect
                      x={paddingLeft}
                      y={getY(37.5)}
                      width={chartWidth - paddingLeft - paddingRight}
                      height={getY(36.0) - getY(37.5)}
                      fill="#d1fae5"
                      opacity="0.5"
                    />
                    {/* Warning Band (37.5 ~ 38.0) */}
                    <rect
                      x={paddingLeft}
                      y={getY(38.0)}
                      width={chartWidth - paddingLeft - paddingRight}
                      height={getY(37.5) - getY(38.0)}
                      fill="#fef3c7"
                      opacity="0.5"
                    />

                    {/* Threshold 37.5 line */}
                    <line
                      x1={paddingLeft}
                      y1={getY(37.5)}
                      x2={chartWidth - paddingRight}
                      y2={getY(37.5)}
                      stroke="#059669"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                    <text x={paddingLeft - 2} y={getY(37.5) + 3} textAnchor="end" fontSize="9" fill="#059669" fontWeight="bold">
                      37.5
                    </text>

                    {/* Threshold 38.0 line */}
                    <line
                      x1={paddingLeft}
                      y1={getY(38.0)}
                      x2={chartWidth - paddingRight}
                      y2={getY(38.0)}
                      stroke="#dc2626"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                    <text x={paddingLeft - 2} y={getY(38.0) + 3} textAnchor="end" fontSize="9" fill="#dc2626" fontWeight="bold">
                      38.0
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

                    {/* Polyline */}
                    <polyline
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartPoints.map((pt, i) => `${getX(i, chartPoints.length)},${getY(pt.bodyTemp)}`).join(' ')}
                    />

                    {/* Data Points */}
                    {chartPoints.map((pt, i) => {
                      const x = getX(i, chartPoints.length);
                      return (
                        <g key={i}>
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

                          <circle cx={x} cy={getY(pt.bodyTemp)} r="4" fill="#e11d48" stroke="#fff" strokeWidth="1.5" />
                          <text
                            x={x}
                            y={getY(pt.bodyTemp) - 7}
                            textAnchor="middle"
                            fontSize="8.5"
                            fill="#be123c"
                            fontWeight="bold"
                          >
                            {pt.bodyTemp}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            ) : (
              /* Slide 1: BOX PLOT */
              <div className="animate-in fade-in duration-200">
                <div className="text-center pb-1">
                  <span className="text-xs font-black text-slate-700">體溫數值分佈 (箱型盒鬚圖)</span>
                </div>

                <div className="relative w-full h-[180px] mt-1 select-none">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                    <rect
                      x={paddingLeft}
                      y={getY(37.5)}
                      width={chartWidth - paddingLeft - paddingRight}
                      height={getY(36.0) - getY(37.5)}
                      fill="#d1fae5"
                      opacity="0.45"
                    />

                    {(() => {
                      const centerX = chartWidth / 2;
                      const boxW = 50;
                      const s = boxPlotStats;
                      return (
                        <g>
                          <line
                            x1={centerX}
                            y1={getY(s.max)}
                            x2={centerX}
                            y2={getY(s.min)}
                            stroke="#e11d48"
                            strokeWidth="1.5"
                          />
                          <line
                            x1={centerX - 15}
                            y1={getY(s.max)}
                            x2={centerX + 15}
                            y2={getY(s.max)}
                            stroke="#e11d48"
                            strokeWidth="2"
                          />
                          <line
                            x1={centerX - 15}
                            y1={getY(s.min)}
                            x2={centerX + 15}
                            y2={getY(s.min)}
                            stroke="#e11d48"
                            strokeWidth="2"
                          />
                          <rect
                            x={centerX - boxW / 2}
                            y={getY(s.q3)}
                            width={boxW}
                            height={Math.max(4, getY(s.q1) - getY(s.q3))}
                            fill="#ffe4e6"
                            stroke="#e11d48"
                            strokeWidth="1.5"
                            rx="4"
                          />
                          <line
                            x1={centerX - boxW / 2}
                            y1={getY(s.median)}
                            x2={centerX + boxW / 2}
                            y2={getY(s.median)}
                            stroke="#be123c"
                            strokeWidth="2.5"
                          />
                          <text x={centerX + boxW / 2 + 8} y={getY(s.max) + 3} fontSize="9" fill="#be123c" fontWeight="bold">
                            Max: {s.max}°C
                          </text>
                          <text x={centerX + boxW / 2 + 8} y={getY(s.median) + 3} fontSize="9" fill="#be123c" fontWeight="bold">
                            中位: {s.median}°C
                          </text>
                          <text x={centerX + boxW / 2 + 8} y={getY(s.min) + 3} fontSize="9" fill="#be123c" fontWeight="bold">
                            Min: {s.min}°C
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-2 pb-1">
              <button
                type="button"
                onClick={() => setActiveChartSlide(0)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeChartSlide === 0 ? 'bg-rose-600 w-4' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label="趨勢折線圖"
              />
              <button
                type="button"
                onClick={() => setActiveChartSlide(1)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeChartSlide === 1 ? 'bg-rose-600 w-4' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label="盒鬚分佈圖"
              />
            </div>
          </div>
        </div>

        {/* 4. GUIDELINE BUTTON */}
        <div className="p-3.5 pt-2">
          <button
            type="button"
            onClick={() => setShowGuidelineModal(true)}
            className="w-full bg-[#f1f5f9] hover:bg-slate-200/80 transition-colors rounded-2xl py-3 px-4 flex items-center justify-between text-slate-800 text-[13px] font-extrabold shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-600" />
              <span>體溫量測規範與感染發燒預警指引</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* 5. MEASUREMENT RECORDS TABLE */}
        <div className="px-3 pb-4">
          <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold text-slate-600 border-b border-slate-200">
            <div className="col-span-4 text-left">時間</div>
            <div className="col-span-4 text-center">體溫 (°C)</div>
            <div className="col-span-4 text-right pr-2">狀態</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredRecords.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRecordDetail(r)}
                className="grid grid-cols-12 px-4 py-3 items-center hover:bg-rose-50/40 transition-colors cursor-pointer"
              >
                <div className="col-span-4 text-left">
                  <div className={`text-[13px] font-bold ${r.isStrikethrough ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {r.dateStr}
                  </div>
                  <div className={`text-xs ${r.isStrikethrough ? 'line-through text-slate-400' : 'text-slate-500'}`}>
                    {r.timeStr}
                  </div>
                </div>

                <div className="col-span-4 text-center">
                  <span
                    className={`text-[16px] font-black ${
                      r.isStrikethrough
                        ? 'line-through text-slate-400'
                        : r.bodyTemp >= 38.0 || r.bodyTemp < 35.0
                        ? 'text-red-600'
                        : r.bodyTemp >= 37.6
                        ? 'text-amber-600'
                        : 'text-slate-900'
                    }`}
                  >
                    {r.bodyTemp} °C
                  </span>
                </div>

                <div className="col-span-4 flex items-center justify-end gap-1.5">
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

                  <ChevronRight className="w-4 h-4 text-rose-500 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MEASUREMENT MODAL */}
      {showMeasurementModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-4 shadow-2xl w-full border-t border-slate-200 max-h-[96%] overflow-y-auto animate-in slide-in-from-bottom duration-250 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-[1.125rem] font-black text-slate-900">體溫量測輸入</h2>
              <button
                type="button"
                onClick={() => setShowMeasurementModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="pt-2 pb-3 flex justify-center">
              <div className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-50/50 flex items-center justify-between text-slate-800 font-extrabold text-[1.0625rem] shadow-2xs">
                <span>{measureDateTime}</span>
                <span className="text-xs text-slate-400">量測時間</span>
              </div>
            </div>

            {/* Input Slot */}
            <div className="pb-3 flex flex-col items-center gap-1">
              <span className="text-xs font-black text-slate-700">體溫 (°C)</span>
              <div className="w-44 h-14 rounded-xl border-2 border-rose-500 ring-2 ring-rose-200 flex items-center justify-center text-center bg-white shadow-2xs">
                <span className={`text-[1.5rem] font-black ${inputTemp ? 'text-slate-900' : 'text-slate-400 font-normal'}`}>
                  {inputTemp || '0.0 °C'}
                </span>
              </div>
            </div>

            {/* Keypad */}
            <div className="bg-slate-100/80 rounded-2xl p-2.5 mb-3 border border-slate-200/80">
              <div className="grid grid-cols-3 gap-2 text-[1.4375rem] font-bold text-slate-900">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'DEL'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadPress(k)}
                    className={`h-11 rounded-xl bg-white shadow-2xs hover:bg-rose-50 active:bg-rose-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
                      k === 'DEL' ? 'text-base font-black text-red-500' : ''
                    }`}
                  >
                    {k === 'DEL' ? '⌫' : k}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveMeasurement}
              disabled={!isFormComplete}
              className={`w-full py-3 rounded-full font-black text-sm transition-all shadow-md cursor-pointer ${
                isFormComplete ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-98' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              完成儲存
            </button>
          </div>
        </div>
      )}

      {/* RECORD DETAIL MODAL */}
      {selectedRecordDetail && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-black text-slate-900 text-base">體溫詳細記錄</h3>
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
                <span className="text-slate-500 font-bold">體溫</span>
                <span className="text-rose-600 font-black text-sm">{selectedRecordDetail.bodyTemp} °C</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-bold">評估狀態</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedRecordDetail.status === 'urgent' ? 'bg-red-100 text-red-700' : selectedRecordDetail.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedRecordDetail.statusLabel}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setRecords((prev) =>
                    prev.map((r) =>
                      r.id === selectedRecordDetail.id ? { ...r, isStrikethrough: !r.isStrikethrough } : r
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
            </div>
          </div>
        </div>
      )}

      {/* GUIDELINE MODAL */}
      {showGuidelineModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-black text-slate-900 text-base">🌡️ 體溫與感染發燒預警指引</h3>
              <button onClick={() => setShowGuidelineModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <p><strong>正常區間</strong>：36.0 °C ~ 37.5 °C。</p>
              <p><strong>微熱留意</strong>：37.6 °C ~ 37.9 °C，請注意補充水分並多加休息。</p>
              <p><strong>發燒警示</strong>：≥ 38.0 °C 或 ＜ 35.0 °C，心衰竭患者發燒可能增加心臟負擔，請儘速就醫評估。</p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuidelineModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
