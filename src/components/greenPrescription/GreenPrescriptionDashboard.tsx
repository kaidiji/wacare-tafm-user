import React, { useState, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  AlertCircle,
  MessageSquare,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  PieChart as PieChartIcon,
  Stethoscope,
  Users,
  Calendar,
  Award,
  Plus,
  Search,
  Filter,
  MoreVertical,
} from 'lucide-react';
import { VideoTask } from './greenPrescriptionData';
import { ScreenId } from '../../types';
import {
  INITIAL_DOCTOR_PRESCRIPTIONS,
  DoctorPrescriptionSection,
  getDoctorPrescriptionSection,
  normalizePillarKey,
} from './doctorPrescriptionsData';

// Custom Pie Chart Icon matching IMG_9026.PNG
const DataPieGlyph: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-[#f37021]' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

interface Props {
  onBack: () => void;
  onNavigateToTasks: () => void;
  tasks: VideoTask[];
  assignedGoals?: string[];
  submittedGoals?: string[];
  isQuestionnaireSubmitted?: boolean;
  isPrescriptionDispatched?: boolean;
  onDispatchPrescription?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onNavigate?: (screen: ScreenId) => void;
  prescriptionData?: Record<string, DoctorPrescriptionSection>;
  onTogglePrescriptionItem?: (pillarKey: string, itemId: string) => void;
}

export const GreenPrescriptionDashboard: React.FC<Props> = ({
  onBack,
  onNavigateToTasks,
  tasks,
  assignedGoals = [],
  submittedGoals = [],
  isQuestionnaireSubmitted = false,
  isPrescriptionDispatched = false,
  onDispatchPrescription,
  onNavigateToQuestionnaire,
  onNavigate,
  prescriptionData: propPrescriptionData,
  onTogglePrescriptionItem: propOnTogglePrescriptionItem,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 7, 27)); // 2026年8月27日 (星期四)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showStatsDetailView, setShowStatsDetailView] = useState(false);
  const [showDispatchSuccessToast, setShowDispatchSuccessToast] = useState(false);
  
  // State for data analysis interval switcher (matching IMG_9026.PNG)
  const [analysisInterval, setAnalysisInterval] = useState<'week' | 'month' | 'quarter'>('week');

  // State for raw data filter & detail modal (matching IMG_9040.PNG format)
  const [rawDataCategoryFilter, setRawDataCategoryFilter] = useState<string>('ALL');
  const [showRawFilterDropdown, setShowRawFilterDropdown] = useState<boolean>(false);
  const [selectedRawDataModalWeekIndex, setSelectedRawDataModalWeekIndex] = useState<number | null>(null);

  // State for expanding/collapsing data analysis categories (matching IMG_9026.PNG format)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    prescription: false,
    video: false,
  });

  const toggleCategoryExpand = (catKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };
  
  // State for alert modal when clicking unassigned prescription
  const [showUnassignedAlert, setShowUnassignedAlert] = useState(false);

  // State for displaying the full prescription details page
  const [showPrescriptionDetailsView, setShowPrescriptionDetailsView] = useState(false);
  const [activePrescriptionDetailInfo, setActivePrescriptionDetailInfo] = useState<string | null>(null);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');

  // Category Tabs Horizontal Scroll & Drag Support
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingTabsRef = useRef(false);
  const tabsStartXRef = useRef(0);
  const tabsScrollLeftRef = useRef(0);

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    isDraggingTabsRef.current = true;
    tabsStartXRef.current = e.pageX - el.offsetLeft;
    tabsScrollLeftRef.current = el.scrollLeft;
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTabsRef.current) return;
    const el = tabsScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - tabsStartXRef.current) * 1.5;
    el.scrollLeft = tabsScrollLeftRef.current - walk;
  };

  const handleTabsMouseUpOrLeave = () => {
    isDraggingTabsRef.current = false;
  };

  const handleTabsWheel = (e: React.WheelEvent) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  // Has the doctor assigned prescriptions (Only true when dispatched by expert clinic or assignedGoals has items)
  const isDoctorAssigned = isPrescriptionDispatched || assignedGoals.length > 0;

  // Active goals list (defaults to user's submitted goals if assigned)
  const displayGoals = assignedGoals.length > 0 ? assignedGoals : submittedGoals;
  const activeGoalKeys = isDoctorAssigned
    ? displayGoals.length > 0
      ? displayGoals
      : ['運動習慣', '飲食習慣']
    : displayGoals.length > 0
    ? displayGoals
    : ['運動習慣', '飲食習慣'];

  // Internal State for checkable prescription items with localStorage fallback
  const [internalPrescriptionData, setInternalPrescriptionData] = useState<
    Record<string, DoctorPrescriptionSection>
  >(() => {
    try {
      const saved = localStorage.getItem('wacare_doctor_prescriptions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_DOCTOR_PRESCRIPTIONS;
  });

  const prescriptionData = propPrescriptionData ?? internalPrescriptionData;

  const toggleItemCheck = (pillarKey: string, itemId: string) => {
    if (propOnTogglePrescriptionItem) {
      propOnTogglePrescriptionItem(pillarKey, itemId);
    }
    setInternalPrescriptionData((prev) => {
      const normalized = normalizePillarKey(pillarKey);
      const section =
        prev[pillarKey] ||
        prev[normalized] ||
        getDoctorPrescriptionSection(pillarKey, prev);
      if (!section) return prev;

      const updatedSection: DoctorPrescriptionSection = {
        ...section,
        items: section.items.map((it) =>
          it.id === itemId ? { ...it, completed: !it.completed } : it
        ),
      };

      const next = {
        ...prev,
        [pillarKey]: updatedSection,
        [normalized]: updatedSection,
        [section.pillarKey]: updatedSection,
      };

      try {
        localStorage.setItem('wacare_doctor_prescriptions', JSON.stringify(next));
      } catch (e) {
        // ignore
      }

      return next;
    });
  };

  // Calculate total prescribed items and completed count for assigned goals
  let totalPrescriptionItems = 0;
  let completedPrescriptionItems = 0;

  const categoryBreakdown = activeGoalKeys.map((key) => {
    const sec = getDoctorPrescriptionSection(key, prescriptionData);
    const total = sec ? sec.items.length : 0;
    const completed = sec ? sec.items.filter((it) => it.completed).length : 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      key,
      title: sec?.categoryTitle || key,
      total,
      completed,
      percent,
      pillarKey: sec?.pillarKey || key,
    };
  });

  categoryBreakdown.forEach((cat) => {
    totalPrescriptionItems += cat.total;
    completedPrescriptionItems += cat.completed;
  });

  const prescriptionProgressPercent =
    totalPrescriptionItems > 0
      ? Math.round((completedPrescriptionItems / totalPrescriptionItems) * 100)
      : 0;

  // Selected week on the weekly trend line chart
  const [selectedTrendWeekIndex, setSelectedTrendWeekIndex] = useState<number>(4); // Default to current week (index 4)

  // Weekly task completion trend history data (過去4週 + 本週)
  const weeklyTrendData = useMemo(() => {
    const total = totalPrescriptionItems > 0 ? totalPrescriptionItems : 8;
    return [
      {
        weekLabel: '第 1 週',
        shortLabel: 'W1',
        dateRange: '08/04 ~ 08/10',
        completed: Math.min(total, Math.max(1, Math.round(total * 0.75))),
        total: total,
        percent: 75,
        status: 'pass' as const,
        statusText: '順利達標',
      },
      {
        weekLabel: '第 2 週',
        shortLabel: 'W2',
        dateRange: '08/11 ~ 08/17',
        completed: Math.min(total, Math.max(1, Math.round(total * 0.88))),
        total: total,
        percent: 88,
        status: 'pass' as const,
        statusText: '優秀達標',
      },
      {
        weekLabel: '第 3 週',
        shortLabel: 'W3',
        dateRange: '08/18 ~ 08/24',
        completed: Math.min(total, Math.max(1, Math.round(total * 0.63))),
        total: total,
        percent: 63,
        status: 'warning' as const,
        statusText: '部分完成',
      },
      {
        weekLabel: '第 4 週',
        shortLabel: 'W4',
        dateRange: '08/25 ~ 08/31',
        completed: total,
        total: total,
        percent: 100,
        status: 'pass' as const,
        statusText: '滿分達標',
      },
      {
        weekLabel: '本週',
        shortLabel: '本週',
        dateRange: '09/01 ~ 09/07',
        completed: completedPrescriptionItems,
        total: totalPrescriptionItems > 0 ? totalPrescriptionItems : total,
        percent: prescriptionProgressPercent,
        status:
          prescriptionProgressPercent >= 75
            ? ('pass' as const)
            : prescriptionProgressPercent > 0
            ? ('in_progress' as const)
            : ('warning' as const),
        statusText:
          prescriptionProgressPercent >= 75
            ? '本週已順利達標'
            : prescriptionProgressPercent > 0
            ? `進行中 (剩餘 ${Math.max(0, (totalPrescriptionItems > 0 ? totalPrescriptionItems : total) - completedPrescriptionItems)} 項)`
            : '本週待執行',
      },
    ];
  }, [totalPrescriptionItems, completedPrescriptionItems, prescriptionProgressPercent]);

  // Weekly target & completed count for videos
  const [weeklyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('wacare_weekly_video_target');
    return saved ? parseInt(saved, 10) || 3 : 3;
  });

  const completedTasks = tasks.filter((t) => t.completed);
  const completedCount = completedTasks.length;
  const videoProgressRatio =
    weeklyTarget > 0 ? Math.min(100, Math.round((completedCount / weeklyTarget) * 100)) : 0;

  const getWeekDayName = (d: Date) => {
    const names = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return names[d.getDay()];
  };

  const handleGoToQuestionnaire = () => {
    setShowUnassignedAlert(false);
    if (onNavigate) {
      onNavigate('QUESTIONNAIRE');
    } else if (onNavigateToQuestionnaire) {
      onNavigateToQuestionnaire();
    }
  };

  const handleGoToExperts = () => {
    setShowUnassignedAlert(false);
    if (onNavigate) {
      onNavigate('SCR-04');
    }
  };

  // -------------------------------------------------------------
  // VIEW: 健康數據分析詳細頁面 (參考 IMG_9040.PNG 精確設計：折線圖 + 每週 Raw Data 表)
  // -------------------------------------------------------------
  if (showStatsDetailView) {
    const rawWeeklyRecordsList = [
      {
        id: 'w5',
        weekTitle: '本週',
        dateStr: '2026-08-31 16:40 午間',
        dateRange: '09/01 ~ 09/07',
        prescriptionCompleted: completedPrescriptionItems,
        prescriptionTotal: totalPrescriptionItems > 0 ? totalPrescriptionItems : 15,
        videoCompleted: completedCount,
        videoTotal: weeklyTarget,
        percent: prescriptionProgressPercent,
        statusText: prescriptionProgressPercent >= 75 ? '正常' : prescriptionProgressPercent >= 60 ? '普通' : '留意',
        statusType: prescriptionProgressPercent >= 75 ? 'normal' : prescriptionProgressPercent >= 60 ? 'warning' : 'danger',
        breakdown: [
          { key: 'sleep', name: '睡眠處方', completed: Math.min(3, completedPrescriptionItems), total: 3 },
          { key: 'stress', name: '壓力管理處方', completed: Math.min(2, Math.max(0, completedPrescriptionItems - 3)), total: 2 },
          { key: 'diet', name: '飲食習慣處方', completed: Math.min(3, Math.max(0, completedPrescriptionItems - 5)), total: 3 },
          { key: 'exercise', name: '運動處方', completed: Math.min(2, Math.max(0, completedPrescriptionItems - 8)), total: 2 },
          { key: 'substances', name: '避免有害物質', completed: Math.min(3, Math.max(0, completedPrescriptionItems - 10)), total: 3 },
          { key: 'social', name: '人際社交處方', completed: Math.min(2, Math.max(0, completedPrescriptionItems - 13)), total: 2 },
          { key: 'video', name: '衛教影片任務', completed: completedCount, total: weeklyTarget },
        ],
      },
      {
        id: 'w4',
        weekTitle: '第 4 週',
        dateStr: '2026-08-24 11:48 午間',
        dateRange: '08/25 ~ 08/31',
        prescriptionCompleted: 15,
        prescriptionTotal: 15,
        videoCompleted: 3,
        videoTotal: 3,
        percent: 100,
        statusText: '滿分',
        statusType: 'normal',
        breakdown: [
          { key: 'sleep', name: '睡眠處方', completed: 3, total: 3 },
          { key: 'stress', name: '壓力管理處方', completed: 2, total: 2 },
          { key: 'diet', name: '飲食習慣處方', completed: 3, total: 3 },
          { key: 'exercise', name: '運動處方', completed: 2, total: 2 },
          { key: 'substances', name: '避免有害物質', completed: 3, total: 3 },
          { key: 'social', name: '人際社交處方', completed: 2, total: 2 },
          { key: 'video', name: '衛教影片任務', completed: 3, total: 3 },
        ],
      },
      {
        id: 'w3',
        weekTitle: '第 3 週',
        dateStr: '2026-08-17 11:05 午間',
        dateRange: '08/18 ~ 08/24',
        prescriptionCompleted: 10,
        prescriptionTotal: 15,
        videoCompleted: 2,
        videoTotal: 3,
        percent: 63,
        statusText: '留意',
        statusType: 'warning',
        breakdown: [
          { key: 'sleep', name: '睡眠處方', completed: 2, total: 3 },
          { key: 'stress', name: '壓力管理處方', completed: 1, total: 2 },
          { key: 'diet', name: '飲食習慣處方', completed: 2, total: 3 },
          { key: 'exercise', name: '運動處方', completed: 1, total: 2 },
          { key: 'substances', name: '避免有害物質', completed: 3, total: 3 },
          { key: 'social', name: '人際社交處方', completed: 0, total: 2 },
          { key: 'video', name: '衛教影片任務', completed: 2, total: 3 },
        ],
      },
      {
        id: 'w2',
        weekTitle: '第 2 週',
        dateStr: '2026-08-10 12:48 午間',
        dateRange: '08/11 ~ 08/17',
        prescriptionCompleted: 13,
        prescriptionTotal: 15,
        videoCompleted: 3,
        videoTotal: 3,
        percent: 88,
        statusText: '普通',
        statusType: 'normal',
        breakdown: [
          { key: 'sleep', name: '睡眠處方', completed: 3, total: 3 },
          { key: 'stress', name: '壓力管理處方', completed: 2, total: 2 },
          { key: 'diet', name: '飲食習慣處方', completed: 3, total: 3 },
          { key: 'exercise', name: '運動處方', completed: 2, total: 2 },
          { key: 'substances', name: '避免有害物質', completed: 2, total: 3 },
          { key: 'social', name: '人際社交處方', completed: 1, total: 2 },
          { key: 'video', name: '衛教影片任務', completed: 3, total: 3 },
        ],
      },
      {
        id: 'w1',
        weekTitle: '第 1 週',
        dateStr: '2026-08-03 16:20 午間',
        dateRange: '08/04 ~ 08/10',
        prescriptionCompleted: 8,
        prescriptionTotal: 15,
        videoCompleted: 1,
        videoTotal: 3,
        percent: 57,
        statusText: '留意',
        statusType: 'warning',
        breakdown: [
          { key: 'sleep', name: '睡眠處方', completed: 2, total: 3 },
          { key: 'stress', name: '壓力管理處方', completed: 1, total: 2 },
          { key: 'diet', name: '飲食習慣處方', completed: 2, total: 3 },
          { key: 'exercise', name: '運動處方', completed: 1, total: 2 },
          { key: 'substances', name: '避免有害物質', completed: 2, total: 3 },
          { key: 'social', name: '人際社交處方', completed: 0, total: 2 },
          { key: 'video', name: '衛教影片任務', completed: 1, total: 3 },
        ],
      },
    ];

    const filterOptions = [
      { key: 'ALL', label: '所有' },
      { key: 'sleep', label: '睡眠處方' },
      { key: 'stress', label: '壓力管理' },
      { key: 'diet', label: '飲食習慣' },
      { key: 'exercise', label: '運動處方' },
      { key: 'substances', label: '避免有害物質' },
      { key: 'social', label: '人際社交' },
      { key: 'video', label: '衛教影片' },
    ];

    return (
      <div className="flex flex-col h-full bg-slate-50 font-sans antialiased text-slate-900 select-none overflow-hidden animate-in fade-in duration-200">
        
        {/* 1. Top Header matching IMG_9040.PNG */}
        <header className="px-4 py-3 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between min-h-[3.25rem] relative z-20">
          <button
            onClick={() => setShowStatsDetailView(false)}
            className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 flex items-center"
            aria-label="返回"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <h1 className="text-base font-black text-slate-900 tracking-tight">
            Kai 綠色處方數據分析
          </h1>

          <button
            onClick={() => setShowPrescriptionDetailsView(true)}
            className="p-1.5 -mr-1 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 flex items-center"
            title="新增打卡紀錄"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </header>

        {/* 2. Main Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12">
          
          {/* Top Promo Banner matching IMG_9040.PNG */}
          <div className="bg-[#FFF3EC] border border-[#FCD5CE] rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.2 rounded-full">
                  好評延長加碼日日抽！
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm font-black text-[#f37021]">
                <span>量綠處方 贏健康</span>
                <span className="bg-[#f37021] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                  賺獎金
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium self-end">廣告</span>
          </div>

          {/* Filter Bar & Summary Record Card matching IMG_9040.PNG */}
          <div className="space-y-3">
            {/* Filter Row: Left Dropdown + Right Search & Menu icons */}
            <div className="flex items-center justify-between relative z-10">
              {/* Dropdown Button matching "所有 ▾" in IMG_9040.PNG */}
              <div className="relative">
                <button
                  onClick={() => setShowRawFilterDropdown(!showRawFilterDropdown)}
                  className="flex items-center gap-1 text-sm font-black text-slate-800 hover:text-slate-900 cursor-pointer py-1 px-1 rounded-lg hover:bg-slate-200/50"
                >
                  <span>
                    {filterOptions.find((o) => o.key === rawDataCategoryFilter)?.label || '所有'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Filter Popover Menu */}
                {showRawFilterDropdown && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40 z-30 animate-in fade-in duration-150">
                    {filterOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setRawDataCategoryFilter(opt.key);
                          setShowRawFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                          rawDataCategoryFilter === opt.key
                            ? 'bg-orange-50 text-orange-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {rawDataCategoryFilter === opt.key && <Check className="w-3.5 h-3.5 text-orange-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Action Icons */}
              <div className="flex items-center gap-2 text-slate-500">
                <button className="p-1.5 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer">
                  <Search className="w-4.5 h-4.5" />
                </button>
                <button className="p-1.5 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer">
                  <MoreVertical className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Summary Record Card matching "722血壓量測數據紀錄 >" in IMG_9040.PNG */}
            <div
              onClick={() => setShowPrescriptionDetailsView(true)}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:border-orange-300 transition-all cursor-pointer group"
            >
              <span className="font-extrabold text-slate-900 text-[1.03rem]">
                綠色處方週執行數據紀錄
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* 3. 折線圖 (Line Chart matching request) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-black text-slate-900">
                  每週總處方達成率趨勢
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                75% 達標線
              </span>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative w-full h-[160px] pt-1">
              {(() => {
                const chartWidth = 330;
                const chartHeight = 150;
                const padLeft = 32;
                const padRight = 20;
                const padTop = 20;
                const padBottom = 28;
                const plotWidth = chartWidth - padLeft - padRight;
                const plotHeight = chartHeight - padTop - padBottom;

                const trendPoints = [...rawWeeklyRecordsList].reverse();

                const getX = (idx: number) =>
                  padLeft + (idx / Math.max(1, trendPoints.length - 1)) * plotWidth;
                const getY = (val: number) =>
                  padTop + (1 - Math.min(100, Math.max(0, val)) / 100) * plotHeight;

                const linePoints = trendPoints
                  .map((d, i) => `${getX(i)},${getY(d.percent)}`)
                  .join(' ');

                const areaPoints =
                  `M ${getX(0)},${chartHeight - padBottom} ` +
                  trendPoints.map((d, i) => `L ${getX(i)},${getY(d.percent)}`).join(' ') +
                  ` L ${getX(trendPoints.length - 1)},${chartHeight - padBottom} Z`;

                const targetY = getY(75);

                return (
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full overflow-visible select-none"
                  >
                    <defs>
                      <linearGradient id="rawTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f37021" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f37021" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y-Axis Grid Lines */}
                    <line x1={padLeft} y1={getY(100)} x2={chartWidth - padRight} y2={getY(100)} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <text x={padLeft - 4} y={getY(100) + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="bold">100%</text>

                    {/* Target Line */}
                    <line x1={padLeft} y1={targetY} x2={chartWidth - padRight} y2={targetY} stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" />

                    <line x1={padLeft} y1={getY(50)} x2={chartWidth - padRight} y2={getY(50)} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <text x={padLeft - 4} y={getY(50) + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="bold">50%</text>

                    <line x1={padLeft} y1={chartHeight - padBottom} x2={chartWidth - padRight} y2={chartHeight - padBottom} stroke="#cbd5e1" strokeWidth="1.2" />

                    {/* Gradient Area */}
                    <path d={areaPoints} fill="url(#rawTrendGrad)" />

                    {/* Polyline */}
                    <polyline fill="none" stroke="#f37021" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={linePoints} />

                    {/* Data Points */}
                    {trendPoints.map((d, idx) => {
                      const cx = getX(idx);
                      const cy = getY(d.percent);
                      const isPassed = d.percent >= 75;
                      return (
                        <g key={d.id} className="cursor-pointer">
                          <circle cx={cx} cy={cy} r="4.5" fill="#ffffff" stroke={isPassed ? '#16a34a' : '#f37021'} strokeWidth="2.5" />
                          <text x={cx} y={cy - 7} textAnchor="middle" fontSize="9" fontWeight="bold" fill={isPassed ? '#15803d' : '#f37021'}>
                            {d.percent}%
                          </text>
                          <text x={cx} y={chartHeight - padBottom + 13} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#475569">
                            {d.weekTitle}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>
          </div>

          {/* 4. Weekly Raw Data Table (每週 raw data 數據紀錄表 matching IMG_9040.PNG exact format) */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs space-y-0">
            {/* Table Header Row matching user request: 時間, 處方打卡 (完成/總數) */}
            <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="w-32 shrink-0">時間</span>
              <span className="flex-1 text-center">處方打卡 (完成/總數)</span>
              <span className="w-6 text-right"></span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100">
              {rawWeeklyRecordsList.map((row, idx) => (
                <div key={row.id} className="transition-colors hover:bg-slate-50/80">
                  {/* Main Row */}
                  <div
                    onClick={() => setSelectedRawDataModalWeekIndex(idx)}
                    className="px-4 py-3 flex items-center justify-between cursor-pointer group"
                  >
                    {/* Time Column */}
                    <div className="w-32 shrink-0 space-y-0.5">
                      <div className="text-xs font-extrabold text-slate-900 leading-tight">
                        {row.dateStr.split(' ')[0]}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500">
                        {row.dateStr.split(' ')[1]} {row.weekTitle}
                      </div>
                    </div>

                    {/* Prescription & Video Raw Counts */}
                    <div className="flex-1 text-center px-1">
                      <div className="text-sm font-black text-slate-800">
                        {row.prescriptionCompleted} / {row.prescriptionTotal} 項
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600">
                        影片：{row.videoCompleted}/{row.videoTotal} 支
                      </div>
                    </div>

                    {/* Orange Arrow */}
                    <div className="w-6 flex justify-end shrink-0">
                      <ArrowRight className="w-4.5 h-4.5 text-[#f37021] stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Expanded Breakdown Pill Preview for all categories */}
                  <div className="px-3.5 pb-2.5 pt-0 flex flex-wrap gap-1.5 border-t border-dashed border-slate-100/80 mt-0.5">
                    {row.breakdown
                      .filter((b) => {
                        if (rawDataCategoryFilter === 'ALL') return true;
                        return b.key === rawDataCategoryFilter;
                      })
                      .map((b) => (
                        <span
                          key={b.name}
                          className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            b.completed === b.total && b.total > 0
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span>{b.name.replace('處方', '').replace('任務', '')}:</span>
                          <span className="font-black text-slate-900">
                            {b.completed}/{b.total}
                          </span>
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal: Detailed Raw Data Popover when clicking any week row */}
        {selectedRawDataModalWeekIndex !== null && rawWeeklyRecordsList[selectedRawDataModalWeekIndex] && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-5 space-y-4 border border-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {rawWeeklyRecordsList[selectedRawDataModalWeekIndex].weekTitle} (
                    {rawWeeklyRecordsList[selectedRawDataModalWeekIndex].dateRange}) Raw Data
                  </h3>
                  <div className="text-xs text-slate-500 font-bold">
                    記錄時間：{rawWeeklyRecordsList[selectedRawDataModalWeekIndex].dateStr}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRawDataModalWeekIndex(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Itemized Categories Breakdown */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {rawWeeklyRecordsList[selectedRawDataModalWeekIndex].breakdown.map((b) => (
                  <div key={b.name} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold">
                    <span className="text-slate-800">{b.name}</span>
                    <span className={`font-black ${b.completed === b.total ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {b.completed} / {b.total} 項完成
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedRawDataModalWeekIndex(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
              >
                關閉
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: 專家指派處方詳細清單頁面 (點擊處方任務後進入)
  // -------------------------------------------------------------
  if (showPrescriptionDetailsView && isDoctorAssigned) {
    return (
      <div className="flex flex-col h-full bg-slate-100/70 font-sans antialiased text-slate-900 select-none overflow-hidden animate-in fade-in duration-200">
        
        {/* Top Header */}
        <header className="px-4 py-3 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between min-h-[3.25rem]">
          <button
            onClick={() => setShowPrescriptionDetailsView(false)}
            className="p-1 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
            aria-label="返回處方首頁"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            <span className="text-xs font-bold text-slate-700">綠色處方</span>
          </button>

          <h1 className="text-[1.0625rem] font-black text-slate-900 tracking-tight">
            醫師指派處方明細
          </h1>

          <div className="w-14 text-right">
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              生效中
            </span>
          </div>
        </header>

        {/* Progress & Doctor Info Banner */}
        <div className="bg-[#FDF2E7] px-4 py-3.5 border-b border-[#F7E0C8] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                👨‍⚕️
              </div>
              <div>
                <div className="text-xs font-bold text-slate-600">
                  開立專家：生活型態醫學認證專家
                </div>
                <div className="text-sm font-black text-slate-900">
                  個人化生活型態指派處方
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-orange-600">
                {completedPrescriptionItems}
              </span>
              <span className="text-xs font-bold text-slate-500">
                /{totalPrescriptionItems} 項完成
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-600">
              <span>今日處方執行達成率</span>
              <span className="text-orange-600 font-extrabold">{prescriptionProgressPercent}%</span>
            </div>
            <div className="w-full bg-orange-200/60 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-orange-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${prescriptionProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Tabs (全部 & 各自的處方標籤 - 支援滑鼠拖曳、滾輪與觸控平滑橫向滑動) */}
        <div className="bg-white border-b border-slate-200/90 py-2.5 px-3 shrink-0 shadow-2xs relative">
          <div
            ref={tabsScrollRef}
            onMouseDown={handleTabsMouseDown}
            onMouseMove={handleTabsMouseMove}
            onMouseUp={handleTabsMouseUpOrLeave}
            onMouseLeave={handleTabsMouseUpOrLeave}
            onWheel={handleTabsWheel}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 select-none cursor-grab active:cursor-grabbing touch-pan-x scroll-smooth overscroll-x-contain"
          >
            {/* 全部 Tab */}
            <button
              type="button"
              onClick={(e) => {
                setSelectedCategoryTab('ALL');
                e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                selectedCategoryTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/70'
              }`}
            >
              <span>全部</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategoryTab === 'ALL'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {completedPrescriptionItems}/{totalPrescriptionItems}
              </span>
            </button>

            {/* Individual Category Tabs */}
            {activeGoalKeys.map((key) => {
              const section = getDoctorPrescriptionSection(key, prescriptionData);
              if (!section) return null;

              const completedSecCount = section.items.filter((it) => it.completed).length;
              const isSelected =
                selectedCategoryTab === key ||
                selectedCategoryTab === section.pillarKey ||
                selectedCategoryTab === normalizePillarKey(key);

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={(e) => {
                    setSelectedCategoryTab(section.pillarKey);
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/70'
                  }`}
                >
                  <span>{section.categoryTitle}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {completedSecCount}/{section.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Prescription Checklist (Exact Format matching uploaded image) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-12">
          {activeGoalKeys
            .filter((key) => {
              if (selectedCategoryTab === 'ALL') return true;
              const sec = getDoctorPrescriptionSection(key, prescriptionData);
              return (
                sec &&
                (selectedCategoryTab === key ||
                  selectedCategoryTab === sec.pillarKey ||
                  selectedCategoryTab === normalizePillarKey(key))
              );
            })
            .map((key) => {
              const section = getDoctorPrescriptionSection(key, prescriptionData);
              if (!section) return null;

            return (
              <div
                key={section.id}
                className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs space-y-3.5"
              >
                {/* Category Header with Right Arrow */}
                <div
                  onClick={() => setActivePrescriptionDetailInfo(section.categoryTitle)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <h2 className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                    {section.categoryTitle}
                  </h2>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Items List (Big Bold Text + Green Checkbox Box on Right matching reference image) */}
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItemCheck(section.pillarKey, item.id)}
                      className="flex items-center justify-between gap-3 cursor-pointer select-none group"
                    >
                      <span
                        className={`text-[1.0625rem] font-black tracking-tight leading-snug transition-colors ${
                          item.completed
                            ? 'text-emerald-800'
                            : 'text-slate-900 group-hover:text-slate-700'
                        }`}
                      >
                        {item.title}
                      </span>

                      {/* Green Checkbox Box Icon */}
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all ${
                          item.completed
                            ? 'bg-[#16a34a] text-white shadow-2xs group-hover:bg-[#15803d]'
                            : 'border-2 border-slate-300 bg-white group-hover:border-slate-400'
                        }`}
                      >
                        {item.completed && (
                          <Check className="w-4.5 h-4.5 stroke-[3.5]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <button
              onClick={() => setShowPrescriptionDetailsView(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              儲存並返回
            </button>
          </div>
        </div>

        {/* Modal: Category Info Modal */}
        {activePrescriptionDetailInfo && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-5 space-y-4 border border-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">
                  {activePrescriptionDetailInfo} 指引說明
                </h3>
                <button
                  onClick={() => setActivePrescriptionDetailInfo(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 leading-relaxed font-medium">
                本項目為生活型態醫學認證專家開立之處方指引，請配合日常作息確實落實執行。
              </div>

              <button
                onClick={() => setActivePrescriptionDetailInfo(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer"
              >
                我知道了
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN VIEW: 綠色處方主儀表板
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-slate-100/60 font-sans antialiased text-slate-900 select-none overflow-hidden">
      
      {/* 1. Top Navigation Bar (matching IMG_9003) */}
      <header className="px-4 py-3 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between min-h-[3.25rem]">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
          aria-label="返回"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-[1.0625rem] font-black text-slate-900 tracking-tight">
          綠色處方
        </h1>

        <div className="w-6" />
      </header>

      {/* 2. Calendar / Date Header Banner (Exact style of IMG_9003) */}
      <div className="bg-[#FDF2E7] px-4 py-3.5 border-b border-[#F7E0C8] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          {/* Calendar block: Orange header + white day card */}
          <div className="w-14 h-15 rounded-xl bg-white border border-orange-200/90 shadow-xs overflow-hidden flex flex-col items-center shrink-0">
            <div className="w-full bg-[#f37021] text-white text-[11px] font-black py-0.5 text-center leading-none">
              Aug
            </div>
            <div className="flex-1 flex items-center justify-center text-[#f37021] text-2xl font-black leading-none">
              {selectedDate.getDate()}
            </div>
          </div>

          {/* Date Label & Dropdown */}
          <div
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="cursor-pointer group select-none"
          >
            <div className="text-xs font-bold text-slate-600">
              {selectedDate.getFullYear()}年
            </div>
            <div className="flex items-center gap-1.5 text-base sm:text-[1.0625rem] font-black text-slate-900 group-hover:text-orange-600 transition-colors">
              <span>
                {selectedDate.getMonth() + 1} 月 {selectedDate.getDate()} 日({getWeekDayName(selectedDate)})
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-orange-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Date picker simple selector sheet */}
      {showDatePicker && (
        <div className="p-3 bg-white border-b border-slate-200 shadow-xs flex items-center justify-between text-xs shrink-0">
          <span className="font-bold text-slate-700">切換評估日期</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedDate(new Date(2026, 7, 27));
                setShowDatePicker(false);
              }}
              className="px-3 py-1 bg-orange-600 text-white rounded-lg font-bold text-xs cursor-pointer"
            >
              8/27 (今日)
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="px-2 py-1 text-slate-500 font-bold hover:text-slate-800 cursor-pointer"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Card List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-12">
        
        {/* CARD 1 (TOP): 健康數據分析 (點擊進入獨立數據分析頁面) */}
        <div
          onClick={() => setShowStatsDetailView(true)}
          className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group flex items-center justify-between"
        >
          <h2 className="text-base font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
            健康數據分析
          </h2>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* CARD 2: 專家指派生活型態處方 */}
        {!isDoctorAssigned ? (
          isQuestionnaireSubmitted ? (
            /* 狀況 A-1：問卷已填寫，等待專家診所從後台派送處方 */
            <div className="bg-white rounded-2xl border border-amber-300 p-4.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600 font-extrabold text-xs">
                  <span className="text-amber-600">⏳</span>
                  <span>生活型態醫學認證專家 指派</span>
                </div>
                <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  評估中
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[1.0625rem] font-black text-slate-900">
                  專家指派生活型態處方
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  問卷已送達診所，待專家評估並開立處方
                </div>
              </div>
            </div>
          ) : (
            /* 狀況 A-2：尚未填寫問卷 */
            <div
              onClick={() => setShowUnassignedAlert(true)}
              className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600 font-extrabold text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>生活型態醫學認證專家 指派</span>
                </div>
                <span className="text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  待填寫問卷
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[1.0625rem] font-black text-slate-900 group-hover:text-orange-600 transition-colors flex items-center justify-between">
                  <span>專家指派生活型態處方</span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  尚未收到專家處方，點擊查看說明
                </div>
              </div>
            </div>
          )
        ) : (
          /* 狀況 B：專家已指派處方 */
          <div
            onClick={() => setShowPrescriptionDetailsView(true)}
            className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600 font-extrabold text-xs">
                <span className="text-emerald-600 font-black">👨‍⚕️</span>
                <span>生活型態醫學認證專家 指派</span>
              </div>
              <span
                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                  completedPrescriptionItems === totalPrescriptionItems && totalPrescriptionItems > 0
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : completedPrescriptionItems > 0
                    ? 'text-orange-700 bg-orange-50 border-orange-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}
              >
                {completedPrescriptionItems === totalPrescriptionItems && totalPrescriptionItems > 0
                  ? '已全部完成'
                  : completedPrescriptionItems > 0
                  ? '進行中'
                  : '待執行'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-[1.0625rem] font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                  專家指派生活型態處方
                </h2>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-xs text-slate-500 font-medium">
                點擊查看處方明細
              </div>
            </div>

            {/* 任務執行進度統計 */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-700">今日處方總執行進度</span>
                <span className="text-orange-600 font-black">
                  已完成 {completedPrescriptionItems} / 共 {totalPrescriptionItems} 項
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-300 shadow-2xs"
                  style={{ width: `${prescriptionProgressPercent}%` }}
                />
              </div>

              {/* 各關注面向完成進度快速預覽標籤 */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60">
                {categoryBreakdown.map((cat) => (
                  <span
                    key={cat.key}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                      cat.completed === cat.total && cat.total > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>{cat.title}</span>
                    <span className="font-black text-slate-800">
                      {cat.completed}/{cat.total}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CARD 3: 衛教影片任務 */}
        <div
          onClick={onNavigateToTasks}
          className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">全銀運動 · 數位社會處方</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-[1.0625rem] font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                衛教影片任務
              </h2>
              <div className="text-xs text-slate-500 font-medium">
                本週已完成 {completedCount} / {weeklyTarget} 支影片
              </div>
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-full shrink-0">
              進行中
            </span>
          </div>

          {/* Progress bar */}
          <div className="pt-1">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="bg-[#f37021] h-full rounded-full transition-all duration-300"
                style={{ width: `${videoProgressRatio}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Modal: 尚未收到專家處方提醒彈窗 (重點 2) */}
      {showUnassignedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-5.5 space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">待專家指派處方</h3>
              </div>
              <button
                onClick={() => setShowUnassignedAlert(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-medium">
              <p className="text-slate-800 font-bold text-[13px]">
                您目前尚未收到專家的生活型態處方！您可以透過以下方式取得專屬處方：
              </p>

              {/* Prompt Option 1: 問卷燈填寫生活型態問卷 */}
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 space-y-1.5">
                <div className="font-black text-amber-950 flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>方式一：至「問卷燈」填寫生活型態問卷</span>
                </div>
                <p className="text-[11.5px] text-amber-900 leading-relaxed pl-5.5">
                  前往問卷燈填寫生活型態評估問卷，完成後專家團隊將依據您的健康需求開立專屬綠色生活處方。
                </p>
              </div>

              {/* Prompt Option 2: 專家頁找有在使用綠色處方燈照護的專家 */}
              <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 space-y-1.5">
                <div className="font-black text-emerald-950 flex items-center gap-1.5 text-xs">
                  <Stethoscope className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>方式二：至「專家頁」尋找綠色處方照護專家</span>
                </div>
                <p className="text-[11.5px] text-emerald-900 leading-relaxed pl-5.5">
                  前往專家頁尋找並加入有在使用「綠色處方燈」照護的健康專家或醫療團隊，由專業團隊為您進行全方位生活型態照護。
                </p>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowUnassignedAlert(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: 健康數據分析 Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-5 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">健康數據分析</h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-orange-600">
                  {isDoctorAssigned ? `${prescriptionProgressPercent}%` : '0%'}
                </div>
                <div className="text-[11px] font-bold text-orange-900 mt-0.5">
                  生活型態處方落實達成率
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between font-bold">
                  <span>🏃‍♂️ 處方任務落實 ({completedPrescriptionItems}/{totalPrescriptionItems})</span>
                  <span className="text-emerald-600">{prescriptionProgressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${prescriptionProgressPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold">
                  <span>🎬 衛教影片任務 ({completedCount}/{weeklyTarget})</span>
                  <span className="text-emerald-600">{videoProgressRatio}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${videoProgressRatio}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* Toast: 處方派送成功通知 */}
      {showDispatchSuccessToast && (
        <div className="fixed top-14 inset-x-4 z-50 flex justify-center animate-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 max-w-sm">
            <span className="text-xl">🎉</span>
            <div className="text-xs">
              <div className="font-black text-emerald-400">處方派送成功！</div>
              <div className="text-slate-300 font-medium mt-0.5">
                專家診所已從後台派送生活型態處方與衛教任務。
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
