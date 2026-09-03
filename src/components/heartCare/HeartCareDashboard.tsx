import React, { useState, useRef, useEffect } from 'react';
import { MeasurementModal, MeasurementType } from './MeasurementModal';
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  Scale,
  Wind,
  Thermometer,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  X,
  ChevronDown
} from 'lucide-react';
import {
  HeartCareState,
  ReportedSymptom,
  VitalsData,
  evaluateVitalSigns,
  VitalStatus
} from './heartCareData';
import { HeartCareQuestionnaire } from './HeartCareQuestionnaire';
import { DailyStatusReportScreen } from './DailyStatusReportScreen';
import { BloodPressureDetailScreen } from './BloodPressureDetailScreen';
import { OxygenDetailScreen } from './OxygenDetailScreen';
import { WeightDetailScreen } from './WeightDetailScreen';
import { RespiratoryRateDetailScreen } from './RespiratoryRateDetailScreen';
import { TemperatureDetailScreen } from './TemperatureDetailScreen';

interface Props {
  onBack: () => void;
  nickname?: string;
  heartCareState: HeartCareState;
  onUpdateHeartCareState: (newState: HeartCareState) => void;
}

export interface DailyLogEntry {
  id: string;
  timeStr: string;
  vitals: VitalsData;
  symptoms: ReportedSymptom[];
  feelingsText?: string;
  status: 'alert' | 'warning' | 'normal';
}

const getVitalRedThreshold = (key: string): string => {
  switch (key) {
    case 'bp':
      return '收縮壓 < 90 或 ≥ 180 mmHg，或 舒張壓 ≥ 110 mmHg';
    case 'spO2':
      return '血氧 (SpO₂) < 90%';
    case 'hr':
      return '心率 (HR) > 120 或 < 40 次/分';
    case 'rr':
      return '呼吸頻率 (RR) > 24 或 < 10 次/分';
    case 'bt':
      return '體溫 (BT) ≥ 38.0 °C 或 < 35.0 °C';
    case 'weight':
      return '2 天增加 ≥ 1.5 ~ 2 kg，或 3 天增加 > 2 kg';
    case 'ecg':
      return '疑似 AF with RVR、VT、明顯 ST-T 異常、無法判讀且合併症狀';
    default:
      return '心衰燈－紅燈警戒門檻';
  }
};

/**
 * iOS-style 3-column (Year, Month, Day) Wheel Date Picker
 * Matching IMG_8883.PNG
 */
interface DateWheelPickerProps {
  initialDate: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}

const DateWheelPicker: React.FC<DateWheelPickerProps> = ({
  initialDate,
  onClose,
  onConfirm,
}) => {
  const [tempYear, setTempYear] = useState<number>(initialDate.getFullYear());
  const [tempMonth, setTempMonth] = useState<number>(initialDate.getMonth() + 1); // 1-indexed
  const [tempDay, setTempDay] = useState<number>(initialDate.getDate());

  // Generate Year options: 2020 to 2032
  const years = Array.from({ length: 13 }, (_, i) => 2020 + i);
  // Generate Month options: 1 to 12
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Calculate days in selected year & month
  const daysInMonth = new Date(tempYear, tempMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // If day exceeds max days in month (e.g. Feb 30), adjust it
  useEffect(() => {
    if (tempDay > daysInMonth) {
      setTempDay(daysInMonth);
    }
  }, [daysInMonth, tempDay]);

  const yearListRef = useRef<HTMLDivElement>(null);
  const monthListRef = useRef<HTMLDivElement>(null);
  const dayListRef = useRef<HTMLDivElement>(null);

  const ITEM_HEIGHT = 44; // px

  // Scroll to active index on mount
  useEffect(() => {
    const yIdx = years.indexOf(tempYear);
    if (yIdx >= 0 && yearListRef.current) {
      yearListRef.current.scrollTop = yIdx * ITEM_HEIGHT;
    }
    const mIdx = months.indexOf(tempMonth);
    if (mIdx >= 0 && monthListRef.current) {
      monthListRef.current.scrollTop = mIdx * ITEM_HEIGHT;
    }
    const dIdx = days.indexOf(tempDay);
    if (dIdx >= 0 && dayListRef.current) {
      dayListRef.current.scrollTop = dIdx * ITEM_HEIGHT;
    }
  }, []);

  const handleConfirm = () => {
    const finalDate = new Date(tempYear, tempMonth - 1, tempDay);
    onConfirm(finalDate);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="bg-white rounded-t-3xl shadow-2xl relative z-10 w-full overflow-hidden animate-in slide-in-from-bottom duration-250 border-t border-slate-200">
        {/* Top Header Bar: 取消 & 確認 */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="text-[1.0625rem] font-bold text-[#ee7326] hover:text-[#d6611a] cursor-pointer transition-colors"
          >
            取消
          </button>
          <span className="text-base font-extrabold text-slate-800 tracking-tight">選擇日期</span>
          <button
            type="button"
            onClick={handleConfirm}
            className="text-[1.0625rem] font-bold text-[#ee7326] hover:text-[#d6611a] cursor-pointer transition-colors"
          >
            確認
          </button>
        </div>

        {/* 3-Column Wheel Area */}
        <div className="relative px-3 py-6 bg-white select-none">
          {/* Center Selection Indicator Highlight Bar (Matching IMG_8883.PNG) */}
          <div
            className="absolute left-4 right-4 pointer-events-none rounded-2xl bg-slate-100/90 border border-slate-200/60"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              height: `${ITEM_HEIGHT}px`,
            }}
          />

          <div className="grid grid-cols-3 gap-1 relative z-10">
            {/* 1. Year Column */}
            <div
              ref={yearListRef}
              className="h-[220px] overflow-y-auto no-scrollbar scroll-smooth py-[88px] text-center"
              style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {years.map((y) => {
                const isSelected = y === tempYear;
                return (
                  <div
                    key={y}
                    onClick={() => {
                      setTempYear(y);
                      const idx = years.indexOf(y);
                      if (yearListRef.current) {
                        yearListRef.current.scrollTop = idx * ITEM_HEIGHT;
                      }
                    }}
                    style={{ height: `${ITEM_HEIGHT}px`, scrollSnapAlign: 'center' }}
                    className={`flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'text-[1.3125rem] font-black text-slate-900 scale-105'
                        : 'text-[1.0625rem] font-medium text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {y}年
                  </div>
                );
              })}
            </div>

            {/* 2. Month Column */}
            <div
              ref={monthListRef}
              className="h-[220px] overflow-y-auto no-scrollbar scroll-smooth py-[88px] text-center"
              style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {months.map((m) => {
                const isSelected = m === tempMonth;
                return (
                  <div
                    key={m}
                    onClick={() => {
                      setTempMonth(m);
                      const idx = months.indexOf(m);
                      if (monthListRef.current) {
                        monthListRef.current.scrollTop = idx * ITEM_HEIGHT;
                      }
                    }}
                    style={{ height: `${ITEM_HEIGHT}px`, scrollSnapAlign: 'center' }}
                    className={`flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'text-[1.3125rem] font-black text-slate-900 scale-105'
                        : 'text-[1.0625rem] font-medium text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {m}月
                  </div>
                );
              })}
            </div>

            {/* 3. Day Column */}
            <div
              ref={dayListRef}
              className="h-[220px] overflow-y-auto no-scrollbar scroll-smooth py-[88px] text-center"
              style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {days.map((d) => {
                const isSelected = d === tempDay;
                return (
                  <div
                    key={d}
                    onClick={() => {
                      setTempDay(d);
                      const idx = days.indexOf(d);
                      if (dayListRef.current) {
                        dayListRef.current.scrollTop = idx * ITEM_HEIGHT;
                      }
                    }}
                    style={{ height: `${ITEM_HEIGHT}px`, scrollSnapAlign: 'center' }}
                    className={`flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'text-[1.3125rem] font-black text-slate-900 scale-105'
                        : 'text-[1.0625rem] font-medium text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {d}日
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeartCareDashboard: React.FC<Props> = ({
  onBack,
  nickname = '陳小明',
  heartCareState,
  onUpdateHeartCareState,
}) => {
  const [currentLevel, setCurrentLevel] = useState<
    'level2' | 'level3' | 'blood_pressure' | 'oxygen' | 'weight' | 'respiratory_rate' | 'temperature'
  >('level2');
  const [selectedVitalModal, setSelectedVitalModal] = useState<MeasurementType | null>(null);
  const [selectedLogStatus, setSelectedLogStatus] = useState<DailyLogEntry | null>(null);

  // Date selection state
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 18)); // 2026年8月18日
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Initial mock history entries
  const [logHistory, setLogHistory] = useState<DailyLogEntry[]>([
    {
      id: 'log_today_current',
      timeStr: '今日 18:19',
      vitals: {
        sysBP: heartCareState.vitals.sysBP,
        diaBP: heartCareState.vitals.diaBP,
        heartRate: heartCareState.vitals.heartRate,
        spO2: heartCareState.vitals.spO2,
        respRate: heartCareState.vitals.respRate,
        bodyTemp: heartCareState.vitals.bodyTemp,
        weight: heartCareState.vitals.weight,
        weightChange2Days: heartCareState.vitals.weightChange2Days,
        ecgStatus: heartCareState.vitals.ecgStatus,
      },
      symptoms: heartCareState.reportedSymptoms.length > 0 ? heartCareState.reportedSymptoms : [
        {
          id: 'symptom_1_dyspnea',
          name: '喘',
          severity: 'yellow',
          hours: 0,
          minutes: 30,
          educationText: '請先停止活動、坐起休息並觀察；若比平常更喘，請先回報系統。',
          emergencyWarning: '若喘明顯加重，或同時出現胸痛、嘴唇發紫、說話困難、冒冷汗，請就近就醫。',
          reportTime: '今日 18:19',
          selectedOption: '新出現或較平常加重',
          details: ['程度: 新出現或較平常加重', '持續時間: 30分鐘']
        },
        {
          id: 'symptom_9_edema',
          name: '下肢水腫',
          severity: 'yellow',
          hours: 0,
          minutes: 0,
          educationText: '請注意鞋襪是否變緊、腳踝是否腫脹；若加重，請先回報系統。',
          emergencyWarning: '若水腫快速加重，且同時合併體重短期上升、喘加重、腹脹、夜間喘醒，請儘快就近就醫。',
          reportTime: '今日 18:19',
          selectedOption: '新出現或較平常加重',
          edemaSide: '雙側',
          edemaPitting: true,
          details: ['程度: 新出現或較平常加重', '部位: 雙側', '壓痕性: 是']
        }
      ],
      feelingsText: heartCareState.feelingsText || '晚上平躺睡覺時感覺比較悶，散步稍微喘，雙腳踝有壓痕水腫。',
      status: 'warning',
    }
  ]);

  // Vitals evaluation
  const evaluatedVitals = evaluateVitalSigns(heartCareState.vitals);
  const getVitalEvaluation = (key: string): VitalStatus | undefined => {
    return evaluatedVitals.find((v) => v.key === key);
  };

  const hasReportedSymptoms = heartCareState.reportedSymptoms.length > 0;
  const symptomNames = heartCareState.reportedSymptoms.map((s) => s.name).join('、');
  const hasRedSymptom = heartCareState.reportedSymptoms.some((s) => s.severity === 'red');
  const hasYellowSymptom = heartCareState.reportedSymptoms.some((s) => s.severity === 'yellow');

  // Overall status evaluation
  const hasRedVital = evaluatedVitals.some((v) => v.level === 'red');
  const hasYellowVital = evaluatedVitals.some((v) => v.level === 'yellow');

  let overallStatus: 'alert' | 'warning' | 'normal' = 'normal';
  if (hasRedVital || hasRedSymptom) {
    overallStatus = 'alert';
  } else if (hasYellowVital || hasYellowSymptom) {
    overallStatus = 'warning';
  }

  const handleQuestionnaireSubmit = (vitals: VitalsData, symptoms: ReportedSymptom[], feelingsText?: string) => {
    const now = new Date();
    const timeFormatted = `今日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newEval = evaluateVitalSigns(vitals);
    const redV = newEval.some((v) => v.level === 'red');
    const yelV = newEval.some((v) => v.level === 'yellow');
    const redS = symptoms.some((s) => s.severity === 'red');
    const yelS = symptoms.some((s) => s.severity === 'yellow');

    let status: 'alert' | 'warning' | 'normal' = 'normal';
    if (redV || redS) {
      status = 'alert';
    } else if (yelV || yelS) {
      status = 'warning';
    }

    const newEntry: DailyLogEntry = {
      id: `log_${Date.now()}`,
      timeStr: timeFormatted,
      vitals,
      symptoms,
      feelingsText: feelingsText || '',
      status,
    };

    setLogHistory([newEntry, ...logHistory]);
    onUpdateHeartCareState({
      ...heartCareState,
      vitals,
      reportedSymptoms: symptoms,
      lastReportTime: timeFormatted,
      feelingsText,
    });
    setCurrentLevel('level2');
  };

  const handleQuickVitalSubmit = (updatedVitals: Partial<VitalsData>) => {
    const now = new Date();
    const timeFormatted = `今日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const currentVitals = {
      ...heartCareState.vitals,
      ...updatedVitals,
    };

    const newEval = evaluateVitalSigns(currentVitals);
    const redV = newEval.some((v) => v.level === 'red');
    const yelV = newEval.some((v) => v.level === 'yellow');
    const redS = heartCareState.reportedSymptoms.some((s) => s.severity === 'red');
    const yelS = heartCareState.reportedSymptoms.some((s) => s.severity === 'yellow');

    let status: 'alert' | 'warning' | 'normal' = 'normal';
    if (redV || redS) {
      status = 'alert';
    } else if (yelV || yelS) {
      status = 'warning';
    }

    const newEntry: DailyLogEntry = {
      id: `log_${Date.now()}`,
      timeStr: timeFormatted,
      vitals: currentVitals,
      symptoms: heartCareState.reportedSymptoms,
      feelingsText: heartCareState.feelingsText || '',
      status,
    };

    setLogHistory([newEntry, ...logHistory]);
    onUpdateHeartCareState({
      ...heartCareState,
      vitals: currentVitals,
      lastReportTime: timeFormatted,
    });
    setSelectedVitalModal(null);
  };

  if (currentLevel === 'level3') {
    return (
      <DailyStatusReportScreen
        onBack={() => setCurrentLevel('level2')}
        heartCareState={heartCareState}
        onUpdateHeartCareState={onUpdateHeartCareState}
      />
    );
  }

  if (currentLevel === 'blood_pressure') {
    return (
      <BloodPressureDetailScreen
        onBack={() => setCurrentLevel('level2')}
        nickname={nickname}
        currentVitals={heartCareState.vitals}
        onUpdateVitals={(newVitals) => {
          onUpdateHeartCareState({
            ...heartCareState,
            vitals: {
              ...heartCareState.vitals,
              ...newVitals,
            },
          });
        }}
      />
    );
  }

  if (currentLevel === 'oxygen') {
    return (
      <OxygenDetailScreen
        onBack={() => setCurrentLevel('level2')}
        nickname={nickname}
        currentVitals={heartCareState.vitals}
        onUpdateVitals={(newVitals) => {
          onUpdateHeartCareState({
            ...heartCareState,
            vitals: {
              ...heartCareState.vitals,
              ...newVitals,
            },
          });
        }}
      />
    );
  }

  if (currentLevel === 'weight') {
    return (
      <WeightDetailScreen
        onBack={() => setCurrentLevel('level2')}
        nickname={nickname}
        currentVitals={heartCareState.vitals}
        onUpdateVitals={(newVitals) => {
          onUpdateHeartCareState({
            ...heartCareState,
            vitals: {
              ...heartCareState.vitals,
              ...newVitals,
            },
          });
        }}
      />
    );
  }

  if (currentLevel === 'respiratory_rate') {
    return (
      <RespiratoryRateDetailScreen
        onBack={() => setCurrentLevel('level2')}
        nickname={nickname}
        currentVitals={heartCareState.vitals}
        onUpdateVitals={(newVitals) => {
          onUpdateHeartCareState({
            ...heartCareState,
            vitals: {
              ...heartCareState.vitals,
              ...newVitals,
            },
          });
        }}
      />
    );
  }

  if (currentLevel === 'temperature') {
    return (
      <TemperatureDetailScreen
        onBack={() => setCurrentLevel('level2')}
        nickname={nickname}
        currentVitals={heartCareState.vitals}
        onUpdateVitals={(newVitals) => {
          onUpdateHeartCareState({
            ...heartCareState,
            vitals: {
              ...heartCareState.vitals,
              ...newVitals,
            },
          });
        }}
      />
    );
  }

  // Format month and weekday for top banner
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const curMonthStr = monthNames[currentDate.getMonth()];
  const curDay = currentDate.getDate();
  const curYear = currentDate.getFullYear();
  const curMonthNum = currentDate.getMonth() + 1;
  const curWeekDay = weekDays[currentDate.getDay()];

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] relative font-sans text-slate-900 select-none overflow-hidden">
      {/* 1. Clean Top Header Bar (No Plus Button) */}
      <header className="px-3 py-2 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs shrink-0">
        <div className="flex items-center justify-between min-h-[3.25rem]">
          <button
            onClick={onBack}
            className="min-w-[44px] min-h-[44px] flex items-center justify-start text-slate-700 hover:text-slate-950 transition-colors cursor-pointer focus:outline-none"
            aria-label="返回"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <h1 className="text-[1.25rem] font-black text-slate-900 tracking-tight text-center flex-1">
            心臟照護燈
          </h1>

          {/* Symmetrical placeholder div */}
          <div className="min-w-[44px] min-h-[44px]" />
        </div>
      </header>

      {/* 2. Top Date Banner (Style matching IMG_8883.PNG) */}
      <div className="bg-[#fef4e8] border-b border-[#fed7aa]/50 px-4 py-3.5 flex items-center gap-3.5 shrink-0">
        {/* Calendar Badge Box */}
        <div
          onClick={() => setShowDatePicker(true)}
          className="w-[62px] h-[64px] rounded-xl overflow-hidden shadow-xs border border-orange-200/80 flex flex-col bg-white shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
        >
          <div className="bg-[#ee7326] text-white text-[0.8125rem] font-bold text-center py-0.5">
            {curMonthStr}
          </div>
          <div className="flex-1 flex items-center justify-center text-[1.5rem] font-black text-[#ee7326] leading-none">
            {curDay}
          </div>
        </div>

        {/* Date Text & Dropdown Clickable to open Wheel Picker */}
        <div className="flex-1">
          <div className="text-[0.875rem] font-semibold text-slate-700 leading-tight">
            {curYear}年
          </div>
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="flex items-center gap-1.5 text-[1.1875rem] font-black text-slate-900 hover:text-[#ee7326] transition-colors cursor-pointer mt-0.5 text-left active:opacity-75"
          >
            <span>
              {curMonthNum} 月 {curDay} 日({curWeekDay})
            </span>
            <ChevronDown className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>

      {/* 3. Main Scrollable List of 7 Items in Strict Sequence */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        
        {/* ========================================================= */}
        {/* ITEM 1: 每日狀態回報 */}
        {/* ========================================================= */}
        <div
          onClick={() => setCurrentLevel('level3')}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-[#ee7326] hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-black text-[1.125rem]">!</span>
              <h2 className="text-[1.0625rem] font-black text-slate-900 group-hover:text-[#ee7326] transition-colors">
                每日狀態回報
              </h2>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#ee7326] transition-colors" />
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex-1">
              {hasReportedSymptoms ? (
                <div>
                  <div className="text-[1.125rem] font-black text-slate-900 line-clamp-1">
                    {symptomNames}
                  </div>
                  <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">
                    {heartCareState.lastReportTime ? `今日已回報 (${heartCareState.lastReportTime})` : '點擊查看或重新填寫'}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-[1.125rem] font-black text-slate-900">
                    尚未填寫任何記錄
                  </div>
                  <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">
                    點擊前往填寫每日自我檢測
                  </div>
                </div>
              )}
            </div>

            <div>
              {hasReportedSymptoms ? (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    hasRedSymptom
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : hasYellowSymptom
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}
                >
                  {hasRedSymptom ? '異常' : hasYellowSymptom ? '注意' : '正常'}
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
                  進行中
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ITEM 2: 血壓 */}
        {/* ========================================================= */}
        {(() => {
          const bpEval = getVitalEvaluation('bp');
          const isRecorded = heartCareState.vitals.sysBP && heartCareState.vitals.diaBP;

          return (
            <div
              onClick={() => setCurrentLevel('blood_pressure')}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-[#ee7326] hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h2 className="text-[1.0625rem] font-black text-slate-900 group-hover:text-[#ee7326] transition-colors">
                    血壓
                  </h2>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#ee7326] transition-colors" />
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex-1">
                  {isRecorded ? (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">
                        {heartCareState.vitals.sysBP} / {heartCareState.vitals.diaBP}{' '}
                        <span className="text-xs font-bold text-slate-500">mmHg</span>
                      </div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">
                        心率 {heartCareState.vitals.heartRate} bpm · 點擊進行量測更新
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">尚未填寫任何記錄</div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">點擊前往填寫</div>
                    </div>
                  )}
                </div>

                <div>
                  {isRecorded && bpEval ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        bpEval.level === 'red'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : bpEval.level === 'yellow'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {bpEval.level === 'red' ? '異常' : bpEval.level === 'yellow' ? '注意' : '正常'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
                      尚未記錄
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================= */}
        {/* ITEM 3: 血氧 */}
        {/* ========================================================= */}
        {(() => {
          const spO2Eval = getVitalEvaluation('spO2');
          const isRecorded = heartCareState.vitals.spO2 !== undefined;

          return (
            <div
              onClick={() => setCurrentLevel('oxygen')}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-[#ee7326] hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-sky-500" />
                  <h2 className="text-[1.0625rem] font-black text-slate-900 group-hover:text-[#ee7326] transition-colors">
                    血氧
                  </h2>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#ee7326] transition-colors" />
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex-1">
                  {isRecorded ? (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">
                        {heartCareState.vitals.spO2}{' '}
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">
                        血氧飽和度 (SpO₂) · 點擊前往專屬頁面
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">尚未填寫任何記錄</div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">點擊前往專屬頁面</div>
                    </div>
                  )}
                </div>

                <div>
                  {isRecorded && spO2Eval ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        spO2Eval.level === 'red'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : spO2Eval.level === 'yellow'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {spO2Eval.level === 'red' ? '異常' : spO2Eval.level === 'yellow' ? '注意' : '正常'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
                      尚未記錄
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================= */}
        {/* ITEM 4: 體重 */}
        {/* ========================================================= */}
        {(() => {
          const weightEval = getVitalEvaluation('weight');
          const isRecorded = heartCareState.vitals.weight !== undefined;

          return (
            <div
              onClick={() => setCurrentLevel('weight')}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-[#ee7326] hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-[1.0625rem] font-black text-slate-900 group-hover:text-[#ee7326] transition-colors">
                    體重
                  </h2>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#ee7326] transition-colors" />
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex-1">
                  {isRecorded ? (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">
                        {heartCareState.vitals.weight}{' '}
                        <span className="text-xs font-bold text-slate-500">kg</span>
                        {heartCareState.vitals.weightChange2Days > 0 && (
                          <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            2天+{heartCareState.vitals.weightChange2Days}kg
                          </span>
                        )}
                      </div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">
                        每日早晨量測 · 點擊前往專屬頁面
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">尚未填寫任何記錄</div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">點擊前往專屬頁面</div>
                    </div>
                  )}
                </div>

                <div>
                  {isRecorded && weightEval ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        weightEval.level === 'red'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : weightEval.level === 'yellow'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {weightEval.level === 'red' ? '異常' : weightEval.level === 'yellow' ? '注意' : '正常'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
                      尚未記錄
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================= */}
        {/* ITEM 5: 呼吸頻率 */}
        {/* ========================================================= */}
        {(() => {
          const rrEval = getVitalEvaluation('rr');
          const isRecorded = heartCareState.vitals.respRate !== undefined;

          return (
            <div
              onClick={() => setCurrentLevel('respiratory_rate')}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-[#ee7326] hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-[1.0625rem] font-black text-slate-900 group-hover:text-[#ee7326] transition-colors">
                    呼吸頻率
                  </h2>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#ee7326] transition-colors" />
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex-1">
                  {isRecorded ? (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">
                        {heartCareState.vitals.respRate}{' '}
                        <span className="text-xs font-bold text-slate-500">次/分</span>
                      </div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">
                        靜止狀態呼吸次數 · 點擊前往專屬頁面
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">尚未填寫任何記錄</div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">點擊前往專屬頁面</div>
                    </div>
                  )}
                </div>

                <div>
                  {isRecorded && rrEval ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        rrEval.level === 'red'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : rrEval.level === 'yellow'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {rrEval.level === 'red' ? '異常' : rrEval.level === 'yellow' ? '注意' : '正常'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
                      尚未記錄
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================= */}
        {/* ITEM 6: 體溫 */}
        {/* ========================================================= */}
        {(() => {
          const btEval = getVitalEvaluation('bt');
          const isRecorded = heartCareState.vitals.bodyTemp !== undefined;

          return (
            <div
              onClick={() => setCurrentLevel('temperature')}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-[#ee7326] hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-orange-500" />
                  <h2 className="text-[1.0625rem] font-black text-slate-900 group-hover:text-[#ee7326] transition-colors">
                    體溫
                  </h2>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#ee7326] transition-colors" />
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex-1">
                  {isRecorded ? (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">
                        {heartCareState.vitals.bodyTemp}{' '}
                        <span className="text-xs font-bold text-slate-500">°C</span>
                      </div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">
                        額溫 / 耳溫量測 · 點擊前往專屬頁面
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">尚未填寫任何記錄</div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">點擊前往專屬頁面</div>
                    </div>
                  )}
                </div>

                <div>
                  {isRecorded && btEval ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        btEval.level === 'red'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : btEval.level === 'yellow'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {btEval.level === 'red' ? '異常' : btEval.level === 'yellow' ? '注意' : '正常'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
                      尚未記錄
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================= */}
        {/* ITEM 7: 心電圖 */}
        {/* ========================================================= */}
        {(() => {
          const ecgEval = getVitalEvaluation('ecg');
          const isRecorded = Boolean(heartCareState.vitals.ecgStatus);

          return (
            <div
              onClick={() => setSelectedVitalModal('ecg')}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-[#ee7326] hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#ee7326]" />
                  <h2 className="text-[1.0625rem] font-black text-slate-900 group-hover:text-[#ee7326] transition-colors">
                    心電圖
                  </h2>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#ee7326] transition-colors" />
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex-1">
                  {isRecorded ? (
                    <div>
                      <div className="text-[1.0625rem] font-black text-slate-900 line-clamp-1">
                        {heartCareState.vitals.ecgStatus}
                      </div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">
                        支援藍芽同步與報告上傳 · 點擊更新
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[1.125rem] font-black text-slate-900">尚未填寫任何記錄</div>
                      <div className="text-[0.8125rem] text-slate-500 font-medium mt-0.5">點擊前往上傳或同步</div>
                    </div>
                  )}
                </div>

                <div>
                  {isRecorded && ecgEval ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                        ecgEval.level === 'red'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : ecgEval.level === 'yellow'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {ecgEval.level === 'red' ? '異常' : ecgEval.level === 'yellow' ? '注意' : '正常'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200 shrink-0">
                      尚未記錄
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Bottom Status Assessment & Health Advisory Card */}
        <div
          onClick={() => {
            const entry = logHistory[0] || {
              id: 'status_current',
              timeStr: '今日',
              vitals: heartCareState.vitals,
              symptoms: heartCareState.reportedSymptoms,
              feelingsText: heartCareState.feelingsText || '',
              status: overallStatus,
            };
            setSelectedLogStatus(entry);
          }}
          className={`mt-4 p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            overallStatus === 'alert'
              ? 'bg-red-50/70 border-red-200 hover:bg-red-50'
              : overallStatus === 'warning'
              ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-50'
              : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {overallStatus === 'alert' && <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />}
            {overallStatus === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />}
            {overallStatus === 'normal' && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />}
            <div>
              <div className="text-sm font-black text-slate-900">
                今日心臟照護燈總評：
                {overallStatus === 'alert' ? ' 紅燈異常' : overallStatus === 'warning' ? ' 黃燈注意' : ' 綠燈穩定'}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">
                點擊查看完整綜合評估與急症就醫指引
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        </div>

        <div className="h-6" />
      </div>

      {/* ========================================================= */}
      {/* DATE WHEEL PICKER MODAL (Matching IMG_8883.PNG) */}
      {/* ========================================================= */}
      {showDatePicker && (
        <DateWheelPicker
          initialDate={currentDate}
          onClose={() => setShowDatePicker(false)}
          onConfirm={(selected) => {
            setCurrentDate(selected);
            setShowDatePicker(false);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MEASUREMENT INPUT DIALOG MODAL */}
      {/* ========================================================= */}
      {selectedVitalModal && (
        <MeasurementModal
          type={selectedVitalModal}
          initialValues={{
            sysBP: heartCareState.vitals.sysBP,
            diaBP: heartCareState.vitals.diaBP,
            pulse: heartCareState.vitals.heartRate,
            spO2: heartCareState.vitals.spO2,
            weight: heartCareState.vitals.weight,
            respRate: heartCareState.vitals.respRate,
            bodyTemp: heartCareState.vitals.bodyTemp,
            ecgStatus: heartCareState.vitals.ecgStatus,
          }}
          onClose={() => setSelectedVitalModal(null)}
          onSubmit={(data) => {
            const vitalsUpdate: Partial<VitalsData> = {};

            if (data.type === 'bp') {
              if (data.values.sysBP) vitalsUpdate.sysBP = data.values.sysBP;
              if (data.values.diaBP) vitalsUpdate.diaBP = data.values.diaBP;
              if (data.values.pulse) vitalsUpdate.heartRate = data.values.pulse;
            } else if (data.type === 'spO2') {
              if (data.values.spO2) vitalsUpdate.spO2 = data.values.spO2;
              if (data.values.pulse) vitalsUpdate.heartRate = data.values.pulse;
            } else if (data.type === 'weight') {
              if (data.values.weight) vitalsUpdate.weight = data.values.weight;
            } else if (data.type === 'rr') {
              if (data.values.respRate) vitalsUpdate.respRate = data.values.respRate;
            } else if (data.type === 'bt') {
              if (data.values.bodyTemp) vitalsUpdate.bodyTemp = data.values.bodyTemp;
            } else if (data.type === 'ecg') {
              if (data.values.pulse) vitalsUpdate.heartRate = data.values.pulse;
              if (data.values.ecgStatus) vitalsUpdate.ecgStatus = data.values.ecgStatus;
            }

            handleQuickVitalSubmit(vitalsUpdate);
            setSelectedVitalModal(null);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* STATUS ASSESSMENT & HEALTH REMINDER DETAIL MODAL */}
      {/* ========================================================= */}
      {selectedLogStatus && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92%] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div
              className={`px-5 py-3.5 text-white flex items-center justify-between shrink-0 ${
                selectedLogStatus.status === 'alert'
                  ? 'bg-red-600'
                  : selectedLogStatus.status === 'warning'
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}
            >
              <div className="flex items-center gap-2">
                {selectedLogStatus.status === 'alert' && <ShieldAlert className="w-5 h-5 text-white" />}
                {selectedLogStatus.status === 'warning' && <AlertTriangle className="w-5 h-5 text-white" />}
                {selectedLogStatus.status === 'normal' && <CheckCircle2 className="w-5 h-5 text-white" />}
                <span className="font-bold text-[1.0625rem]">
                  {selectedLogStatus.timeStr}{' '}
                  {selectedLogStatus.status === 'alert'
                    ? '狀態評估與急症警示'
                    : selectedLogStatus.status === 'warning'
                    ? '狀態評估與追蹤提醒'
                    : '狀態評估與健康提醒'}
                </span>
              </div>
              <button
                onClick={() => setSelectedLogStatus(null)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-[0.875rem]">
              {/* 綜合評估狀態 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="font-extrabold text-slate-800 text-[0.9375rem]">綜合評估狀態：</span>
                  {selectedLogStatus.status === 'alert' && (
                    <span className="px-3.5 py-1 bg-red-100 text-red-700 rounded-full font-extrabold text-xs border border-red-300 flex items-center gap-1">
                      <span>異常 / 紅燈 🔴</span>
                      <span className="font-normal">(建議儘快就醫)</span>
                    </span>
                  )}
                  {selectedLogStatus.status === 'warning' && (
                    <span className="px-3.5 py-1 bg-amber-100 text-amber-700 rounded-full font-extrabold text-xs border border-amber-300 flex items-center gap-1">
                      <span>注意 / 黃燈 🟡</span>
                      <span className="font-normal">(請密切觀察)</span>
                    </span>
                  )}
                  {selectedLogStatus.status === 'normal' && (
                    <span className="px-3.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-extrabold text-xs border border-emerald-300 flex items-center gap-1">
                      <span>正常 / 綠燈 🟢</span>
                      <span className="font-normal">(狀況穩定)</span>
                    </span>
                  )}
                </div>

                {/* 急症警示 */}
                {(() => {
                  const evalVitals = evaluateVitalSigns(selectedLogStatus.vitals);
                  const abnormalVitals = evalVitals.filter((v) => v.level !== 'normal');
                  const abnormalSymptoms = selectedLogStatus.symptoms;
                  const hasTriggers = abnormalVitals.length > 0 || abnormalSymptoms.length > 0;
                  const status = selectedLogStatus.status;
                  const isAlert = status === 'alert';
                  const isWarning = status === 'warning';

                  return (
                    <div className="space-y-3">
                      {hasTriggers ? (
                        <div
                          className={`border-2 rounded-2xl p-4 space-y-3 shadow-xs transition-colors ${
                            isAlert
                              ? 'bg-red-50/90 border-red-300 text-red-950'
                              : isWarning
                              ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                              : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                          }`}
                        >
                          <div
                            className={`flex items-center gap-2 font-extrabold text-[0.9375rem] pb-2.5 border-b ${
                              isAlert
                                ? 'border-red-200 text-red-900'
                                : isWarning
                                ? 'border-amber-200 text-amber-900'
                                : 'border-emerald-200 text-emerald-900'
                            }`}
                          >
                            {isAlert && <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />}
                            {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                            {!isAlert && !isWarning && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}

                            <span>
                              {isAlert ? '🚨 急症警示' : isWarning ? '⚠️ 追蹤提醒' : '🟢 數據摘要'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {abnormalVitals.map((vital) => (
                              <div
                                key={vital.key}
                                className={`bg-white p-3.5 rounded-xl border space-y-2 text-[0.8125rem] ${
                                  vital.level === 'red' ? 'border-red-200' : 'border-amber-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-slate-900 text-[0.875rem]">{vital.name}</span>
                                  <span
                                    className={`px-2.5 py-0.5 font-bold text-xs rounded-md border ${
                                      vital.level === 'red'
                                        ? 'bg-red-100 text-red-700 border-red-300'
                                        : 'bg-amber-100 text-amber-700 border-amber-300'
                                    }`}
                                  >
                                    {vital.level === 'red' ? '紅燈數據 🔴' : '黃燈數據 🟡'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium">
                                  <div>
                                    <span className="text-slate-500">實測數據：</span>
                                    <span
                                      className={`font-bold ${
                                        vital.level === 'red' ? 'text-red-700' : 'text-amber-700'
                                      }`}
                                    >
                                      {vital.valueDisplay}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">警戒門檻：</span>
                                    <span className="font-semibold text-slate-800">{getVitalRedThreshold(vital.key)}</span>
                                  </div>
                                </div>

                                <div
                                  className={`pt-2 border-t space-y-1 ${
                                    vital.level === 'red' ? 'border-red-100 text-red-950' : 'border-amber-100 text-amber-950'
                                  }`}
                                >
                                  <div className="flex items-start gap-1.5">
                                    <span
                                      className={`font-extrabold shrink-0 ${
                                        vital.level === 'red' ? 'text-red-700' : 'text-amber-700'
                                      }`}
                                    >
                                      ⚠️ 急症警告與就醫條件：
                                    </span>
                                    <p
                                      className={`leading-relaxed font-semibold ${
                                        vital.level === 'red' ? 'text-[#881337]' : 'text-amber-900'
                                      }`}
                                    >
                                      {vital.emergencyWarning}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {abnormalSymptoms.map((symptom) => (
                              <div
                                key={symptom.id}
                                className={`bg-white p-3.5 rounded-xl border space-y-2 text-[0.8125rem] ${
                                  symptom.severity === 'red' ? 'border-red-200' : 'border-amber-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-slate-900 text-[0.875rem]">{symptom.name}</span>
                                  <span
                                    className={`px-2.5 py-0.5 font-bold text-xs rounded-md border ${
                                      symptom.severity === 'red'
                                        ? 'bg-red-100 text-red-700 border-red-300'
                                        : 'bg-amber-100 text-amber-700 border-amber-300'
                                    }`}
                                  >
                                    {symptom.severity === 'red' ? '高風險症狀 🔴' : '注意症狀 🟡'}
                                  </span>
                                </div>

                                {symptom.details && symptom.details.length > 0 && (
                                  <div className="flex flex-wrap gap-1 text-xs">
                                    <span className="text-slate-500 font-medium">回報狀況：</span>
                                    {symptom.details.map((d, i) => (
                                      <span
                                        key={i}
                                        className={`px-2 py-0.5 border rounded font-medium ${
                                          symptom.severity === 'red'
                                            ? 'bg-red-50 border-red-200 text-red-800'
                                            : 'bg-amber-50 border-amber-200 text-amber-800'
                                        }`}
                                      >
                                        {d}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div
                                  className={`pt-2 border-t space-y-1 ${
                                    symptom.severity === 'red' ? 'border-red-100 text-red-950' : 'border-amber-100 text-amber-950'
                                  }`}
                                >
                                  <div className="flex items-start gap-1.5">
                                    <span
                                      className={`font-extrabold shrink-0 ${
                                        symptom.severity === 'red' ? 'text-red-700' : 'text-amber-700'
                                      }`}
                                    >
                                      ⚠️ 就醫叮嚀：
                                    </span>
                                    <p
                                      className={`leading-relaxed font-semibold ${
                                        symptom.severity === 'red' ? 'text-[#881337]' : 'text-amber-900'
                                      }`}
                                    >
                                      {symptom.emergencyWarning}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-[0.8125rem] flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span className="font-medium">本日記錄之生理數據與症狀均落在正常穩定範圍。</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 緊急就醫提醒 */}
                <div className="border-2 rounded-2xl p-4 space-y-2.5 shadow-xs bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-2 font-black text-[1.0625rem] text-slate-900">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-slate-700" />
                    <span>⚠️ 緊急就醫提醒指引</span>
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-[0.8125rem] leading-relaxed space-y-2 font-medium text-slate-800">
                    <p>1. 本系統僅提供警示提醒、訊息推播與回報功能，不具備主動通報 119、代為叫救護車或自動安排就醫之功能。</p>
                    <p>2. 若病人同時出現下列任一情形，請勿僅在家觀察，應立即自行就近就醫；必要時由本人或家屬自行撥打 119：</p>
                    <ul className="pl-4 space-y-1.5 list-disc text-slate-700 font-normal">
                      <li>胸痛或胸悶，合併喘、冒冷汗、噁心、頭暈、手臂 / 下巴 / 上背不適。</li>
                      <li>休息時喘、平躺喘、夜間喘醒，合併血氧下降、說話困難、嘴唇發紫。</li>
                      <li>心悸或心跳很快 / 很慢，合併頭暈、快昏倒、胸悶、胸痛、喘。</li>
                      <li>體重短期快速上升，合併下肢水腫、腹脹、喘加重、夜間喘醒。</li>
                      <li>意識不清、無法完整說話、快昏倒、昏倒、明顯虛弱。</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-right shrink-0">
              <button
                onClick={() => setSelectedLogStatus(null)}
                className="px-6 py-2.5 bg-[#ee7326] text-white font-bold rounded-xl text-sm hover:bg-[#d9641d] transition-colors cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
