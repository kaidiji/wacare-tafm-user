import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Plus,
  ChevronRight,
  HelpCircle,
  X,
  Check,
  Droplet,
  Heart,
  Wand2,
  Calendar,
  Trash2
} from 'lucide-react';
import { VitalsData } from './heartCareData';

export interface OxygenRecordItem {
  id: string;
  dateStr: string; // e.g. "2026-08-18"
  timeDisplay: string; // e.g. "上午 10 : 43"
  fullDateTime: string; // "2026/8/18 10:43"
  hour: number; // 0 ~ 23 for daily chart plotting
  spO2: number; // percentage, e.g. 95
  pulse: number; // heart rate, e.g. 61
  status: 'normal' | 'warning' | 'urgent'; // 正常 (>=95%) | 留意 (90-94%) | 緊急 (<90%)
  statusLabel: string;
  isStrikethrough?: boolean;
  note?: string;
}

export const INITIAL_OXYGEN_RECORDS: OxygenRecordItem[] = [
  {
    id: 'ox_today_1',
    dateStr: '2026-08-18',
    timeDisplay: '上午 10 : 43',
    fullDateTime: '2026/8/18 10:43',
    hour: 10.7,
    spO2: 95,
    pulse: 61,
    status: 'normal',
    statusLabel: '正常',
    isStrikethrough: false,
  },
  {
    id: 'ox_1',
    dateStr: '2026-08-17',
    timeDisplay: '下午 03 : 20',
    fullDateTime: '2026/8/17 15:20',
    hour: 15.3,
    spO2: 96,
    pulse: 72,
    status: 'normal',
    statusLabel: '正常',
    isStrikethrough: false,
  },
  {
    id: 'ox_2',
    dateStr: '2026-08-16',
    timeDisplay: '上午 09 : 15',
    fullDateTime: '2026/8/16 09:15',
    hour: 9.25,
    spO2: 97,
    pulse: 68,
    status: 'normal',
    statusLabel: '正常',
    isStrikethrough: false,
  },
  {
    id: 'ox_3',
    dateStr: '2026-08-15',
    timeDisplay: '上午 11 : 05',
    fullDateTime: '2026/8/15 11:05',
    hour: 11.1,
    spO2: 93,
    pulse: 82,
    status: 'warning',
    statusLabel: '留意',
    isStrikethrough: false,
  },
  {
    id: 'ox_4',
    dateStr: '2026-08-14',
    timeDisplay: '下午 02 : 40',
    fullDateTime: '2026/8/14 14:40',
    hour: 14.6,
    spO2: 96,
    pulse: 70,
    status: 'normal',
    statusLabel: '正常',
    isStrikethrough: false,
  },
  {
    id: 'ox_5',
    dateStr: '2026-08-12',
    timeDisplay: '上午 08 : 30',
    fullDateTime: '2026/8/12 08:30',
    hour: 8.5,
    spO2: 98,
    pulse: 65,
    status: 'normal',
    statusLabel: '正常',
    isStrikethrough: false,
  },
  {
    id: 'ox_6',
    dateStr: '2026-08-10',
    timeDisplay: '上午 11 : 48',
    fullDateTime: '2026/8/10 11:48',
    hour: 11.8,
    spO2: 96,
    pulse: 72,
    status: 'normal',
    statusLabel: '正常',
    isStrikethrough: false,
  },
  {
    id: 'ox_7',
    dateStr: '2026-07-28',
    timeDisplay: '上午 10 : 15',
    fullDateTime: '2026/7/28 10:15',
    hour: 10.25,
    spO2: 97,
    pulse: 74,
    status: 'normal',
    statusLabel: '正常',
    isStrikethrough: false,
  },
  {
    id: 'ox_8',
    dateStr: '2026-06-15',
    timeDisplay: '上午 09 : 30',
    fullDateTime: '2026/6/15 09:30',
    hour: 9.5,
    spO2: 96,
    pulse: 70,
    status: 'normal',
    statusLabel: '正常',
    isStrikethrough: false,
  },
];

interface Props {
  onBack: () => void;
  nickname?: string;
  currentVitals?: VitalsData;
  onUpdateVitals?: (vitals: Partial<VitalsData>) => void;
}

export const OxygenDetailScreen: React.FC<Props> = ({
  onBack,
  currentVitals,
  onUpdateVitals,
}) => {
  // Interval Tabs: 日 / 週 / 月 / 年
  const [activeInterval, setActiveInterval] = useState<'day' | 'week' | 'month' | 'year'>('day');

  // Selected date reference (Default 2026-08-18)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 18, 10, 44));

  const [records, setRecords] = useState<OxygenRecordItem[]>(() => {
    if (currentVitals && currentVitals.spO2 !== undefined) {
      const ox = currentVitals.spO2;
      const p = currentVitals.heartRate || 61;
      let status: 'normal' | 'warning' | 'urgent' = 'normal';
      let statusLabel = '正常';
      if (ox < 90) {
        status = 'urgent';
        statusLabel = '緊急';
      } else if (ox < 95) {
        status = 'warning';
        statusLabel = '留意';
      }
      return [
        {
          id: 'ox_today_1',
          dateStr: '2026-08-18',
          timeDisplay: '上午 10 : 43',
          fullDateTime: '2026/8/18 10:43',
          hour: 10.7,
          spO2: ox,
          pulse: p,
          status,
          statusLabel,
          isStrikethrough: false,
        },
        ...INITIAL_OXYGEN_RECORDS.slice(1),
      ];
    }
    return INITIAL_OXYGEN_RECORDS;
  });

  // Modal states
  const [showMeasurementModal, setShowMeasurementModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<OxygenRecordItem | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal input states
  const [measureDateTime, setMeasureDateTime] = useState<string>('2026/8/18 10:44');
  const [activeInputSlot, setActiveInputSlot] = useState<'spO2' | 'pulse'>('spO2');
  const [inputSpO2, setInputSpO2] = useState<string>('');
  const [inputPulse, setInputPulse] = useState<string>('');

  const formatDateToYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const currentDateYMD = formatDateToYMD(currentDate);

  // Week range dates calculation (e.g. 2026/8/12 至 2026/8/18)
  const weekRange = useMemo(() => {
    const end = new Date(currentDate);
    const start = new Date(currentDate);
    start.setDate(start.getDate() - 6);

    const formatShort = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    const days: { dateObj: Date; dateStr: string; label: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(start);
      cur.setDate(cur.getDate() + i);
      days.push({
        dateObj: cur,
        dateStr: formatDateToYMD(cur),
        label: formatShort(cur),
      });
    }

    return {
      startDate: start,
      endDate: end,
      days,
    };
  }, [currentDate]);

  // Date Navigation handlers
  const handlePrevDate = () => {
    const next = new Date(currentDate);
    if (activeInterval === 'day') next.setDate(next.getDate() - 1);
    else if (activeInterval === 'week') next.setDate(next.getDate() - 7);
    else if (activeInterval === 'month') next.setMonth(next.getMonth() - 1);
    else if (activeInterval === 'year') next.setFullYear(next.getFullYear() - 1);
    setCurrentDate(next);
  };

  const handleNextDate = () => {
    const next = new Date(currentDate);
    if (activeInterval === 'day') next.setDate(next.getDate() + 1);
    else if (activeInterval === 'week') next.setDate(next.getDate() + 7);
    else if (activeInterval === 'month') next.setMonth(next.getMonth() + 1);
    else if (activeInterval === 'year') next.setFullYear(next.getFullYear() + 1);
    setCurrentDate(next);
  };

  const handleResetToToday = () => {
    setCurrentDate(new Date(2026, 7, 18, 10, 44));
  };

  // Open measurement modal
  const openNewMeasurement = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setMeasureDateTime(`${y}/${m}/${day} ${hh}:${mm}`);
    setInputSpO2('');
    setInputPulse('');
    setActiveInputSlot('spO2');
    setEditingRecord(null);
    setShowMeasurementModal(true);
  };

  // Open edit modal
  const openEditMeasurement = (rec: OxygenRecordItem) => {
    setEditingRecord(rec);
    setMeasureDateTime(rec.fullDateTime);
    setInputSpO2(String(rec.spO2));
    setInputPulse(String(rec.pulse));
    setActiveInputSlot('spO2');
    setShowMeasurementModal(true);
  };

  // Keypad press handler
  const handleKeypadPress = (key: string) => {
    if (key === 'DEL') {
      if (activeInputSlot === 'spO2') {
        setInputSpO2((prev) => prev.slice(0, -1));
      } else {
        setInputPulse((prev) => prev.slice(0, -1));
      }
    } else {
      if (activeInputSlot === 'spO2') {
        if (inputSpO2.length < 3) {
          const next = inputSpO2 + key;
          setInputSpO2(next);
          if (next.length === 2 && parseInt(next, 10) >= 80) {
            setActiveInputSlot('pulse');
          }
        }
      } else {
        if (inputPulse.length < 3) {
          setInputPulse((prev) => prev + key);
        }
      }
    }
  };

  // Simulation of OCR Photo Upload
  const handlePhotoUploadSim = () => {
    setInputSpO2('96');
    setInputPulse('68');
    setToastMessage('已成功辨識血氧儀數據：96 %、心律 68 bpm');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Save measurement
  const isFormComplete = Boolean(inputSpO2 && parseInt(inputSpO2, 10) > 0);

  const handleSaveMeasurement = () => {
    if (!isFormComplete) return;

    const ox = parseInt(inputSpO2, 10) || 95;
    const p = parseInt(inputPulse, 10) || 65;

    let status: 'normal' | 'warning' | 'urgent' = 'normal';
    let statusLabel = '正常';
    if (ox < 90) {
      status = 'urgent';
      statusLabel = '緊急';
    } else if (ox < 95) {
      status = 'warning';
      statusLabel = '留意';
    }

    // Parse time for display: e.g. "上午 10 : 43"
    const [dPart, tPart] = measureDateTime.split(' ');
    const parts = (tPart || '10:44').split(':');
    const hourNum = parseInt(parts[0], 10) || 10;
    const minNum = parseInt(parts[1], 10) || 0;
    const isPM = hourNum >= 12;
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    const timeDisplay = `${isPM ? '下午' : '上午'} ${displayHour < 10 ? '0' + displayHour : displayHour} : ${
      minNum < 10 ? '0' + minNum : minNum
    }`;

    const dateFormatted = dPart.replace(/\//g, '-');

    if (editingRecord) {
      // Update existing
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingRecord.id
            ? {
                ...r,
                fullDateTime: measureDateTime,
                dateStr: dateFormatted,
                timeDisplay,
                hour: hourNum + minNum / 60,
                spO2: ox,
                pulse: p,
                status,
                statusLabel,
              }
            : r
        )
      );
      setToastMessage('血氧記錄已成功更新！');
    } else {
      // Create new
      const newRec: OxygenRecordItem = {
        id: `ox_${Date.now()}`,
        dateStr: dateFormatted,
        timeDisplay,
        fullDateTime: measureDateTime,
        hour: hourNum + minNum / 60,
        spO2: ox,
        pulse: p,
        status,
        statusLabel,
        isStrikethrough: false,
      };
      setRecords([newRec, ...records]);
      setToastMessage('血氧量測記錄已新增！');
    }

    if (onUpdateVitals) {
      onUpdateVitals({
        spO2: ox,
        heartRate: p,
      });
    }

    setShowMeasurementModal(false);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Compute records and aggregation based on selected interval
  const { currentAverage, periodRecords } = useMemo(() => {
    let filtered: OxygenRecordItem[] = [];

    if (activeInterval === 'day') {
      filtered = records.filter((r) => r.dateStr === currentDateYMD && !r.isStrikethrough);
      if (filtered.length === 0) {
        filtered = records.filter((r) => !r.isStrikethrough).slice(0, 1);
      }
    } else if (activeInterval === 'week') {
      const startStr = formatDateToYMD(weekRange.startDate);
      const endStr = formatDateToYMD(weekRange.endDate);
      filtered = records.filter(
        (r) => r.dateStr >= startStr && r.dateStr <= endStr && !r.isStrikethrough
      );
      if (filtered.length === 0) {
        filtered = records.filter((r) => !r.isStrikethrough).slice(0, 1);
      }
    } else if (activeInterval === 'month') {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const prefix = `${year}-${month}`;
      filtered = records.filter((r) => r.dateStr.startsWith(prefix) && !r.isStrikethrough);
      if (filtered.length === 0) {
        filtered = records.filter((r) => !r.isStrikethrough).slice(0, 1);
      }
    } else if (activeInterval === 'year') {
      const year = String(currentDate.getFullYear());
      filtered = records.filter((r) => r.dateStr.startsWith(year) && !r.isStrikethrough);
      if (filtered.length === 0) {
        filtered = records.filter((r) => !r.isStrikethrough).slice(0, 1);
      }
    }

    const sum = filtered.reduce((acc, cur) => acc + cur.spO2, 0);
    const avg = filtered.length > 0 ? Math.round(sum / filtered.length) : 95;

    return {
      currentAverage: avg,
      periodRecords: filtered,
    };
  }, [activeInterval, records, currentDate, currentDateYMD, weekRange]);

  // Chart plotting constants
  const chartWidth = 300;
  const chartHeight = 160;
  const padLeft = 34;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;

  const minY = 60;
  const maxY = 100;

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    const ratio = (clamped - minY) / (maxY - minY);
    return padTop + (1 - ratio) * (chartHeight - padTop - padBottom);
  };

  const getDayX = (hourVal: number) => {
    const clamped = Math.max(0, Math.min(24, hourVal));
    const ratio = clamped / 24;
    return padLeft + ratio * (chartWidth - padLeft - padRight);
  };

  const getWeekX = (dayIndex: number) => {
    // 7 days (index 0 to 6)
    const step = (chartWidth - padLeft - padRight) / 6;
    return padLeft + dayIndex * step;
  };

  const getMonthX = (dayOfMonth: number) => {
    // 1 to 31
    const ratio = Math.max(0, Math.min(1, (dayOfMonth - 1) / 30));
    return padLeft + ratio * (chartWidth - padLeft - padRight);
  };

  const getYearX = (monthIndex: number) => {
    // 0 to 11 (12 months)
    const step = (chartWidth - padLeft - padRight) / 11;
    return padLeft + monthIndex * step;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-slate-800 overflow-hidden relative select-none font-sans">
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

      {/* TOP HEADER: Back | 血氧 | + Button */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 shrink-0 sticky top-0 z-30">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
          aria-label="返回"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.2]" />
        </button>

        <h1 className="text-[1.125rem] font-bold text-slate-900 tracking-tight">
          血氧
        </h1>

        <button
          type="button"
          onClick={openNewMeasurement}
          className="w-8 h-8 rounded-full bg-[#f26f21] hover:bg-[#e05e10] flex items-center justify-center text-white active:scale-95 transition-all shadow-2xs cursor-pointer"
          aria-label="新增血氧記錄"
        >
          <Plus className="w-5 h-5 stroke-[2.8]" />
        </button>
      </div>

      {/* TABS: 日 / 週 / 月 / 年 */}
      <div className="flex items-center justify-around border-b border-orange-500/20 bg-white shrink-0">
        {[
          { key: 'day', label: '日' },
          { key: 'week', label: '週' },
          { key: 'month', label: '月' },
          { key: 'year', label: '年' },
        ].map((tab) => {
          const isActive = activeInterval === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveInterval(tab.key as any)}
              className={`flex-1 py-3 text-center text-[0.9375rem] font-bold transition-all relative cursor-pointer ${
                isActive ? 'text-[#f26f21]' : 'text-slate-800 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f26f21]" />
              )}
            </button>
          );
        })}
      </div>

      {/* DATE SELECTOR ROW (Per interval templates) */}
      {activeInterval === 'day' && (
        /* DAY DATE SELECTOR: Reference IMG_8889 */
        <div className="px-4 py-2.5 bg-white flex items-center justify-between border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handlePrevDate}
            className="p-1 text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={() => setShowDatePickerModal(true)}
            className="flex items-center gap-1.5 text-[0.9375rem] font-bold text-slate-800 hover:text-[#f26f21] transition-colors cursor-pointer"
          >
            <span>
              {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月 {currentDate.getDate()} 日
            </span>
            <span className="text-xs text-slate-600">▾</span>
          </button>

          <button
            type="button"
            onClick={handleNextDate}
            className="p-1 text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={handleResetToToday}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-[#f1f3f5] hover:bg-slate-200 rounded transition-colors cursor-pointer"
          >
            回到今日
          </button>
        </div>
      )}

      {activeInterval === 'week' && (
        /* WEEK DATE SELECTOR: Reference IMG_8890 */
        <div className="px-5 py-2.5 bg-white flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex flex-col text-[0.9375rem] font-bold text-slate-900 leading-snug">
            <div className="flex items-center gap-1">
              <span>
                {weekRange.startDate.getFullYear()} 年 {weekRange.startDate.getMonth() + 1} 月 {weekRange.startDate.getDate()} 日
              </span>
              <span className="text-xs text-slate-600">▾</span>
              <span className="ml-1 text-slate-900">至</span>
            </div>
            <div className="flex items-center gap-1">
              <span>
                {weekRange.endDate.getFullYear()} 年 {weekRange.endDate.getMonth() + 1} 月 {weekRange.endDate.getDate()} 日
              </span>
              <span className="text-xs text-slate-600">▾</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToToday}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-[#f1f3f5] hover:bg-slate-200 rounded transition-colors cursor-pointer"
            >
              回到今日
            </button>
          </div>
        </div>
      )}

      {activeInterval === 'month' && (
        /* MONTH DATE SELECTOR: Reference IMG_8891 */
        <div className="px-4 py-2.5 bg-white flex items-center justify-between border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handlePrevDate}
            className="p-1 text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={() => setShowDatePickerModal(true)}
            className="flex items-center gap-1.5 text-[0.9375rem] font-bold text-slate-800 hover:text-[#f26f21] transition-colors cursor-pointer"
          >
            <span>
              {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月
            </span>
            <span className="text-xs text-slate-600">▾</span>
          </button>

          <button
            type="button"
            onClick={handleNextDate}
            className="p-1 text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={handleResetToToday}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-[#f1f3f5] hover:bg-slate-200 rounded transition-colors cursor-pointer"
          >
            回到今日
          </button>
        </div>
      )}

      {activeInterval === 'year' && (
        /* YEAR DATE SELECTOR: Reference IMG_8892 */
        <div className="px-4 py-2.5 bg-white flex items-center justify-between border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handlePrevDate}
            className="p-1 text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={() => setShowDatePickerModal(true)}
            className="flex items-center gap-1.5 text-[0.9375rem] font-bold text-slate-800 hover:text-[#f26f21] transition-colors cursor-pointer"
          >
            <span>{currentDate.getFullYear()} 年</span>
            <span className="text-xs text-slate-600">▾</span>
          </button>

          <button
            type="button"
            onClick={handleNextDate}
            className="p-1 text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={handleResetToToday}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-[#f1f3f5] hover:bg-slate-200 rounded transition-colors cursor-pointer"
          >
            回到今日
          </button>
        </div>
      )}

      {/* SCROLLABLE MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* CHART SECTION (日紀錄 / 週紀錄 / 月紀錄 / 年紀錄) */}
        <div className="px-5 pt-4 pb-4 bg-white">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-[1.0625rem] font-bold text-slate-900">
              {activeInterval === 'day'
                ? '日紀錄'
                : activeInterval === 'week'
                ? '週紀錄'
                : activeInterval === 'month'
                ? '月紀錄'
                : '年紀錄'}
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-medium mb-3">
            {activeInterval === 'day'
              ? `日平均血氧：${currentAverage} %`
              : activeInterval === 'week'
              ? `週平均血氧：${currentAverage} %`
              : activeInterval === 'month'
              ? `月平均血氧：${currentAverage} %`
              : `年平均血氧：${currentAverage} %`}
          </div>

          {/* SVG Line / Bar Chart */}
          <div className="relative w-full h-[180px] select-none flex items-center justify-center">
            {/* Vertical Y-axis label */}
            <div
              className="absolute -left-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-medium tracking-tight"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}
            >
              血氧單位 (%)
            </div>

            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              {/* Horizontal Grid lines (100, 90, 80, 70, 60) */}
              {[100, 90, 80, 70, 60].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <text
                      x={padLeft - 4}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="8.5"
                      fill="#64748b"
                      fontWeight="400"
                    >
                      {val}
                    </text>
                    {val === 60 ? (
                      /* Solid base line */
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartWidth - padRight}
                        y2={y}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                      />
                    ) : (
                      /* Dashed grid line */
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartWidth - padRight}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                    )}
                  </g>
                );
              })}

              {/* X-axis ticks & grid lines depending on Interval */}
              {activeInterval === 'day' && (
                <>
                  {[
                    { h: 0, label: '0時' },
                    { h: 6, label: '6時' },
                    { h: 12, label: '12時' },
                    { h: 18, label: '18時' },
                  ].map(({ h, label }) => {
                    const x = getDayX(h);
                    return (
                      <g key={h}>
                        <line
                          x1={x}
                          y1={padTop}
                          x2={x}
                          y2={chartHeight - padBottom}
                          stroke={h === 0 ? '#cbd5e1' : '#e2e8f0'}
                          strokeWidth="1"
                          strokeDasharray={h === 0 ? undefined : '3,3'}
                        />
                        <text
                          x={x}
                          y={chartHeight - padBottom + 14}
                          textAnchor="middle"
                          fontSize="8.5"
                          fill="#64748b"
                          fontWeight="400"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Single green dot on day */}
                  {periodRecords.map((r, i) => {
                    const x = getDayX(r.hour);
                    const y = getY(r.spO2);
                    return (
                      <circle
                        key={r.id || i}
                        cx={x}
                        cy={y}
                        r="4.5"
                        fill="#10a349"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </>
              )}

              {activeInterval === 'week' && (
                <>
                  {weekRange.days.map(({ label }, idx) => {
                    const x = getWeekX(idx);
                    return (
                      <g key={label}>
                        <text
                          x={x}
                          y={chartHeight - padBottom + 14}
                          textAnchor="middle"
                          fontSize="8.5"
                          fill="#64748b"
                          fontWeight="400"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical green pill bar matching IMG_8890 on 8/18 (last day) */}
                  {(() => {
                    const x = getWeekX(6);
                    const yTop = getY(currentAverage);
                    const yBottom = getY(60);
                    return (
                      <g>
                        <rect
                          x={x - 5}
                          y={yTop}
                          width="10"
                          height={yBottom - yTop}
                          rx="5"
                          fill="#86efac"
                          stroke="#10b981"
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })()}
                </>
              )}

              {activeInterval === 'month' && (
                <>
                  {[
                    { d: 10, label: '10號' },
                    { d: 20, label: '20號' },
                  ].map(({ d, label }) => {
                    const x = getMonthX(d);
                    return (
                      <g key={d}>
                        <text
                          x={x}
                          y={chartHeight - padBottom + 14}
                          textAnchor="middle"
                          fontSize="8.5"
                          fill="#64748b"
                          fontWeight="400"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical green pill bar on 18th matching IMG_8891 */}
                  {(() => {
                    const x = getMonthX(18);
                    const yTop = getY(currentAverage);
                    const yBottom = getY(60);
                    return (
                      <g>
                        <rect
                          x={x - 4}
                          y={yTop}
                          width="8"
                          height={yBottom - yTop}
                          rx="4"
                          fill="#86efac"
                          stroke="#10b981"
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })()}
                </>
              )}

              {activeInterval === 'year' && (
                <>
                  {[
                    '1月',
                    '2月',
                    '3月',
                    '4月',
                    '5月',
                    '6月',
                    '7月',
                    '8月',
                    '9月',
                    '10月',
                    '11月',
                    '12月',
                  ].map((label, idx) => {
                    const x = getYearX(idx);
                    return (
                      <g key={label}>
                        <text
                          x={x}
                          y={chartHeight - padBottom + 14}
                          textAnchor="middle"
                          fontSize="8"
                          fill="#64748b"
                          fontWeight="400"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical green pill bar on 8th month (August) matching IMG_8892 */}
                  {(() => {
                    const x = getYearX(7);
                    const yTop = getY(currentAverage);
                    const yBottom = getY(60);
                    return (
                      <g>
                        <rect
                          x={x - 4}
                          y={yTop}
                          width="8"
                          height={yBottom - yTop}
                          rx="4"
                          fill="#86efac"
                          stroke="#10b981"
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })()}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* SECTION BANNER (Reference: IMG_8889 / IMG_8890 / IMG_8891 / IMG_8892) */}
        <div className="bg-[#f8f9fa] px-5 py-2 border-t border-b border-slate-200/80 text-xs font-semibold text-slate-500">
          {activeInterval === 'day'
            ? '本日單次紀錄'
            : activeInterval === 'week'
            ? '本週單日紀錄(每日平均)'
            : activeInterval === 'month'
            ? '本月單日紀錄(每日平均)'
            : '本年單日紀錄(每日平均)'}
        </div>

        {/* RECORD ITEMS LIST */}
        <div className="divide-y divide-slate-100 bg-white">
          {activeInterval === 'day' ? (
            /* Day View Cards (Reference IMG_8889) */
            periodRecords.map((rec) => (
              <div key={rec.id} className="p-4 px-5">
                {/* Card Top Row: Time & 編輯 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[1.0625rem] font-bold text-slate-900 tracking-tight">
                    {rec.timeDisplay}
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditMeasurement(rec)}
                    className="text-[0.875rem] font-bold text-[#f26f21] hover:text-[#e05e10] transition-colors cursor-pointer"
                  >
                    編輯
                  </button>
                </div>

                {/* Card Bottom Row: SpO2 + Pulse on left, Big Status Badge on right */}
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Droplet className="w-5 h-5 text-slate-700 stroke-[1.8]" />
                      <div>
                        <div className="text-[0.75rem] text-slate-500 font-medium leading-none mb-0.5">
                          血氧濃度
                        </div>
                        <div className="text-[1rem] font-bold text-slate-900 leading-none">
                          {rec.spO2} %
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Heart className="w-5 h-5 text-slate-700 stroke-[1.8]" />
                      <div>
                        <div className="text-[0.75rem] text-slate-500 font-medium leading-none mb-0.5">
                          心律
                        </div>
                        <div className="text-[1rem] font-bold text-slate-900 leading-none">
                          {rec.pulse} bpm
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div
                      className={`w-18 h-18 rounded-full flex items-center justify-center text-white text-[1.0625rem] font-bold shadow-xs ${
                        rec.status === 'urgent'
                          ? 'bg-red-500'
                          : rec.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-[#10a349]'
                      }`}
                    >
                      {rec.statusLabel}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Week / Month / Year View Cards (Reference IMG_8890, IMG_8891, IMG_8892) */
            periodRecords.map((rec) => {
              const [y, m, d] = rec.dateStr.split('-');
              const formattedDateLabel = `${y} 年 ${parseInt(m, 10)} 月 ${parseInt(d, 10)} 日`;

              return (
                <div key={rec.id} className="p-4 px-5">
                  {/* Card Top Row: Date & 查看 > */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[1.0625rem] font-bold text-slate-900 tracking-tight">
                      {formattedDateLabel}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const parts = rec.dateStr.split('-');
                        setCurrentDate(
                          new Date(
                            parseInt(parts[0], 10),
                            parseInt(parts[1], 10) - 1,
                            parseInt(parts[2], 10)
                          )
                        );
                        setActiveInterval('day');
                      }}
                      className="inline-flex items-center gap-1 text-[0.875rem] font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <span>查看</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Bottom Row: (日平均) labels + Status badge */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <Droplet className="w-5 h-5 text-slate-700 stroke-[1.8]" />
                        <div>
                          <div className="text-[0.75rem] text-slate-500 font-medium leading-none mb-0.5">
                            血氧濃度 (日平均)
                          </div>
                          <div className="text-[1rem] font-bold text-slate-900 leading-none">
                            {rec.spO2} %
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Heart className="w-5 h-5 text-slate-700 stroke-[1.8]" />
                        <div>
                          <div className="text-[0.75rem] text-slate-500 font-medium leading-none mb-0.5">
                            心律 (日平均)
                          </div>
                          <div className="text-[1rem] font-bold text-slate-900 leading-none">
                            {rec.pulse} bpm
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div
                        className={`w-18 h-18 rounded-full flex items-center justify-center text-white text-[1.0625rem] font-bold shadow-xs ${
                          rec.status === 'urgent'
                            ? 'bg-red-500'
                            : rec.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-[#10a349]'
                        }`}
                      >
                        {rec.statusLabel}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {periodRecords.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              此期間尚無血氧量測記錄，點擊右上角「+」立即量測。
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MEASUREMENT MODAL: 請測量您的血氧 (Reference: IMG_8893) */}
      {/* ========================================================================= */}
      {showMeasurementModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[2rem] p-5 pb-6 shadow-2xl w-full border-t border-slate-200 max-h-[96%] overflow-y-auto animate-in slide-in-from-bottom duration-250 flex flex-col justify-between">
            {/* Modal Header: 請測量您的血氧 ❓ */}
            <div className="flex items-center justify-center gap-1.5 pt-1 pb-4 relative">
              <h2 className="text-[1.25rem] font-bold text-slate-900 tracking-tight">
                {editingRecord ? '編輯血氧記錄' : '請測量您的血氧'}
              </h2>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-slate-700 hover:text-slate-900 p-0.5 cursor-pointer"
                title="血氧量測說明"
              >
                <HelpCircle className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* Date & Time Select Box: e.g. 2026/8/18 10:44 ▾ */}
            <div className="mb-4">
              <div
                onClick={() => setShowDatePickerModal(true)}
                className="w-full py-2.5 px-3.5 rounded-lg border border-slate-300 bg-white flex items-center justify-between text-slate-700 font-medium text-[1rem] shadow-2xs cursor-pointer"
              >
                <span>{measureDateTime}</span>
                <span className="text-slate-400 text-xs">▾</span>
              </div>
            </div>

            {/* Two Input Field Boxes: 血氧濃度 (%) | 心律 (bpm) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* SpO2 Box */}
              <div
                onClick={() => setActiveInputSlot('spO2')}
                className="flex flex-col items-center cursor-pointer"
              >
                <span className="text-sm font-medium text-slate-600 mb-1.5">血氧濃度</span>
                <div
                  className={`w-full h-12 rounded-lg flex items-center justify-center text-center transition-all bg-white ${
                    activeInputSlot === 'spO2'
                      ? 'border-2 border-[#f26f21] shadow-2xs'
                      : 'border border-slate-300'
                  }`}
                >
                  <span
                    className={`text-[1.25rem] font-bold ${
                      inputSpO2 ? 'text-slate-900' : 'text-slate-400 font-normal'
                    }`}
                  >
                    {inputSpO2 ? `${inputSpO2} %` : '%'}
                  </span>
                </div>
              </div>

              {/* Pulse Box */}
              <div
                onClick={() => setActiveInputSlot('pulse')}
                className="flex flex-col items-center cursor-pointer"
              >
                <span className="text-sm font-medium text-slate-600 mb-1.5">心律</span>
                <div
                  className={`w-full h-12 rounded-lg flex items-center justify-center text-center transition-all bg-white ${
                    activeInputSlot === 'pulse'
                      ? 'border-2 border-[#f26f21] shadow-2xs'
                      : 'border border-slate-300'
                  }`}
                >
                  <span
                    className={`text-[1.25rem] font-bold ${
                      inputPulse ? `${inputPulse} bpm` : 'text-slate-400 font-normal'
                    }`}
                  >
                    {inputPulse ? `${inputPulse} bpm` : 'bpm'}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom 3x4 Number Keypad */}
            <div className="bg-[#f4f5f7] rounded-xl p-3 mb-3.5">
              <div className="grid grid-cols-3 gap-y-2.5 gap-x-2 text-[1.5rem] font-normal text-slate-900">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadPress(k)}
                    className="h-11 rounded-lg flex items-center justify-center hover:bg-white active:bg-slate-200 active:scale-95 transition-all cursor-pointer select-none"
                  >
                    {k}
                  </button>
                ))}
                {/* 4th row: empty, 0, 刪除 */}
                <div />
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-11 rounded-lg flex items-center justify-center hover:bg-white active:bg-slate-200 active:scale-95 transition-all cursor-pointer select-none"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('DEL')}
                  className="h-11 rounded-lg flex items-center justify-center text-[1.125rem] font-bold text-red-500 hover:bg-white active:bg-red-50 active:scale-95 transition-all cursor-pointer select-none"
                >
                  刪除
                </button>
              </div>
            </div>

            {/* 拍照上傳 Button */}
            <button
              type="button"
              onClick={handlePhotoUploadSim}
              className="w-full py-2.5 rounded-lg bg-[#f26f21] hover:bg-[#e05e10] text-white font-bold text-[0.9375rem] flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all mb-4 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>拍照上傳</span>
            </button>

            {/* Bottom Actions: 取消 | 完成 */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowMeasurementModal(false);
                  setEditingRecord(null);
                }}
                className="flex-1 py-2.5 rounded-full border border-[#f26f21] text-[#f26f21] font-bold text-[0.9375rem] hover:bg-orange-50 active:scale-98 transition-all cursor-pointer text-center"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleSaveMeasurement}
                disabled={!isFormComplete}
                className={`flex-1 py-2.5 rounded-full font-bold text-[0.9375rem] transition-all text-center cursor-pointer ${
                  isFormComplete
                    ? 'bg-[#f26f21] text-white hover:bg-[#e05e10] shadow-sm active:scale-98'
                    : 'bg-[#7c8087] text-white/90'
                }`}
              >
                完成
              </button>
            </div>

            {/* Delete button if in edit mode */}
            {editingRecord && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setRecords((prev) => prev.filter((r) => r.id !== editingRecord.id));
                    setShowMeasurementModal(false);
                    setEditingRecord(null);
                    setToastMessage('已刪除此筆量測記錄');
                    setTimeout(() => setToastMessage(null), 2000);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-red-500 font-bold hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>刪除此筆記錄</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GUIDELINE / HELP MODAL */}
      {/* ========================================================================= */}
      {showHelpModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <HelpCircle className="w-5 h-5 text-[#f26f21]" />
                <span>血氧量測指引與標準</span>
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                <strong>正常範圍</strong>：血氧飽和度 (SpO₂) ≧ 95% 且 心律在 60 ~ 100 bpm 之間為正常狀態。
              </p>
              <p>
                <strong>留意提醒</strong>：90% ~ 94% 提示血氧偏低，請靜坐深呼吸並再次量測。
              </p>
              <p>
                <strong>緊急警戒</strong>：&lt; 90% 為缺氧危急狀態，若伴隨呼吸困難，請立即聯絡個管師或就醫。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-[#f26f21] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#e05e10] cursor-pointer"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DATE PICKER MODAL */}
      {/* ========================================================================= */}
      {showDatePickerModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#f26f21]" />
                <span>選擇日期</span>
              </h3>
              <button onClick={() => setShowDatePickerModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {[
                { label: '2026 年 8 月 18 日 (今日)', date: new Date(2026, 7, 18) },
                { label: '2026 年 8 月 17 日', date: new Date(2026, 7, 17) },
                { label: '2026 年 8 月 16 日', date: new Date(2026, 7, 16) },
                { label: '2026 年 8 月 15 日', date: new Date(2026, 7, 15) },
                { label: '2026 年 8 月 14 日', date: new Date(2026, 7, 14) },
                { label: '2026 年 8 月 12 日', date: new Date(2026, 7, 12) },
                { label: '2026 年 8 月 10 日', date: new Date(2026, 7, 10) },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentDate(item.date);
                    setShowDatePickerModal(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <span>{item.label}</span>
                  {formatDateToYMD(item.date) === currentDateYMD && (
                    <Check className="w-4 h-4 text-[#f26f21]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
