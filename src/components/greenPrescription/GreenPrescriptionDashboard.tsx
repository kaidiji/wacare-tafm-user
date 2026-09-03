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
  Film,
} from 'lucide-react';
import { VideoTask } from './greenPrescriptionData';
import { LifestyleQuestionnaireRecord, ScreenId } from '../../types';
import {
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

export interface AssignedExpertPrescription {
  id: string;
  expertId: string;
  expertName: string;
  expertEmoji?: string;
  title?: string;
  assignedGoals: string[];
  prescriptionData?: Record<string, DoctorPrescriptionSection>;
}

interface Props {
  onBack: () => void;
  onNavigateToTasks: () => void;
  tasks: VideoTask[];
  assignedGoals?: string[];
  submittedGoals?: string[];
  isQuestionnaireSubmitted?: boolean;
  isPrescriptionDispatched?: boolean;
  onDispatchPrescription?: () => void;
  onNavigateToQuestionnaire?: (mode?: 'list' | 'form' | 'result') => void;
  onNavigateToExperts?: () => void;
  onNavigate?: (screen: ScreenId) => void;
  prescriptionData: Record<string, DoctorPrescriptionSection>;
  onTogglePrescriptionItem: (pillarKey: string, itemId: string) => void;
  assignedPrescriptions: AssignedExpertPrescription[];
  questionnaireHistory?: LifestyleQuestionnaireRecord[];
}

export const GreenPrescriptionDashboard: React.FC<Props> = ({
  onBack,
  onNavigateToTasks,
  tasks = [],
  assignedGoals = [],
  submittedGoals = [],
  isQuestionnaireSubmitted = false,
  isPrescriptionDispatched = false,
  onDispatchPrescription,
  onNavigateToQuestionnaire,
  onNavigateToExperts,
  onNavigate,
  prescriptionData,
  onTogglePrescriptionItem,
  assignedPrescriptions = [],
  questionnaireHistory = [],
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 7, 27)); // 2026年8月27日 (星期四)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showStatsDetailView, setShowStatsDetailView] = useState(false);
  const [showDispatchSuccessToast, setShowDispatchSuccessToast] = useState(false);
  
  // State for data analysis interval switcher (matching IMG_9026.PNG)
  const [analysisInterval, setAnalysisInterval] = useState<'week' | 'month' | 'quarter'>('week');

  // State for expanded week cards in data analysis view (matching IMG_9026.PNG)
  const [expandedWeekIds, setExpandedWeekIds] = useState<Record<string, boolean>>({
    w5: true, // Default expand current week
  });

  // State for raw data filter & detail modal (matching IMG_9040.PNG format)
  const [rawDataCategoryFilter, setRawDataCategoryFilter] = useState<string>('ALL');
  const [showRawFilterDropdown, setShowRawFilterDropdown] = useState<boolean>(false);
  const [selectedRawDataModalWeekIndex, setSelectedRawDataModalWeekIndex] = useState<number | null>(null);

  // Modal states for 數據執行紀錄清單 兩大項
  const [selectedLifestyleModalRecord, setSelectedLifestyleModalRecord] = useState<any | null>(null);
  const [selectedVideoModalRecord, setSelectedVideoModalRecord] = useState<any | null>(null);

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
  const [showQuestionnaireMenu, setShowQuestionnaireMenu] = useState(false);

  // State for displaying the full prescription details page
  const [showPrescriptionDetailsView, setShowPrescriptionDetailsView] = useState(false);
  const [selectedPrescriptionForDetail, setSelectedPrescriptionForDetail] = useState<AssignedExpertPrescription | null>(null);
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

  const activeAssignedPrescriptions = assignedPrescriptions;

  // Has the doctor assigned prescriptions
  const isDoctorAssigned = isPrescriptionDispatched || assignedGoals.length > 0 || assignedPrescriptions.length > 0;

  // Active goals list (defaults to user's submitted goals if assigned)
  const displayGoals = assignedGoals.length > 0 ? assignedGoals : submittedGoals;
  const activeGoalKeys = isDoctorAssigned
    ? displayGoals.length > 0
      ? displayGoals
      : ['運動習慣', '飲食習慣']
    : displayGoals.length > 0
    ? displayGoals
    : ['運動習慣', '飲食習慣'];

  const toggleItemCheck = (pillarKey: string, itemId: string) => {
    onTogglePrescriptionItem(pillarKey, itemId);
  };

  // Currently viewed detail prescription (for the detail view modal)
  const currentDetailPrescription = selectedPrescriptionForDetail || activeAssignedPrescriptions[0];
  const currentDetailGoals = currentDetailPrescription?.assignedGoals?.length > 0
    ? currentDetailPrescription.assignedGoals
    : ['運動習慣', '飲食習慣'];

  // Calculate total prescribed items and completed count for selected detail prescription
  let detailTotalItems = 0;
  let detailCompletedItems = 0;

  const detailCategoryBreakdown = currentDetailGoals.map((key) => {
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

  detailCategoryBreakdown.forEach((cat) => {
    detailTotalItems += cat.total;
    detailCompletedItems += cat.completed;
  });

  const detailProgressPercent =
    detailTotalItems > 0
      ? Math.round((detailCompletedItems / detailTotalItems) * 100)
      : 0;

  // Global counts fallback
  let totalPrescriptionItems = detailTotalItems;
  let completedPrescriptionItems = detailCompletedItems;
  let prescriptionProgressPercent = detailProgressPercent;

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
    try {
      const saved = window.localStorage.getItem('wacare_weekly_video_target');
      return saved ? parseInt(saved, 10) || 3 : 3;
    } catch {
      return 3;
    }
  });

  const completedTasks = tasks.filter((t) => t.completed);
  const completedCount = completedTasks.length;
  const videoProgressRatio =
    weeklyTarget > 0 ? Math.min(100, Math.round((completedCount / weeklyTarget) * 100)) : 0;

  const getWeekDayName = (d: Date) => {
    const names = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return names[d.getDay()];
  };

  const handleGoToQuestionnaire = (mode: 'list' | 'form' | 'result' = 'form') => {
    setShowUnassignedAlert(false);
    if (onNavigateToQuestionnaire) {
      onNavigateToQuestionnaire(mode);
    } else if (onNavigate) {
      onNavigate('QUESTIONNAIRE');
    }
  };

  const handleGoToExperts = () => {
    setShowUnassignedAlert(false);
    if (onNavigateToExperts) {
      onNavigateToExperts();
    } else if (onNavigate) {
      onNavigate('SCR-04');
    }
  };

  // -------------------------------------------------------------
  // VIEW: 綠色處方執行分析詳細頁面（沿用既有分析內容）
  // -------------------------------------------------------------
  if (showStatsDetailView) {
    const rawWeeklyRecordsList = [
      {
        id: 'w5',
        dateRange: '2026/08/25 至 2026/08/31',
        prescriptionCompleted: completedPrescriptionItems,
        prescriptionTotal: 10,
        videoCompleted: completedCount,
        videoTotal: weeklyTarget,
        percent: prescriptionProgressPercent,
        lifestyleTypes: [
          {
            typeName: '睡眠處方',
            completed: Math.min(3, completedPrescriptionItems),
            total: 3,
            isAchieved: Math.min(3, completedPrescriptionItems) >= 3,
            items: [
              { title: '每日 23:00 前固定入睡並紀錄睡眠品質', isAchieved: Math.min(3, completedPrescriptionItems) >= 3, countText: `${Math.min(3, completedPrescriptionItems)}/3 次` }
            ]
          },
          {
            typeName: '壓力管理處方',
            completed: Math.min(2, Math.max(0, completedPrescriptionItems - 3)),
            total: 2,
            isAchieved: Math.min(2, Math.max(0, completedPrescriptionItems - 3)) >= 2,
            items: [
              { title: '每日進行 10 分鐘腹式呼吸放鬆與正念冥想', isAchieved: Math.min(2, Math.max(0, completedPrescriptionItems - 3)) >= 2, countText: `${Math.min(2, Math.max(0, completedPrescriptionItems - 3))}/2 次` }
            ]
          },
          {
            typeName: '飲食習慣處方',
            completed: Math.min(2, Math.max(0, completedPrescriptionItems - 5)),
            total: 2,
            isAchieved: Math.min(2, Math.max(0, completedPrescriptionItems - 5)) >= 2,
            items: [
              { title: '每日攝取地中海飲食五蔬果，減少精緻糖', isAchieved: Math.min(2, Math.max(0, completedPrescriptionItems - 5)) >= 2, countText: `${Math.min(2, Math.max(0, completedPrescriptionItems - 5))}/2 次` }
            ]
          },
          {
            typeName: '運動處方',
            completed: Math.min(1, Math.max(0, completedPrescriptionItems - 7)),
            total: 1,
            isAchieved: Math.min(1, Math.max(0, completedPrescriptionItems - 7)) >= 1,
            items: [
              { title: '每週執行 3 次超慢跑或伸展運動 30 分鐘', isAchieved: Math.min(1, Math.max(0, completedPrescriptionItems - 7)) >= 1, countText: `${Math.min(1, Math.max(0, completedPrescriptionItems - 7))}/1 次` }
            ]
          },
          {
            typeName: '避免有害物質',
            completed: Math.min(1, Math.max(0, completedPrescriptionItems - 8)),
            total: 1,
            isAchieved: Math.min(1, Math.max(0, completedPrescriptionItems - 8)) >= 1,
            items: [
              { title: '避免高油高鹽及加工食品，戒菸限酒', isAchieved: Math.min(1, Math.max(0, completedPrescriptionItems - 8)) >= 1, countText: `${Math.min(1, Math.max(0, completedPrescriptionItems - 8))}/1 次` }
            ]
          },
          {
            typeName: '人際社交處方',
            completed: Math.min(1, Math.max(0, completedPrescriptionItems - 9)),
            total: 1,
            isAchieved: Math.min(1, Math.max(0, completedPrescriptionItems - 9)) >= 1,
            items: [
              { title: '每週參與社區據點活動或與親友通話互動', isAchieved: Math.min(1, Math.max(0, completedPrescriptionItems - 9)) >= 1, countText: `${Math.min(1, Math.max(0, completedPrescriptionItems - 9))}/1 次` }
            ]
          }
        ],
        videoList: [
          { id: 'v1', title: '生活型態醫學導論：6大支柱概述', duration: '8分鐘', watched: completedCount >= 1, watchedTime: completedCount >= 1 ? '2026-08-30 14:20' : '' },
          { id: 'v2', title: '腹式呼吸與抗壓冥想練習指南', duration: '12分鐘', watched: completedCount >= 2, watchedTime: completedCount >= 2 ? '2026-08-31 09:10' : '' },
          { id: 'v3', title: '地中海飲食外食選擇與擇食技巧', duration: '10分鐘', watched: completedCount >= 3, watchedTime: completedCount >= 3 ? '2026-08-31 16:00' : '' },
        ]
      },
      {
        id: 'w4',
        dateRange: '2026/08/18 至 2026/08/24',
        prescriptionCompleted: 10,
        prescriptionTotal: 10,
        videoCompleted: 3,
        videoTotal: 3,
        percent: 100,
        lifestyleTypes: [
          {
            typeName: '睡眠處方',
            completed: 3,
            total: 3,
            isAchieved: true,
            items: [{ title: '每日 23:00 前固定入睡並紀錄睡眠品質', isAchieved: true, countText: '3/3 次' }]
          },
          {
            typeName: '壓力管理處方',
            completed: 2,
            total: 2,
            isAchieved: true,
            items: [{ title: '每日進行 10 分鐘腹式呼吸放鬆與正念冥想', isAchieved: true, countText: '2/2 次' }]
          },
          {
            typeName: '飲食習慣處方',
            completed: 2,
            total: 2,
            isAchieved: true,
            items: [{ title: '每日攝取地中海飲食五蔬果，減少精緻糖', isAchieved: true, countText: '2/2 次' }]
          },
          {
            typeName: '運動處方',
            completed: 1,
            total: 1,
            isAchieved: true,
            items: [{ title: '每週執行 3 次超慢跑或伸展運動 30 分鐘', isAchieved: true, countText: '1/1 次' }]
          },
          {
            typeName: '避免有害物質',
            completed: 1,
            total: 1,
            isAchieved: true,
            items: [{ title: '避免高油高鹽及加工食品，戒菸限酒', isAchieved: true, countText: '1/1 次' }]
          },
          {
            typeName: '人際社交處方',
            completed: 1,
            total: 1,
            isAchieved: true,
            items: [{ title: '每週參與社區據點活動或與親友通話互動', isAchieved: true, countText: '1/1 次' }]
          }
        ],
        videoList: [
          { id: 'v1', title: '熟齡伸展與超慢跑指引', duration: '15分鐘', watched: true, watchedTime: '2026-08-20 09:15' },
          { id: 'v2', title: '睡眠衛生與高質量深眠法', duration: '10分鐘', watched: true, watchedTime: '2026-08-22 21:00' },
          { id: 'v3', title: '加工食品辨識與戒糖技巧', duration: '12分鐘', watched: true, watchedTime: '2026-08-23 16:30' },
        ]
      },
      {
        id: 'w3',
        dateRange: '2026/08/11 至 2026/08/17',
        prescriptionCompleted: 6,
        prescriptionTotal: 10,
        videoCompleted: 2,
        videoTotal: 3,
        percent: 60,
        lifestyleTypes: [
          {
            typeName: '睡眠處方',
            completed: 2,
            total: 3,
            isAchieved: false,
            items: [{ title: '每日 23:00 前固定入睡並紀錄睡眠品質', isAchieved: false, countText: '2/3 次' }]
          },
          {
            typeName: '壓力管理處方',
            completed: 1,
            total: 2,
            isAchieved: false,
            items: [{ title: '每日進行 10 分鐘腹式呼吸放鬆與正念冥想', isAchieved: false, countText: '1/2 次' }]
          },
          {
            typeName: '飲食習慣處方',
            completed: 2,
            total: 2,
            isAchieved: true,
            items: [{ title: '每日攝取地中海飲食五蔬果，減少精緻糖', isAchieved: true, countText: '2/2 次' }]
          },
          {
            typeName: '運動處方',
            completed: 1,
            total: 1,
            isAchieved: true,
            items: [{ title: '每週執行 3 次超慢跑或伸展運動 30 分鐘', isAchieved: true, countText: '1/1 次' }]
          },
          {
            typeName: '避免有害物質',
            completed: 0,
            total: 1,
            isAchieved: false,
            items: [{ title: '避免高油高鹽及加工食品，戒菸限酒', isAchieved: false, countText: '0/1 次' }]
          },
          {
            typeName: '人際社交處方',
            completed: 0,
            total: 1,
            isAchieved: false,
            items: [{ title: '每週參與社區據點活動或與親友通話互動', isAchieved: false, countText: '0/1 次' }]
          }
        ],
        videoList: [
          { id: 'v1', title: '社區健走與人際社交活動', duration: '10分鐘', watched: true, watchedTime: '2026-08-12 11:10' },
          { id: 'v2', title: '核心肌群自我檢測與訓練', duration: '15分鐘', watched: true, watchedTime: '2026-08-15 15:40' },
          { id: 'v3', title: '戒菸限酒與血管保健衛教', duration: '8分鐘', watched: false, watchedTime: '' },
        ]
      },
      {
        id: 'w2',
        dateRange: '2026/08/04 至 2026/08/10',
        prescriptionCompleted: 8,
        prescriptionTotal: 10,
        videoCompleted: 3,
        videoTotal: 3,
        percent: 80,
        lifestyleTypes: [
          {
            typeName: '睡眠處方',
            completed: 3,
            total: 3,
            isAchieved: true,
            items: [{ title: '每日 23:00 前固定入睡並紀錄睡眠品質', isAchieved: true, countText: '3/3 次' }]
          },
          {
            typeName: '壓力管理處方',
            completed: 2,
            total: 2,
            isAchieved: true,
            items: [{ title: '每日進行 10 分鐘腹式呼吸放鬆與正念冥想', isAchieved: true, countText: '2/2 次' }]
          },
          {
            typeName: '飲食習慣處方',
            completed: 1,
            total: 2,
            isAchieved: false,
            items: [{ title: '每日攝取地中海飲食五蔬果，減少精緻糖', isAchieved: false, countText: '1/2 次' }]
          },
          {
            typeName: '運動處方',
            completed: 1,
            total: 1,
            isAchieved: true,
            items: [{ title: '每週執行 3 次超慢跑或伸展運動 30 分鐘', isAchieved: true, countText: '1/1 次' }]
          },
          {
            typeName: '避免有害物質',
            completed: 1,
            total: 1,
            isAchieved: true,
            items: [{ title: '避免高油高鹽及加工食品，戒菸限酒', isAchieved: true, countText: '1/1 次' }]
          },
          {
            typeName: '人際社交處方',
            completed: 0,
            total: 1,
            isAchieved: false,
            items: [{ title: '每週參與社區據點活動或與親友通話互動', isAchieved: false, countText: '0/1 次' }]
          }
        ],
        videoList: [
          { id: 'v1', title: '睡眠障礙與日照規律調整', duration: '10分鐘', watched: true, watchedTime: '2026-08-05 20:10' },
          { id: 'v2', title: '正念呼吸紓壓導引', duration: '12分鐘', watched: true, watchedTime: '2026-08-07 10:30' },
          { id: 'v3', title: '低鈉高纖飲食健康烹調', duration: '15分鐘', watched: true, watchedTime: '2026-08-09 18:20' },
        ]
      },
      {
        id: 'w1',
        dateRange: '2026/07/28 至 2026/08/03',
        prescriptionCompleted: 4,
        prescriptionTotal: 10,
        videoCompleted: 1,
        videoTotal: 3,
        percent: 40,
        lifestyleTypes: [
          {
            typeName: '睡眠處方',
            completed: 2,
            total: 3,
            isAchieved: false,
            items: [{ title: '每日 23:00 前固定入睡並紀錄睡眠品質', isAchieved: false, countText: '2/3 次' }]
          },
          {
            typeName: '壓力管理處方',
            completed: 1,
            total: 2,
            isAchieved: false,
            items: [{ title: '每日進行 10 分鐘腹式呼吸放鬆與正念冥想', isAchieved: false, countText: '1/2 次' }]
          },
          {
            typeName: '飲食習慣處方',
            completed: 1,
            total: 2,
            isAchieved: false,
            items: [{ title: '每日攝取地中海飲食五蔬果，減少精緻糖', isAchieved: false, countText: '1/2 次' }]
          },
          {
            typeName: '運動處方',
            completed: 0,
            total: 1,
            isAchieved: false,
            items: [{ title: '每週執行 3 次超慢跑或伸展運動 30 分鐘', isAchieved: false, countText: '0/1 次' }]
          },
          {
            typeName: '避免有害物質',
            completed: 0,
            total: 1,
            isAchieved: false,
            items: [{ title: '避免高油高鹽及加工食品，戒菸限酒', isAchieved: false, countText: '0/1 次' }]
          },
          {
            typeName: '人際社交處方',
            completed: 0,
            total: 1,
            isAchieved: false,
            items: [{ title: '每週參與社區據點活動或與親友通話互動', isAchieved: false, countText: '0/1 次' }]
          }
        ],
        videoList: [
          { id: 'v1', title: '熟齡防跌肌力訓練入門', duration: '15分鐘', watched: true, watchedTime: '2026-07-30 16:00' },
          { id: 'v2', title: '認識生活型態醫學處方', duration: '10分鐘', watched: false, watchedTime: '' },
          { id: 'v3', title: '社交情緒平衡與壓力管理', duration: '12分鐘', watched: false, watchedTime: '' },
        ]
      }
    ];

    const monthlyRecordsList = [
      {
        id: 'm3',
        dateRange: '2026/08/01 至 2026/08/31',
        prescriptionCompleted: 28,
        prescriptionTotal: 40,
        videoCompleted: 5,
        videoTotal: 5,
        lifestyleTypes: [
          {
            typeName: '睡眠處方',
            completed: 12,
            total: 12,
            isAchieved: true,
            items: [{ title: '每日 23:00 前固定入睡並紀錄睡眠品質', isAchieved: true, countText: '12/12 次' }]
          },
          {
            typeName: '壓力管理處方',
            completed: 8,
            total: 8,
            isAchieved: true,
            items: [{ title: '每日進行 10 分鐘腹式呼吸放鬆與正念冥想', isAchieved: true, countText: '8/8 次' }]
          },
          {
            typeName: '飲食習慣處方',
            completed: 5,
            total: 8,
            isAchieved: false,
            items: [{ title: '每日攝取地中海飲食五蔬果，減少精緻糖', isAchieved: false, countText: '5/8 次' }]
          },
          {
            typeName: '運動處方',
            completed: 3,
            total: 4,
            isAchieved: false,
            items: [{ title: '每週執行 3 次超慢跑或伸展運動 30 分鐘', isAchieved: false, countText: '3/4 次' }]
          },
          {
            typeName: '避免有害物質',
            completed: 0,
            total: 4,
            isAchieved: false,
            items: [{ title: '避免高油高鹽及加工食品，戒菸限酒', isAchieved: false, countText: '0/4 次' }]
          },
          {
            typeName: '人際社交處方',
            completed: 0,
            total: 4,
            isAchieved: false,
            items: [{ title: '每週參與社區據點活動或與親友通話互動', isAchieved: false, countText: '0/4 次' }]
          }
        ],
        videoList: [
          { id: 'mv1', title: '生活型態醫學導論：6大支柱概述', duration: '8分鐘', watched: true, watchedTime: '2026-08-05 14:20' },
          { id: 'mv2', title: '熟齡伸展與超慢跑指引', duration: '15分鐘', watched: true, watchedTime: '2026-08-12 09:15' },
          { id: 'mv3', title: '睡眠衛生與高質量深眠法', duration: '10分鐘', watched: true, watchedTime: '2026-08-18 21:00' },
          { id: 'mv4', title: '腹式呼吸與抗壓冥想練習指南', duration: '12分鐘', watched: true, watchedTime: '2026-08-25 10:30' },
          { id: 'mv5', title: '地中海飲食外食選擇與擇食技巧', duration: '10分鐘', watched: true, watchedTime: '2026-08-30 16:00' },
        ]
      },
      {
        id: 'm2',
        dateRange: '2026/07/01 至 2026/07/31',
        prescriptionCompleted: 35,
        prescriptionTotal: 40,
        videoCompleted: 4,
        videoTotal: 5,
        lifestyleTypes: [
          {
            typeName: '睡眠處方',
            completed: 12,
            total: 12,
            isAchieved: true,
            items: [{ title: '每日 23:00 前固定入睡並紀錄睡眠品質', isAchieved: true, countText: '12/12 次' }]
          },
          {
            typeName: '壓力管理處方',
            completed: 8,
            total: 8,
            isAchieved: true,
            items: [{ title: '每日進行 10 分鐘腹式呼吸放鬆與正念冥想', isAchieved: true, countText: '8/8 次' }]
          },
          {
            typeName: '飲食習慣處方',
            completed: 7,
            total: 8,
            isAchieved: false,
            items: [{ title: '每日攝取地中海飲食五蔬果，減少精緻糖', isAchieved: false, countText: '7/8 次' }]
          },
          {
            typeName: '運動處方',
            completed: 4,
            total: 4,
            isAchieved: true,
            items: [{ title: '每週執行 3 次超慢跑或伸展運動 30 分鐘', isAchieved: true, countText: '4/4 次' }]
          },
          {
            typeName: '避免有害物質',
            completed: 2,
            total: 4,
            isAchieved: false,
            items: [{ title: '避免高油高鹽及加工食品，戒菸限酒', isAchieved: false, countText: '2/4 次' }]
          },
          {
            typeName: '人際社交處方',
            completed: 2,
            total: 4,
            isAchieved: false,
            items: [{ title: '每週參與社區據點活動或與親友通話互動', isAchieved: false, countText: '2/4 次' }]
          }
        ],
        videoList: [
          { id: 'mv6', title: '熟齡防跌肌力訓練入門', duration: '15分鐘', watched: true, watchedTime: '2026-07-08 16:00' },
          { id: 'mv7', title: '低鈉高纖飲食健康烹調', duration: '15分鐘', watched: true, watchedTime: '2026-07-15 18:20' },
          { id: 'mv8', title: '核心肌群自我檢測與訓練', duration: '15分鐘', watched: true, watchedTime: '2026-07-22 15:40' },
          { id: 'mv9', title: '社交情緒平衡與壓力管理', duration: '12分鐘', watched: true, watchedTime: '2026-07-28 11:10' },
        ]
      },
      {
        id: 'm1',
        dateRange: '2026/06/01 至 2026/06/30',
        prescriptionCompleted: 24,
        prescriptionTotal: 40,
        videoCompleted: 3,
        videoTotal: 5,
        lifestyleTypes: [
          {
            typeName: '睡眠處方',
            completed: 10,
            total: 12,
            isAchieved: false,
            items: [{ title: '每日 23:00 前固定入睡並紀錄睡眠品質', isAchieved: false, countText: '10/12 次' }]
          },
          {
            typeName: '壓力管理處方',
            completed: 6,
            total: 8,
            isAchieved: false,
            items: [{ title: '每日進行 10 分鐘腹式呼吸放鬆與正念冥想', isAchieved: false, countText: '6/8 次' }]
          },
          {
            typeName: '飲食習慣處方',
            completed: 4,
            total: 8,
            isAchieved: false,
            items: [{ title: '每日攝取地中海飲食五蔬果，減少精緻糖', isAchieved: false, countText: '4/8 次' }]
          },
          {
            typeName: '運動處方',
            completed: 2,
            total: 4,
            isAchieved: false,
            items: [{ title: '每週執行 3 次超慢跑或伸展運動 30 分鐘', isAchieved: false, countText: '2/4 次' }]
          },
          {
            typeName: '避免有害物質',
            completed: 1,
            total: 4,
            isAchieved: false,
            items: [{ title: '避免高油高鹽及加工食品，戒菸限酒', isAchieved: false, countText: '1/4 次' }]
          },
          {
            typeName: '人際社交處方',
            completed: 1,
            total: 4,
            isAchieved: false,
            items: [{ title: '每週參與社區據點活動或與親友通話互動', isAchieved: false, countText: '1/4 次' }]
          }
        ],
        videoList: [
          { id: 'mv10', title: '認識生活型態醫學處方', duration: '10分鐘', watched: true, watchedTime: '2026-06-10 10:00' },
          { id: 'mv11', title: '戒菸限酒與血管保健衛教', duration: '8分鐘', watched: true, watchedTime: '2026-06-18 14:30' },
          { id: 'mv12', title: '睡眠障礙與日照規律調整', duration: '10分鐘', watched: true, watchedTime: '2026-06-25 20:10' },
        ]
      }
    ];

    const quarterlyRecordsList = [
      {
        id: 'q3',
        dateRange: '2026/06/01 至 2026/08/31',
        prescriptionCompleted: 87,
        prescriptionTotal: 120,
        videoCompleted: 6,
        videoTotal: 6,
        lifestyleTypes: [
          {
            typeName: '睡眠處方',
            completed: 34,
            total: 36,
            isAchieved: false,
            items: [{ title: '每日 23:00 前固定入睡並紀錄睡眠品質', isAchieved: false, countText: '34/36 次' }]
          },
          {
            typeName: '壓力管理處方',
            completed: 22,
            total: 24,
            isAchieved: false,
            items: [{ title: '每日進行 10 分鐘腹式呼吸放鬆與正念冥想', isAchieved: false, countText: '22/24 次' }]
          },
          {
            typeName: '飲食習慣處方',
            completed: 16,
            total: 24,
            isAchieved: false,
            items: [{ title: '每日攝取地中海飲食五蔬果，減少精緻糖', isAchieved: false, countText: '16/24 次' }]
          },
          {
            typeName: '運動處方',
            completed: 9,
            total: 12,
            isAchieved: false,
            items: [{ title: '每週執行 3 次超慢跑或伸展運動 30 分鐘', isAchieved: false, countText: '9/12 次' }]
          },
          {
            typeName: '避免有害物質',
            completed: 3,
            total: 12,
            isAchieved: false,
            items: [{ title: '避免高油高鹽及加工食品，戒菸限酒', isAchieved: false, countText: '3/12 次' }]
          },
          {
            typeName: '人際社交處方',
            completed: 3,
            total: 12,
            isAchieved: false,
            items: [{ title: '每週參與社區據點活動或與親友通話互動', isAchieved: false, countText: '3/12 次' }]
          }
        ],
        videoList: [
          { id: 'qv1', title: '生活型態醫學導論：6大支柱概述', duration: '8分鐘', watched: true, watchedTime: '2026-08-05 14:20' },
          { id: 'qv2', title: '熟齡伸展與超慢跑指引', duration: '15分鐘', watched: true, watchedTime: '2026-08-12 09:15' },
          { id: 'qv3', title: '睡眠衛生與高質量深眠法', duration: '10分鐘', watched: true, watchedTime: '2026-08-18 21:00' },
          { id: 'qv4', title: '熟齡防跌肌力訓練入門', duration: '15分鐘', watched: true, watchedTime: '2026-07-08 16:00' },
          { id: 'qv5', title: '低鈉高纖飲食健康烹調', duration: '15分鐘', watched: true, watchedTime: '2026-07-15 18:20' },
          { id: 'qv6', title: '認識生活型態醫學處方', duration: '10分鐘', watched: true, watchedTime: '2026-06-10 10:00' },
        ]
      },
      {
        id: 'q2',
        dateRange: '2026/03/01 至 2026/05/31',
        prescriptionCompleted: 95,
        prescriptionTotal: 120,
        videoCompleted: 3,
        videoTotal: 3,
        lifestyleTypes: [
          {
            typeName: '睡眠處方',
            completed: 36,
            total: 36,
            isAchieved: true,
            items: [{ title: '每日 23:00 前固定入睡並紀錄睡眠品質', isAchieved: true, countText: '36/36 次' }]
          },
          {
            typeName: '壓力管理處方',
            completed: 24,
            total: 24,
            isAchieved: true,
            items: [{ title: '每日進行 10 分鐘腹式呼吸放鬆與正念冥想', isAchieved: true, countText: '24/24 次' }]
          },
          {
            typeName: '飲食習慣處方',
            completed: 18,
            total: 24,
            isAchieved: false,
            items: [{ title: '每日攝取地中海飲食五蔬果，減少精緻糖', isAchieved: false, countText: '18/24 次' }]
          },
          {
            typeName: '運動處方',
            completed: 10,
            total: 12,
            isAchieved: false,
            items: [{ title: '每週執行 3 次超慢跑或伸展運動 30 分鐘', isAchieved: false, countText: '10/12 次' }]
          },
          {
            typeName: '避免有害物質',
            completed: 4,
            total: 12,
            isAchieved: false,
            items: [{ title: '避免高油高鹽及加工食品，戒菸限酒', isAchieved: false, countText: '4/12 次' }]
          },
          {
            typeName: '人際社交處方',
            completed: 3,
            total: 12,
            isAchieved: false,
            items: [{ title: '每週參與社區據點活動或與親友通話互動', isAchieved: false, countText: '3/12 次' }]
          }
        ],
        videoList: [
          { id: 'qv7', title: '熟齡心血管健康維護指南', duration: '12分鐘', watched: true, watchedTime: '2026-03-15 10:00' },
          { id: 'qv8', title: '有氧運動與血糖控制關係', duration: '15分鐘', watched: true, watchedTime: '2026-04-10 14:00' },
          { id: 'qv9', title: '高纖地中海料理食譜示範', duration: '18分鐘', watched: true, watchedTime: '2026-05-20 16:30' },
        ]
      }
    ];

    const activeRecordsList = analysisInterval === 'month' 
      ? monthlyRecordsList 
      : analysisInterval === 'quarter' 
      ? quarterlyRecordsList 
      : rawWeeklyRecordsList;

    return (
      <div className="flex flex-col h-full bg-[#f8f9fa] font-sans antialiased text-slate-900 overflow-hidden animate-in fade-in duration-200">
        
        {/* 1. Top Header */}
        <header className="px-4 py-3 bg-white border-b border-slate-100 shrink-0 flex items-center justify-between min-h-[3.25rem] relative z-20">
          <button
            onClick={() => setShowStatsDetailView(false)}
            className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 flex items-center"
            aria-label="返回"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Title Stack: 綠色處方 / 數據分析 */}
          <div className="text-center">
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
              綠色處方
            </h1>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">
              執行分析
            </p>
          </div>

          <div className="w-9 h-9" />
        </header>

        {/* 2. Main Body */}
        <div className="flex-1 overflow-y-auto min-h-0 touch-pan-y bg-[#f8f9fa] p-4 space-y-4 pb-12">
          
          {/* Section: 選擇分析區間 (Pills: 周分析 / 月分析 / 季分析) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              選擇分析區間
            </h2>

            {/* Interval Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAnalysisInterval('week')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  analysisInterval === 'week'
                    ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-transparent'
                }`}
              >
                周分析
              </button>
              <button
                onClick={() => setAnalysisInterval('month')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  analysisInterval === 'month'
                    ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-transparent'
                }`}
              >
                月分析
              </button>
              <button
                onClick={() => setAnalysisInterval('quarter')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  analysisInterval === 'quarter'
                    ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-transparent'
                }`}
              >
                季分析
              </button>
            </div>

            {/* Selected Date Range Text */}
            <div className="pt-1">
              <div className="text-base font-extrabold text-slate-900 tracking-tight">
                {analysisInterval === 'week' && '2026/08/25 至 2026/08/31'}
                {analysisInterval === 'month' && '2026/08/01 至 2026/08/31'}
                {analysisInterval === 'quarter' && '2026/06/01 至 2026/08/31'}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {analysisInterval === 'week' && '共7天'}
                {analysisInterval === 'month' && '共31天'}
                {analysisInterval === 'quarter' && '共92天'}
              </div>
            </div>
          </div>

          {/* Section: 折線圖趨勢分析 */}
          {(() => {
            const chartData = analysisInterval === 'month' ? [
              { label: '6月', val: 60, sub: '24/40項' },
              { label: '7月', val: 88, sub: '35/40項' },
              { label: '8月', val: 70, sub: '28/40項' },
            ] : analysisInterval === 'quarter' ? [
              { label: '2026 Q1', val: 65, sub: '78/120項' },
              { label: '2026 Q2', val: 79, sub: '95/120項' },
              { label: '2026 Q3', val: 73, sub: '87/120項' },
            ] : [
              { label: '07/28', val: 40, sub: '4/10項' },
              { label: '08/04', val: 80, sub: '8/10項' },
              { label: '08/11', val: 60, sub: '6/10項' },
              { label: '08/18', val: 100, sub: '10/10項' },
              { label: '08/25', val: Math.round((completedPrescriptionItems / 10) * 100), sub: `${completedPrescriptionItems}/10項` },
            ];

            const n = chartData.length;
            const width = 320;
            const height = 150;
            const paddingLeft = 35;
            const paddingRight = 35;
            const paddingTop = 30;
            const paddingBottom = 30;
            const plotWidth = width - paddingLeft - paddingRight;
            const plotHeight = height - paddingTop - paddingBottom;

            const points = chartData.map((d, i) => {
              const x = paddingLeft + (n > 1 ? i * (plotWidth / (n - 1)) : plotWidth / 2);
              const y = (height - paddingBottom) - (d.val / 100) * plotHeight;
              return { ...d, x, y };
            });

            const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
            const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} Z`;

            return (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                      <TrendingUp className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        處方達成率趨勢
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500">
                        {analysisInterval === 'week' && '近 5 週達成變化折線圖'}
                        {analysisInterval === 'month' && '近 3 個月達成變化折線圖'}
                        {analysisInterval === 'quarter' && '近 3 季度達成變化折線圖'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-extrabold text-amber-900">達成率 (%)</span>
                  </div>
                </div>

                {/* Chart SVG */}
                <div className="pt-2 flex justify-center">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full overflow-visible">
                    <defs>
                      <linearGradient id="amberTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0, 50, 100].map((gridVal) => {
                      const gy = (height - paddingBottom) - (gridVal / 100) * plotHeight;
                      return (
                        <g key={gridVal}>
                          <line
                            x1={paddingLeft - 8}
                            y1={gy}
                            x2={width - paddingRight + 8}
                            y2={gy}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                          <text
                            x={paddingLeft - 12}
                            y={gy + 3}
                            fontSize="9"
                            fontWeight="600"
                            fill="#94a3b8"
                            textAnchor="end"
                          >
                            {gridVal}%
                          </text>
                        </g>
                      );
                    })}

                    {/* Area fill */}
                    <path d={areaD} fill="url(#amberTrendGradient)" />

                    {/* Line path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Points & Value labels */}
                    {points.map((p, idx) => (
                      <g key={idx} className="transition-all">
                        {/* Outer glow ring */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="6"
                          fill="#ffffff"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                        />
                        {/* Center dot */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="2.5"
                          fill="#d97706"
                        />

                        {/* Top Value Label */}
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          fontSize="10.5"
                          fontWeight="800"
                          fill="#b45309"
                        >
                          {p.val}%
                        </text>

                        {/* X Axis Label */}
                        <text
                          x={p.x}
                          y={height - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill="#64748b"
                        >
                          {p.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            );
          })()}

          {/* Section: 數據執行紀錄清單 (含兩大項：生活型態處方 + 衛教影片任務) */}
          <div className="space-y-4 pt-1">
            <div className="text-xs font-extrabold text-slate-500 px-1">
              數據執行紀錄清單
            </div>

            {/* 大項 1: 生活型態處方 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden p-4 space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold shrink-0">
                  <ListTodo className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">生活型態處方</h3>
                  <p className="text-[11px] font-medium text-slate-500">點選右側箭頭開啟彈窗查看各類型達成狀態</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {activeRecordsList.map((row) => (
                  <div
                    key={`lifestyle-${row.id}`}
                    onClick={() => setSelectedLifestyleModalRecord(row)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-amber-50/40 rounded-xl px-2 transition-colors group select-none"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-slate-900">
                        {row.dateRange}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">
                        達成狀態：
                        <span className={row.prescriptionCompleted < row.prescriptionTotal ? 'text-amber-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                          {row.prescriptionCompleted} / {row.prescriptionTotal} 項
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-[#f37021] transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#f37021] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 大項 2: 衛教影片任務 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden p-4 space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0">
                  <Film className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">衛教影片任務</h3>
                  <p className="text-[11px] font-medium text-slate-500">點選右側箭頭開啟彈窗查看已觀看的影片紀錄</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {activeRecordsList.map((row) => (
                  <div
                    key={`video-${row.id}`}
                    onClick={() => setSelectedVideoModalRecord(row)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-blue-50/40 rounded-xl px-2 transition-colors group select-none"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-slate-900">
                        {row.dateRange}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">
                        已觀看影片：
                        <span className="text-blue-600 font-extrabold ml-1">
                          {row.videoList ? row.videoList.filter((vid: any) => vid.watched).length : row.videoCompleted} 支
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 彈窗 1: 生活型態處方彈窗 (依各類型呈現是否有達成，簡潔不呈現過多資訊與補卡) */}
        {selectedLifestyleModalRecord && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-5 space-y-4 border border-slate-100">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    生活型態處方紀錄
                  </h3>
                  <p className="text-xs font-extrabold text-[#f37021] mt-0.5">
                    {selectedLifestyleModalRecord.dateRange}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLifestyleModalRecord(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Types & Prescription Status */}
              {analysisInterval === 'month' || analysisInterval === 'quarter' ? (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="text-xs font-extrabold text-slate-500 px-0.5">
                    {analysisInterval === 'month' ? '月度處方各類型達成率' : '季度處方各類型達成率'}
                  </div>

                  {selectedLifestyleModalRecord.lifestyleTypes.map((typeGroup: any) => {
                    const rate = typeGroup.total > 0 ? Math.round((typeGroup.completed / typeGroup.total) * 100) : 0;
                    return (
                      <div
                        key={typeGroup.typeName}
                        className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2.5"
                      >
                        {/* Category Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800">
                            {typeGroup.typeName}
                          </span>
                          <span
                            className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                              rate >= 100
                                ? 'bg-emerald-100 text-emerald-800'
                                : rate >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            達成率 {rate}% ({typeGroup.completed}/{typeGroup.total}次)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              rate >= 100
                                ? 'bg-emerald-500'
                                : rate >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, rate)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {selectedLifestyleModalRecord.lifestyleTypes.map((typeGroup: any) => (
                    <div
                      key={typeGroup.typeName}
                      className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          {typeGroup.typeName}
                          <span className="text-[11px] font-bold text-slate-500">
                            ({typeGroup.completed}/{typeGroup.total}次)
                          </span>
                        </span>
                        <span
                          className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                            typeGroup.isAchieved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {typeGroup.isAchieved ? '✅ 已達成' : '❌ 未達成'}
                        </span>
                      </div>

                      {/* Prescriptions List under this category */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                        {typeGroup.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-start justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="text-xs text-slate-700 font-medium leading-relaxed">
                                {item.title}
                              </div>
                              {item.countText && (
                                <div className="text-[10.5px] font-bold text-slate-400">
                                  進度：{item.countText}
                                </div>
                              )}
                            </div>
                            <span
                              className={`text-[10.5px] font-bold shrink-0 px-1.5 py-0.2 rounded ${
                                item.isAchieved
                                  ? 'text-emerald-700 bg-emerald-50'
                                  : 'text-slate-500 bg-slate-100'
                              }`}
                            >
                              {item.isAchieved ? '已達成' : '未達成'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedLifestyleModalRecord(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-slate-800 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        )}

        {/* 彈窗 2: 衛教影片任務彈窗 (直接呈現有看哪幾部影片) */}
        {selectedVideoModalRecord && (() => {
          const watchedVideos = selectedVideoModalRecord.videoList?.filter((vid: any) => vid.watched) || [];
          
          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-5 space-y-4 border border-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      衛教影片觀看紀錄
                    </h3>
                    <p className="text-xs font-extrabold text-blue-600 mt-0.5">
                      {selectedVideoModalRecord.dateRange}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedVideoModalRecord(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Video List */}
                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="text-xs font-extrabold text-slate-500 px-0.5">
                    已觀看影片 ({watchedVideos.length} 支)
                  </div>

                  {watchedVideos.length > 0 ? (
                    watchedVideos.map((vid: any, idx: number) => (
                      <div
                        key={vid.id || idx}
                        className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 flex items-start justify-between gap-2.5 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">
                              {idx + 1}. {vid.title}
                            </span>
                          </div>
                          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                            <span>長度：{vid.duration}</span>
                            {vid.watchedTime && <span>• 觀看時間：{vid.watchedTime}</span>}
                          </div>
                        </div>

                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md shrink-0 bg-emerald-100 text-emerald-800">
                          ✅ 已觀看
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Film className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-extrabold text-slate-500">該期間尚無衛教影片觀看紀錄</p>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedVideoModalRecord(null)}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  關閉
                </button>
              </div>
            </div>
          );
        })()}

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
            {currentDetailPrescription?.expertName || '示範診所'}指派處方明細
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
                {currentDetailPrescription?.expertEmoji || '👨‍⚕️'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-600">
                  開立專家：{currentDetailPrescription?.expertName || '示範診所'}
                </div>
                <div className="text-sm font-black text-slate-900">
                  {currentDetailPrescription?.expertName || '示範診所'}個人化生活型態指派處方
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-orange-600">
                {detailCompletedItems}
              </span>
              <span className="text-xs font-bold text-slate-500">
                /{detailTotalItems} 項完成
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-600">
              <span>今日處方執行達成率</span>
              <span className="text-orange-600 font-extrabold">{detailProgressPercent}%</span>
            </div>
            <div className="w-full bg-orange-200/60 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-orange-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${detailProgressPercent}%` }}
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
                {detailCompletedItems}/{detailTotalItems}
              </span>
            </button>

            {/* Individual Category Tabs */}
            {currentDetailGoals.map((key) => {
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
        <div className="flex-1 overflow-y-auto min-h-0 touch-pan-y p-4 space-y-3.5 pb-12">
          {currentDetailGoals
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
                本項目為{currentDetailPrescription?.expertName || '示範診所'}開立之處方指引，請配合日常作息確實落實執行。
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
      <div className="flex-1 overflow-y-auto min-h-0 touch-pan-y p-4 space-y-3.5 pb-12">
        
        {/* CARD 1: 執行狀況摘要（直接沿用既有處方與影片進度計算） */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-slate-500">整體執行進度</p><h2 className="text-base font-black text-slate-900">綠色處方執行摘要</h2></div><button type="button" onClick={() => setShowStatsDetailView(true)} className="flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-black text-orange-700 hover:bg-orange-100">查看數據分析<ChevronRight className="w-4 h-4" /></button></div>
          <div className="grid grid-cols-2 gap-2.5"><div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3"><p className="text-[11px] font-bold text-slate-500">生活型態處方</p><p className="mt-1 text-lg font-black text-emerald-700">{completedPrescriptionItems} / {totalPrescriptionItems}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${prescriptionProgressPercent}%` }} /></div></div><div className="rounded-xl border border-orange-100 bg-orange-50/70 p-3"><p className="text-[11px] font-bold text-slate-500">衛教影片（每週目標）</p><p className="mt-1 text-lg font-black text-orange-700">{completedCount} / {weeklyTarget}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${videoProgressRatio}%` }} /></div></div></div>
        </div>

        {/* CARD 2: 專家指派生活型態處方 */}
        {!isDoctorAssigned ? (
          isQuestionnaireSubmitted ? (
            /* 狀況 A-1：問卷已填寫，等待專家診所從後台派送處方 */
            <div className="bg-white rounded-2xl border border-amber-300 p-4.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600 font-extrabold text-xs">
                  <span className="text-amber-600">⏳</span>
                  <span>示範診所 指派</span>
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
                  <span>示範診所 指派</span>
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
          /* 狀況 B：專家已指派處方（支援多個不同專家獨立顯示卡片） */
          <div className="space-y-3.5">
            {activeAssignedPrescriptions.map((presItem) => {
              const cGoals = presItem.assignedGoals.length > 0 ? presItem.assignedGoals : ['運動習慣', '飲食習慣'];
              let cCompleted = 0;
              let cTotal = 0;
              const cBreakdown: { key: string; title: string; completed: number; total: number }[] = [];

              cGoals.forEach((gk) => {
                const sec = getDoctorPrescriptionSection(gk, prescriptionData);
                if (sec) {
                  const cc = sec.items.filter((it) => it.completed).length;
                  const tt = sec.items.length;
                  cCompleted += cc;
                  cTotal += tt;
                  cBreakdown.push({ key: sec.id, title: sec.categoryTitle, completed: cc, total: tt });
                }
              });
              const cPercent = cTotal > 0 ? Math.round((cCompleted / cTotal) * 100) : 0;

              return (
                <div
                  key={presItem.id}
                  onClick={() => {
                    setSelectedPrescriptionForDetail(presItem);
                    setSelectedCategoryTab('ALL');
                    setShowPrescriptionDetailsView(true);
                  }}
                  className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-600 font-extrabold text-xs">
                      <span className="text-emerald-600 font-black">{presItem.expertEmoji || '👨‍⚕️'}</span>
                      <span>{presItem.expertName} 指派</span>
                    </div>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                        cCompleted === cTotal && cTotal > 0
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : cCompleted > 0
                          ? 'text-orange-700 bg-orange-50 border-orange-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {cCompleted === cTotal && cTotal > 0
                        ? '已全部完成'
                        : cCompleted > 0
                        ? '進行中'
                        : '待執行'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[1.0625rem] font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                        {presItem.expertName}指派生活型態處方
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
                        已完成 {cCompleted} / 共 {cTotal} 項
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-300 shadow-2xs"
                        style={{ width: `${cPercent}%` }}
                      />
                    </div>

                    {/* 各關注面向完成進度快速預覽標籤 */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60">
                      {cBreakdown.map((cat) => (
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
              );
            })}
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

        {/* CARD 4: 僅導向既有問卷、專家與活動畫面 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs space-y-3">
          <h2 className="text-base font-black text-slate-900">更多綠色處方服務</h2>
          <div className="space-y-2">
            <button type="button" onClick={() => setShowQuestionnaireMenu(true)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50"><span className="flex items-center gap-2 text-sm font-black"><FileText className="w-4 h-4 text-orange-600" />生活型態問卷</span><span className="flex items-center gap-2"><span className="text-[11px] font-bold text-slate-400">{questionnaireHistory.length} 筆紀錄</span><ChevronRight className="w-4 h-4 text-slate-400" /></span></button>
            <button type="button" onClick={handleGoToExperts} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50"><span className="flex items-center gap-2 text-sm font-black"><Stethoscope className="w-4 h-4 text-emerald-600" />尋找綠色處方專家</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
          </div>
        </div>

      </div>

      {showQuestionnaireMenu && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55" onClick={() => setShowQuestionnaireMenu(false)}><div className="w-full max-w-md rounded-t-3xl bg-white px-5 pb-7 pt-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="relative mb-4 flex min-h-10 items-center justify-center"><button type="button" onClick={() => setShowQuestionnaireMenu(false)} className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"><X className="h-6 w-6" /></button><h3 className="text-lg font-black text-slate-900">生活型態問卷</h3></div><div className="divide-y divide-slate-100"><button type="button" onClick={() => { setShowQuestionnaireMenu(false); handleGoToQuestionnaire('form'); }} className="flex w-full items-center justify-between py-5 text-left"><span className="flex items-center gap-3 text-base font-black text-slate-900"><FileText className="h-6 w-6 text-orange-600" />填寫生活型態問卷</span><ChevronRight className="h-5 w-5 text-slate-400" /></button><button type="button" onClick={() => { setShowQuestionnaireMenu(false); handleGoToQuestionnaire('list'); }} className="flex w-full items-center justify-between py-5 text-left"><span className="flex items-center gap-3 text-base font-black text-slate-900"><CheckCircle2 className="h-6 w-6 text-emerald-600" />已填寫清單</span><span className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">{questionnaireHistory.length}</span><ChevronRight className="h-5 w-5 text-slate-400" /></span></button></div></div></div>}

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

      {/* Modal: 綠色處方執行分析 */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-5 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">綠色處方執行分析</h3>
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
