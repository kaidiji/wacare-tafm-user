import React, { useState, useRef, useMemo, useEffect } from 'react';
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
import { LifestyleQuestionnaireRecord, QuestionnaireView, ScreenId, VideoViewRecord } from '../../types';
import {
  DoctorPrescriptionSection,
  getDoctorPrescriptionSection,
  normalizePillarKey,
} from './doctorPrescriptionsData';
import { calculateGreenPrescriptionProgress } from './greenPrescriptionProgress';

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
  onNavigateToQuestionnaire?: (mode?: QuestionnaireView) => void;
  onNavigateToExperts?: () => void;
  onNavigate?: (screen: ScreenId) => void;
  prescriptionData: Record<string, DoctorPrescriptionSection>;
  onTogglePrescriptionItem: (pillarKey: string, itemId: string) => void;
  assignedPrescriptions: AssignedExpertPrescription[];
  questionnaireHistory?: LifestyleQuestionnaireRecord[];
  selectedDate?: Date;
  onSelectedDateChange?: (date: Date) => void;
  videoViewHistory?: VideoViewRecord[];
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
  selectedDate = new Date(),
  onSelectedDateChange,
  videoViewHistory = [],
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showStatsDetailView, setShowStatsDetailView] = useState(false);
  const [showDispatchSuccessToast, setShowDispatchSuccessToast] = useState(false);
  
  // State for data analysis interval switcher (matching IMG_9026.PNG)
  const [analysisInterval, setAnalysisInterval] = useState<'week' | 'month' | 'quarter'>('week');
  const trendCarouselRef = useRef<HTMLDivElement>(null);
  const [activeTrendIndex, setActiveTrendIndex] = useState(0);

  // State for expanded week cards in data analysis view (matching IMG_9026.PNG)
  const [expandedWeekIds, setExpandedWeekIds] = useState<Record<string, boolean>>({
    w5: true, // Default expand current week
  });

  // State for raw data filter & detail modal (matching IMG_9040.PNG format)
  const [rawDataCategoryFilter, setRawDataCategoryFilter] = useState<string>('ALL');
  const [showRawFilterDropdown, setShowRawFilterDropdown] = useState<boolean>(false);
  const [selectedRawDataModalWeekIndex, setSelectedRawDataModalWeekIndex] = useState<number | null>(null);

  // Modal states for 數據執行紀錄清單 兩大項
  const [selectedLifestyleRecord, setSelectedLifestyleRecord] = useState<any | null>(null);
  const [lifestyleRecordFilter, setLifestyleRecordFilter] = useState<'all' | 'achieved' | 'incomplete'>('all');
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

  useEffect(() => {
    if (isPrescriptionDispatched) {
      setShowUnassignedAlert(false);
      setSelectedCategoryTab('ALL');
    }
  }, [isPrescriptionDispatched]);

  // State for displaying the full prescription details page
  const [showPrescriptionDetailsView, setShowPrescriptionDetailsView] = useState(false);
  const [selectedPrescriptionForDetail, setSelectedPrescriptionForDetail] = useState<AssignedExpertPrescription | null>(null);
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
  const hasAssignedPrescription = isPrescriptionDispatched && Object.keys(prescriptionData).length > 0 && assignedPrescriptions.length > 0;
  const isDoctorAssigned = hasAssignedPrescription;
  const hasQuestionnaire = questionnaireHistory.length > 0;
  const greenPrescriptionProgress = calculateGreenPrescriptionProgress({
    isPrescriptionDispatched,
    doctorPrescriptions: prescriptionData,
    videoTasks: tasks,
  });

  // Active goals list (defaults to user's submitted goals if assigned)
  const displayGoals = assignedGoals.length > 0 ? assignedGoals : submittedGoals;
  const activeGoalKeys = isDoctorAssigned ? displayGoals : [];

  const toggleItemCheck = (pillarKey: string, itemId: string) => {
    onTogglePrescriptionItem(pillarKey, itemId);
  };

  // Currently viewed detail prescription (for the detail view modal)
  const currentDetailPrescription = selectedPrescriptionForDetail || activeAssignedPrescriptions[0];
  const currentDetailGoals = currentDetailPrescription?.assignedGoals?.length > 0
    ? currentDetailPrescription.assignedGoals
    : [];

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

  const assignedSections = Object.values(prescriptionData) as DoctorPrescriptionSection[];
  const assignedPrescriptionItems = Array.from(new Map(
    assignedSections.flatMap((section) => section.items).map((item) => [item.id, item])
  ).values());
  const prescriptionCompletionRate = assignedPrescriptionItems.length > 0
    ? Math.min(100, Math.max(0, Math.round((assignedPrescriptionItems.filter((item) => item.completed).length / assignedPrescriptionItems.length) * 100)))
    : 0;
  const categoryStats = assignedSections.map((section) => ({
    id: section.id,
    title: section.categoryTitle,
    total: section.items.length,
    completed: section.items.filter((item) => item.completed).length,
    percentage: section.items.length > 0 ? Math.round((section.items.filter((item) => item.completed).length / section.items.length) * 100) : 0,
  }));

  // Global counts fallback
  let totalPrescriptionItems = greenPrescriptionProgress.prescriptionTotal;
  let completedPrescriptionItems = greenPrescriptionProgress.prescriptionCompleted;
  let prescriptionProgressPercent = greenPrescriptionProgress.prescriptionTotal > 0
    ? Math.round((greenPrescriptionProgress.prescriptionCompleted / greenPrescriptionProgress.prescriptionTotal) * 100)
    : 0;

  // Weekly target & completed count for videos
  const [weeklyTarget] = useState<number>(() => {
    try {
      const saved = window.localStorage.getItem('wacare_weekly_video_target');
      return saved ? parseInt(saved, 10) || 3 : 3;
    } catch {
      return 3;
    }
  });

  const completedCount = new Set(tasks.filter((t) => t.completed).map((t) => t.id)).size;
  const videoProgressRatio =
    weeklyTarget > 0 ? Math.min(100, Math.round((completedCount / weeklyTarget) * 100)) : 0;

  const getWeekDayName = (d: Date) => {
    const names = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return names[d.getDay()];
  };

  const handleGoToQuestionnaire = (mode: QuestionnaireView = 'form') => {
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

    const periodRange = (() => {
      const anchor = new Date(selectedDate);
      if (analysisInterval === 'month') {
        return { start: new Date(anchor.getFullYear(), anchor.getMonth(), 1), end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0) };
      }
      if (analysisInterval === 'quarter') {
        const quarterMonth = Math.floor(anchor.getMonth() / 3) * 3;
        return { start: new Date(anchor.getFullYear(), quarterMonth, 1), end: new Date(anchor.getFullYear(), quarterMonth + 3, 0) };
      }
      const start = new Date(anchor);
      start.setDate(anchor.getDate() - anchor.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    })();
    const formatRange = (start: Date, end: Date) => `${start.getFullYear()}/${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')} 至 ${end.getFullYear()}/${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}`;
    const liveAnalysisRecords = hasAssignedPrescription ? [{
      id: `current-${analysisInterval}`,
      dateRange: formatRange(periodRange.start, periodRange.end),
      prescriptionCompleted: assignedPrescriptionItems.filter((item) => item.completed).length,
      prescriptionTotal: assignedPrescriptionItems.length,
      videoCompleted: completedCount,
      videoTotal: weeklyTarget,
      percent: prescriptionCompletionRate,
      lifestyleTypes: categoryStats.map((category) => ({
        typeName: category.title,
        completed: category.completed,
        total: category.total,
        isAchieved: category.completed === category.total && category.total > 0,
        items: assignedSections
          .find((section) => section.categoryTitle === category.title)?.items
          .map((item) => ({ title: item.title, isAchieved: item.completed, countText: item.completed ? '已完成' : '未完成' })) ?? [],
      })),
      videoList: tasks.map((task) => ({ id: task.id, title: task.title, duration: '', watched: task.completed, watchedTime: '' })),
    }] : [];
    const activeRecordsList = liveAnalysisRecords;

    return (
      <div data-analysis-screen-visible="true" data-analysis-prescription-dispatched={String(isPrescriptionDispatched)} data-analysis-prescription-count={assignedPrescriptionItems.length} data-analysis-prescription-history-count={questionnaireHistory.length} data-analysis-video-count={tasks.length} data-analysis-video-view-count={videoViewHistory.length} data-prescription-total={totalPrescriptionItems} data-prescription-completed={completedPrescriptionItems} data-prescription-incomplete={Math.max(0, totalPrescriptionItems - completedPrescriptionItems)} data-prescription-percentage={hasAssignedPrescription ? prescriptionCompletionRate : ''} data-prescription-history-count={questionnaireHistory.length} data-prescription-chart-point-count={hasAssignedPrescription ? 1 : 0} className="flex flex-col h-full bg-[#f8f9fa] font-sans antialiased text-slate-900 overflow-hidden animate-in fade-in duration-200">
        
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
                {formatRange(periodRange.start, periodRange.end)}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                共{Math.round((periodRange.end.getTime() - periodRange.start.getTime()) / 86400000) + 1}天
              </div>
            </div>
          </div>

          {/* Section: 折線圖趨勢分析 */}
          <div ref={trendCarouselRef} onScroll={(event) => { const target = event.currentTarget; setActiveTrendIndex(Math.round(target.scrollLeft / Math.max(1, target.clientWidth))); }} className={`flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${!(hasAssignedPrescription || videoViewHistory.length > 0) ? 'hidden' : ''}`}>
          {(() => {
            const chartData = hasAssignedPrescription ? [{
              label: analysisInterval === 'quarter'
                ? `${periodRange.start.getFullYear()} Q${Math.floor(periodRange.start.getMonth() / 3) + 1}`
                : analysisInterval === 'month'
                  ? `${periodRange.start.getFullYear()}/${String(periodRange.start.getMonth() + 1).padStart(2, '0')}`
                  : `${String(periodRange.start.getMonth() + 1).padStart(2, '0')}/${String(periodRange.start.getDate()).padStart(2, '0')}`,
              val: prescriptionCompletionRate,
              sub: `${completedPrescriptionItems}/${totalPrescriptionItems}項`,
            }] : [];
            if (chartData.length === 0) return null;

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
            const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} Z` : '';

            return (
              <div className="min-w-full snap-start bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
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
                    {points.length > 0 && <path d={areaD} fill="url(#amberTrendGradient)" />}

                    {/* Line path */}
                    {points.length > 0 && <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                    {/* Points & Value labels */}
                    {points.length === 0 ? <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="12" fontWeight="700" fill="#64748b">尚無資料</text> : points.map((p, idx) => (
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

          {videoViewHistory.length > 0 && (() => {
            const events = videoViewHistory
              .map((event) => ({ ...event, date: new Date(event.viewedAt) }))
              .filter((event) => event.date <= new Date(periodRange.end.getFullYear(), periodRange.end.getMonth(), periodRange.end.getDate(), 23, 59, 59) && event.date >= periodRange.start)
              .reduce<Record<string, number>>((acc, event) => {
                const key = `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, '0')}-${String(event.date.getDate()).padStart(2, '0')}`;
                acc[key] = (acc[key] ?? 0) + 1;
                return acc;
              }, {});
            const points = Object.entries(events).sort(([a], [b]) => a.localeCompare(b)).slice(-10);
            const maxViews = Math.max(...points.map(([, views]) => views), 0);
            const yMax = maxViews <= 5 ? 5 : Math.ceil(maxViews / 5) * 5;
            return (
              <div className="min-w-full snap-start bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 overflow-x-auto">
                <div className="flex items-center justify-between"><div><h3 className="text-sm font-black text-slate-900">影片觀看數趨勢</h3><p className="text-[11px] font-medium text-slate-500">依實際播放次數統計，同一影片重複觀看會重複計算</p></div><span className="text-[11px] font-extrabold text-blue-700">觀看次數</span></div>
                {points.length === 0 ? <p className="py-6 text-center text-xs text-slate-500">尚無資料</p> : <div className="min-w-[320px]">
                  <div className="flex items-end gap-2 h-36 px-2">{points.map(([date, views]) => <div key={date} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><span className="text-[10px] font-bold text-blue-700">{views}</span><div className="w-full max-w-8 rounded-t bg-blue-400" style={{ height: `${Math.max(4, (views / yMax) * 100)}%` }} /><span className="text-[9px] text-slate-500">{date.slice(5).replace('-', '/')}</span></div>)}</div>
                  <div className="mt-1 flex justify-between text-[9px] text-slate-400"><span>0</span><span>{yMax}</span></div>
                </div>}
              </div>
            );
          })()}
          </div>
          {(hasAssignedPrescription || videoViewHistory.length > 0) && <div className="flex justify-center gap-1.5" aria-label="趨勢圖切換"><button type="button" aria-label="顯示處方達成率趨勢" onClick={() => trendCarouselRef.current?.scrollTo({ left: 0, behavior: 'smooth' })} className={`h-2 w-2 rounded-full ${activeTrendIndex === 0 ? 'bg-orange-500' : 'bg-slate-300'}`} />{hasAssignedPrescription && videoViewHistory.length > 0 && <button type="button" aria-label="顯示影片觀看數趨勢" onClick={() => trendCarouselRef.current?.scrollTo({ left: trendCarouselRef.current.clientWidth, behavior: 'smooth' })} className={`h-2 w-2 rounded-full ${activeTrendIndex === 1 ? 'bg-orange-500' : 'bg-slate-300'}`} />}</div>}

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
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {activeRecordsList.length === 0 ? (
                  <p className="py-3 text-xs text-slate-500">尚未收到專家指派的生活型態處方</p>
                ) : activeRecordsList.map((row) => (
                  <div
                    key={`lifestyle-${row.id}`}
                    onClick={() => { setLifestyleRecordFilter('all'); setSelectedLifestyleRecord(row); }}
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
        {selectedLifestyleRecord && (() => {
          const sourceGroups = selectedLifestyleRecord.lifestyleTypes || [];
          const allItems = sourceGroups.flatMap((group: any) => group.items || []);
          const achievedItems = allItems.filter((item: any) => item.isAchieved);
          const incompleteItems = allItems.filter((item: any) => !item.isAchieved);
          const filterOptions = [
            { key: 'all' as const, label: '全部', count: allItems.length },
            { key: 'achieved' as const, label: '已達成', count: achievedItems.length },
            { key: 'incomplete' as const, label: '未達成', count: incompleteItems.length },
          ];
          const visibleGroups = sourceGroups.map((group: any) => {
            const groupAchieved = (group.items || []).filter((item: any) => item.isAchieved);
            const groupIncomplete = (group.items || []).filter((item: any) => !item.isAchieved);
            const visibleItems = lifestyleRecordFilter === 'achieved' ? groupAchieved : lifestyleRecordFilter === 'incomplete' ? groupIncomplete : [...groupAchieved, ...groupIncomplete];
            return { ...group, visibleItems, groupAchieved, groupIncomplete };
          }).filter((group: any) => group.visibleItems.length > 0);
          return <div data-lifestyle-record-page="grouped" data-lifestyle-record-page-version="page-v1" className="absolute inset-0 z-30 flex flex-col bg-slate-50 font-sans text-slate-900">
            <div className="flex items-center border-b border-slate-200 bg-white px-4 py-3"><button type="button" onClick={() => setSelectedLifestyleRecord(null)} className="mr-3 rounded-full p-1 text-slate-600 hover:bg-slate-100" aria-label="返回綠色處方"><ChevronLeft className="h-6 w-6" /></button><div><h3 className="text-base font-black">生活型態處方紀錄</h3><p className="text-xs font-bold text-[#f37021]">{selectedLifestyleRecord.dateRange}</p></div></div>
            <div className="flex-1 overflow-y-auto p-4"><div className="mx-auto w-full max-w-md space-y-4">
              <div data-lifestyle-record-filter={lifestyleRecordFilter} className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">{filterOptions.map((option) => <button type="button" key={option.key} data-filter-key={option.key} onClick={() => setLifestyleRecordFilter(option.key)} className={`rounded-lg px-2 py-2 text-xs font-black ${lifestyleRecordFilter === option.key ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>{option.label} <span className="ml-1 text-[10px]">{option.count}</span></button>)}</div>
              <div data-lifestyle-record-page="grouped" className="space-y-5">{visibleGroups.length === 0 ? <p className="py-8 text-center text-xs text-slate-500">目前沒有{lifestyleRecordFilter === 'achieved' ? '已達成' : '未達成'}項目</p> : visibleGroups.map((group: any, groupIndex: number) => <section key={group.id || group.typeName || groupIndex} data-prescription-group={group.id || group.typeName} data-group-total={(group.items || []).length} data-group-achieved={group.groupAchieved.length} data-group-incomplete={group.groupIncomplete.length} className="space-y-2"><div className="flex items-center justify-between border-b border-slate-200 pb-2"><h4 className="text-sm font-black text-slate-800">{group.typeName}</h4><span className="text-xs font-bold text-slate-500">{lifestyleRecordFilter === 'all' ? `${group.groupAchieved.length} / ${(group.items || []).length} 已達成` : `${group.visibleItems.length} 項`}</span></div>{group.visibleItems.map((item: any, index: number) => <div key={`${item.title}-${index}`} data-prescription-status={item.isAchieved ? 'achieved' : 'incomplete'} className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5"><span className="text-xs font-medium leading-relaxed text-slate-700">{item.title}</span><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${item.isAchieved ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.isAchieved ? '已達成' : '未達成'}</span></div>)}</section>)}</div>
            </div></div>
          </div>;
        })()}

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

          <h1 className="text-[1.0625rem] font-black text-slate-900 tracking-tight">處方清單</h1>

          <div className="w-14" aria-hidden="true" />
        </header>

        {/* Progress & Doctor Info Banner */}
        <div className="bg-[#FDF2E7] px-4 py-3.5 border-b border-[#F7E0C8] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentDetailPrescription?.expertEmoji || '👨‍⚕️'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">開立專家</div>
                <div className="text-sm font-black text-slate-900">
                  {currentDetailPrescription?.expertName || '示範診所'}
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
              <span>整體完成度</span>
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
                {/* Category Header */}
                <div className="flex items-center">
                  <h2 className="text-sm font-bold text-slate-600">
                    {section.categoryTitle}
                  </h2>
                </div>

                {/* Items List (Big Bold Text + Green Checkbox Box on Right matching reference image) */}
                <div className="space-y-3">
                  {section.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                    {(index === 0 || item.level === 'enhanced' && section.items[index - 1]?.level !== 'enhanced') && (
                      <div className="pt-1 text-[11px] font-black text-slate-500">{item.level === 'enhanced' ? '個別化加強處方' : '基本處方'}</div>
                    )}
                    <div
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
                    </React.Fragment>
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

      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN VIEW: 綠色處方主儀表板
  // -------------------------------------------------------------
  return (
      <div data-child-prescription-dispatched={String(isPrescriptionDispatched)} data-child-assigned-goals-count={assignedGoals.length} data-child-prescription-section-count={Object.keys(prescriptionData).length} data-child-assigned-prescription-count={assignedPrescriptions.length} data-dashboard-video-total={tasks.length} data-dashboard-video-completed={completedCount} data-green-progress-percentage={greenPrescriptionProgress.percentage} data-green-progress-completed={greenPrescriptionProgress.completed} data-green-progress-total={greenPrescriptionProgress.total} className="flex flex-col h-full bg-slate-100/60 font-sans antialiased text-slate-900 select-none overflow-hidden">
      
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
              {selectedDate.toLocaleString('en-US', { month: 'short' })}
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
                onSelectedDateChange?.(new Date());
                setShowDatePicker(false);
              }}
              className="px-3 py-1 bg-orange-600 text-white rounded-lg font-bold text-xs cursor-pointer"
            >
              今日
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
          <div className={hasAssignedPrescription ? 'grid grid-cols-2 gap-2.5' : 'grid grid-cols-1 gap-2.5'}>{hasAssignedPrescription && <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3"><p className="text-[11px] font-bold text-slate-500">生活型態處方</p><p className="mt-1 text-lg font-black text-emerald-700">{completedPrescriptionItems} / {totalPrescriptionItems}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${prescriptionProgressPercent}%` }} /></div></div>}<div className="rounded-xl border border-orange-100 bg-orange-50/70 p-3"><p className="text-[11px] font-bold text-slate-500">衛教影片（每週目標）</p><p className="mt-1 text-lg font-black text-orange-700">{completedCount} / {weeklyTarget}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${videoProgressRatio}%` }} /></div></div></div>
        </div>

        {/* CARD 2: 專家指派生活型態處方 */}
        {!isDoctorAssigned ? (
          hasQuestionnaire ? (
            /* 狀況 A-1：問卷已填寫，等待專家診所從後台派送處方 */
            <div onClick={() => setShowUnassignedAlert(true)} className="bg-white rounded-2xl border border-amber-300 p-4.5 shadow-2xs space-y-2.5 cursor-pointer hover:border-orange-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600 font-extrabold text-xs">
                  <span className="text-amber-600">⏳</span>
                  <span>示範診所 指派</span>
                </div>
                <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  待專家指派
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[1.0625rem] font-black text-slate-900">
                  專家指派生活型態處方
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  問卷已完成，尚未收到專家指派的生活型態處方
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
              const cGoals = presItem.assignedGoals;
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

      {showQuestionnaireMenu && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55" onClick={() => setShowQuestionnaireMenu(false)}><div className="w-full max-w-md rounded-t-3xl bg-white px-5 pb-7 pt-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="relative mb-4 flex min-h-10 items-center justify-center"><button type="button" onClick={() => setShowQuestionnaireMenu(false)} className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"><X className="h-6 w-6" /></button><h3 className="text-lg font-black text-slate-900">生活型態問卷</h3></div><div className="divide-y divide-slate-100"><button type="button" onClick={() => { setShowQuestionnaireMenu(false); handleGoToQuestionnaire('form'); }} className="flex w-full items-center justify-between py-5 text-left"><span className="flex items-center gap-3 text-base font-black text-slate-900"><FileText className="h-6 w-6 text-orange-600" />填寫生活型態問卷</span><ChevronRight className="h-5 w-5 text-slate-400" /></button><button type="button" onClick={() => { setShowQuestionnaireMenu(false); handleGoToQuestionnaire('completed-list'); }} className="flex w-full items-center justify-between py-5 text-left"><span className="flex items-center gap-3 text-base font-black text-slate-900"><CheckCircle2 className="h-6 w-6 text-emerald-600" />已填寫清單</span><span className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">{questionnaireHistory.length}</span><ChevronRight className="h-5 w-5 text-slate-400" /></span></button></div></div></div>}

      {/* Modal: 尚未收到專家處方提醒彈窗 (重點 2) */}
      {showUnassignedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-5.5 space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">{hasQuestionnaire ? '尚未收到專家處方' : '尚未填寫生活型態問卷'}</h3>
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
                {hasQuestionnaire
                  ? '您已完成生活型態問卷，但目前尚未收到專家指派的生活型態處方。請聯繫您的專家協助開立處方。是否要尋找有提供綠色處方任務的專家？'
                  : '您目前尚未完成生活型態問卷，醫師無法依據您的需求協助判送生活型態處方。請問是否要先填寫問卷？'}
              </p>

              {hasQuestionnaire && <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs font-bold text-emerald-900"><Stethoscope className="mr-1 inline h-4 w-4" />尋找提供綠色處方任務的專家</div>}
            </div>

            <div className="pt-1">
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowUnassignedAlert(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer">否</button>
                <button type="button" onClick={() => hasQuestionnaire ? handleGoToExperts() : handleGoToQuestionnaire('form')} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold cursor-pointer">{hasQuestionnaire ? '尋找專家' : '填寫問卷'}</button>
              </div>
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
