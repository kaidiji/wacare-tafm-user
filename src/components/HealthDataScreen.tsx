import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Camera,
  X,
  Activity,
  Heart,
  Smile,
  CheckCircle2,
  Droplets,
  Gauge,
  Footprints,
  Wind,
  FileText,
  UserCheck,
  TreePine,
  Sun,
  Sparkles
} from 'lucide-react';
import { ScreenId } from '../types';
import { BottomNavBar } from './BottomNavBar';
import { HeartCareDashboard } from './heartCare/HeartCareDashboard';
import { BloodPressureDetailScreen } from './heartCare/BloodPressureDetailScreen';
import { OxygenDetailScreen } from './heartCare/OxygenDetailScreen';
import { WeightDetailScreen } from './heartCare/WeightDetailScreen';
import { RespiratoryRateDetailScreen } from './heartCare/RespiratoryRateDetailScreen';
import { TemperatureDetailScreen } from './heartCare/TemperatureDetailScreen';
import { HeartCareState, INITIAL_HEART_CARE_STATE } from './heartCare/heartCareData';
import { GreenPrescriptionDashboard } from './greenPrescription/GreenPrescriptionDashboard';
import { GreenPrescriptionCoursesScreen } from './greenPrescription/GreenPrescriptionCoursesScreen';
import { INITIAL_VIDEO_TASKS, VideoTask } from './greenPrescription/greenPrescriptionData';
import { QuestionnaireScreen } from './QuestionnaireScreen';
import { DoctorPrescriptionSection, getDoctorPrescriptionSection, INITIAL_DOCTOR_PRESCRIPTIONS } from './greenPrescription/doctorPrescriptionsData';

interface Props {
  onNavigate: (screen: ScreenId) => void;
  nickname?: string;
  videoTasks?: VideoTask[];
  onToggleVideoTask?: (id: string) => void;
  assignedGoals?: string[];
  submittedGoals?: string[];
  isQuestionnaireSubmitted?: boolean;
  isPrescriptionDispatched?: boolean;
  onDispatchPrescription?: (goals?: string[]) => void;
  onSubmitLifestyleQuestionnaire?: (goals: string[]) => void;
  prescriptionData?: Record<string, DoctorPrescriptionSection>;
  onTogglePrescriptionItem?: (pillarKey: string, itemId: string) => void;
}

export const HealthDataScreen: React.FC<Props> = ({
  onNavigate,
  nickname = '陳小明',
  videoTasks: propVideoTasks,
  onToggleVideoTask: propOnToggleVideoTask,
  assignedGoals = [],
  submittedGoals = [],
  isQuestionnaireSubmitted = false,
  isPrescriptionDispatched = false,
  onDispatchPrescription,
  onSubmitLifestyleQuestionnaire,
  prescriptionData,
  onTogglePrescriptionItem,
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'family'>('my');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 18)); // 2026年8月18日
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Questionnaire screen state
  const [showQuestionnaireScreen, setShowQuestionnaireScreen] = useState(false);

  // Green Prescription screen states
  const [showGreenPrescriptionDashboard, setShowGreenPrescriptionDashboard] = useState(false);
  const [showAssignedVideosScreen, setShowAssignedVideosScreen] = useState(false);
  const [internalVideoTasks, setInternalVideoTasks] = useState<VideoTask[]>(INITIAL_VIDEO_TASKS);

  const videoTasks = propVideoTasks ?? internalVideoTasks;

  const handleToggleVideoTask = (id: string) => {
    if (propOnToggleVideoTask) {
      propOnToggleVideoTask(id);
    } else {
      setInternalVideoTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  // Multi-tier heart care screen state
  const [showHeartCareDashboard, setShowHeartCareDashboard] = useState(false);
  const [showBloodPressureScreen, setShowBloodPressureScreen] = useState(false);
  const [showOxygenScreen, setShowOxygenScreen] = useState(false);
  const [showWeightScreen, setShowWeightScreen] = useState(false);
  const [showRespiratoryRateScreen, setShowRespiratoryRateScreen] = useState(false);
  const [showTemperatureScreen, setShowTemperatureScreen] = useState(false);
  const [heartCareState, setHeartCareState] = useState<HeartCareState>({
    ...INITIAL_HEART_CARE_STATE,
    vitals: {
      ...INITIAL_HEART_CARE_STATE.vitals,
      spO2: 95,
      heartRate: 61,
    },
  });

  // Health data states
  const [photoAdded, setPhotoAdded] = useState(false);
  const [taskPercent, setTaskPercent] = useState<number>(0);
  const [greenMinutes, setGreenMinutes] = useState<number>(45);
  const [completedGreenTasks, setCompletedGreenTasks] = useState<string[]>([
    '公園綠帶散步 30分',
    '陽光日照與芬多精深呼吸 15分',
  ]);
  const [weight, setWeight] = useState<string>('92');
  const [oxygen, setOxygen] = useState<string>('95');
  const [sysBP, setSysBP] = useState<string>('120');
  const [diaBP, setDiaBP] = useState<string>('80');
  const [bloodSugar, setBloodSugar] = useState<string>('95');
  const [sugarMealState, setSugarMealState] = useState<'before' | 'after'>('before');
  const [heartRate, setHeartRate] = useState<string>('61');
  const [steps, setSteps] = useState<number>(4250);

  // Format date display: e.g. 週三 7月29日
  const formatDateString = (date: Date) => {
    const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const weekDay = weekDays[date.getDay()];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${weekDay} ${month}月${day}日`;
  };

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  if (showQuestionnaireScreen) {
    return (
      <QuestionnaireScreen
        onBack={() => setShowQuestionnaireScreen(false)}
        onNavigate={onNavigate}
        isLifestyleSubmitted={isQuestionnaireSubmitted}
        submittedGoals={assignedGoals}
        onSubmitLifestyleQuestionnaire={(goals) => {
          if (onSubmitLifestyleQuestionnaire) {
            onSubmitLifestyleQuestionnaire(goals);
          }
        }}
      />
    );
  }

  if (showAssignedVideosScreen) {
    return (
      <GreenPrescriptionCoursesScreen
        onBack={() => setShowAssignedVideosScreen(false)}
        tasks={videoTasks}
        onToggleComplete={handleToggleVideoTask}
        assignedGoals={assignedGoals}
        onNavigate={onNavigate}
      />
    );
  }

  if (showGreenPrescriptionDashboard) {
    return (
      <GreenPrescriptionDashboard
        onBack={() => setShowGreenPrescriptionDashboard(false)}
        onNavigateToTasks={() => setShowAssignedVideosScreen(true)}
        tasks={videoTasks}
        assignedGoals={assignedGoals}
        submittedGoals={submittedGoals}
        isQuestionnaireSubmitted={isQuestionnaireSubmitted}
        isPrescriptionDispatched={isPrescriptionDispatched}
        onDispatchPrescription={onDispatchPrescription}
        onNavigateToQuestionnaire={() => {
          setShowGreenPrescriptionDashboard(false);
          setShowQuestionnaireScreen(true);
        }}
        onNavigate={onNavigate}
        prescriptionData={prescriptionData}
        onTogglePrescriptionItem={onTogglePrescriptionItem}
      />
    );
  }

  if (showHeartCareDashboard) {
    return (
      <HeartCareDashboard
        onBack={() => setShowHeartCareDashboard(false)}
        nickname={nickname}
        heartCareState={heartCareState}
        onUpdateHeartCareState={setHeartCareState}
      />
    );
  }

  if (showBloodPressureScreen) {
    return (
      <BloodPressureDetailScreen
        onBack={() => setShowBloodPressureScreen(false)}
        nickname={nickname}
        currentVitals={heartCareState.vitals}
        onUpdateVitals={(newVitals) => {
          if (newVitals.sysBP) setSysBP(String(newVitals.sysBP));
          if (newVitals.diaBP) setDiaBP(String(newVitals.diaBP));
          if (newVitals.heartRate) setHeartRate(String(newVitals.heartRate));
          setHeartCareState((prev) => ({
            ...prev,
            vitals: {
              ...prev.vitals,
              ...newVitals,
            },
          }));
        }}
      />
    );
  }

  if (showOxygenScreen) {
    return (
      <OxygenDetailScreen
        onBack={() => setShowOxygenScreen(false)}
        nickname={nickname}
        currentVitals={heartCareState.vitals}
        onUpdateVitals={(newVitals) => {
          if (newVitals.spO2 !== undefined) setOxygen(String(newVitals.spO2));
          if (newVitals.heartRate !== undefined) setHeartRate(String(newVitals.heartRate));
          setHeartCareState((prev) => ({
            ...prev,
            vitals: {
              ...prev.vitals,
              ...newVitals,
            },
          }));
        }}
      />
    );
  }

  if (showWeightScreen) {
    return (
      <WeightDetailScreen
        onBack={() => setShowWeightScreen(false)}
        nickname={nickname}
        currentVitals={heartCareState.vitals}
        onUpdateVitals={(newVitals) => {
          if (newVitals.weight !== undefined) setWeight(String(newVitals.weight));
          setHeartCareState((prev) => ({
            ...prev,
            vitals: {
              ...prev.vitals,
              ...newVitals,
            },
          }));
        }}
      />
    );
  }

  if (showRespiratoryRateScreen) {
    return (
      <RespiratoryRateDetailScreen
        onBack={() => setShowRespiratoryRateScreen(false)}
        nickname={nickname}
        currentVitals={heartCareState.vitals}
        onUpdateVitals={(newVitals) => {
          setHeartCareState((prev) => ({
            ...prev,
            vitals: {
              ...prev.vitals,
              ...newVitals,
            },
          }));
        }}
      />
    );
  }

  if (showTemperatureScreen) {
    return (
      <TemperatureDetailScreen
        onBack={() => setShowTemperatureScreen(false)}
        nickname={nickname}
        currentVitals={heartCareState.vitals}
        onUpdateVitals={(newVitals) => {
          setHeartCareState((prev) => ({
            ...prev,
            vitals: {
              ...prev.vitals,
              ...newVitals,
            },
          }));
        }}
      />
    );
  }

  // Calculate dynamic heart care badge for Level 1 card
  const hasRedSymptom = heartCareState.reportedSymptoms.some((s) => s.severity === 'red');
  const hasYellowSymptom = heartCareState.reportedSymptoms.some((s) => s.severity === 'yellow');

  let heartCareBadgeText = '穩定';
  let heartCareBadgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (hasRedSymptom) {
    heartCareBadgeText = '紅燈';
    heartCareBadgeStyle = 'bg-red-100 text-red-800 border-red-300';
  } else if (hasYellowSymptom) {
    heartCareBadgeText = '黃燈';
    heartCareBadgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  return (
    <div className="flex flex-col h-full bg-white relative font-sans antialiased text-slate-900 overflow-hidden">
      {/* 1. Top Navigation Bar (AppBar) */}
      <header className="pt-2 px-3 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center justify-between min-h-[3rem] relative">
          {/* Left: User Profile Avatar with status dot */}
          <button
            onClick={() => onNavigate('REAL-NAME')}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 active:scale-95 cursor-pointer"
            title="查看個人檔案"
          >
            <div className="relative">
              <div className="w-[36px] h-[36px] rounded-full bg-orange-100 border-2 border-orange-400 flex items-center justify-center overflow-hidden">
                <span className="text-[1.125rem]">👤</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="w-[6px] h-[6px] bg-white rounded-full"></span>
              </span>
            </div>
          </button>

          {/* Center Title: "健康數據" (Bold, 1.25rem) */}
          <h1 className="text-[1.25rem] font-black text-slate-900 tracking-tight leading-snug">
            健康數據
          </h1>

          {/* Right: Overflow Menu Icon (⋮) - Disabled per user request */}
          <button
            disabled
            className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-400 cursor-not-allowed opacity-50 rounded-full focus:outline-none"
            aria-label="更多選單（不可點擊）"
          >
            <MoreVertical className="w-[1.5rem] h-[1.5rem]" />
          </button>
        </div>

        {/* 2. Tab Segment */}
        <nav className="flex text-center mt-1 border-b border-slate-100 font-bold">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 min-h-[48px] flex items-center justify-center text-[1rem] transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              activeTab === 'my'
                ? 'text-orange-600 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            我的健康
            {activeTab === 'my' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`flex-1 min-h-[48px] flex items-center justify-center text-[1rem] transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              activeTab === 'family'
                ? 'text-orange-600 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            親友健康
            {activeTab === 'family' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600 rounded-full" />
            )}
          </button>
        </nav>
      </header>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto min-h-0 touch-pan-y">
        {activeTab === 'my' ? (
          <div>
            {/* 3. Date Selector Header: "< 週三 7月29日 ∨ >" */}
            <div className="flex items-center justify-between px-3 py-2 text-slate-900 font-extrabold border-b border-slate-200 bg-slate-50/80">
              <button
                onClick={handlePrevDay}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-slate-200/70 rounded-full cursor-pointer text-slate-800 transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="前一天"
              >
                <ChevronLeft className="w-[1.5rem] h-[1.5rem]" />
              </button>

              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="min-h-[48px] px-4 flex items-center justify-center gap-1.5 hover:bg-slate-200/60 rounded-xl cursor-pointer transition-colors text-slate-900 font-black text-[1.05rem] focus:outline-none focus:ring-2 focus:ring-orange-500 active:scale-98"
              >
                <span>&lt; {formatDateString(currentDate)} ∨ &gt;</span>
              </button>

              <button
                onClick={handleNextDay}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-slate-200/70 rounded-full cursor-pointer text-slate-800 transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="後一天"
              >
                <ChevronRight className="w-[1.5rem] h-[1.5rem]" />
              </button>
            </div>

            {/* Date picker dropdown sheet */}
            {showDatePicker && (
              <div className="p-3 bg-orange-50 border-b border-orange-200 flex items-center justify-between text-[0.875rem] text-orange-950 font-bold">
                <span>選擇日期</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCurrentDate(new Date(2026, 6, 29));
                      setShowDatePicker(false);
                    }}
                    className="min-h-[40px] px-3 bg-orange-600 text-white rounded-lg font-extrabold cursor-pointer hover:bg-orange-700 active:scale-95"
                  >
                    今天 (7/29)
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="min-h-[40px] px-3 text-slate-700 hover:text-slate-900 font-bold cursor-pointer"
                  >
                    關閉
                  </button>
                </div>
              </div>
            )}

            {/* 4. Scrollable Health Data List (11 Cards Inventory) */}
            <div className="divide-y divide-slate-200 text-slate-900 font-bold text-[0.9375rem]">
              
              {/* 1. 相簿 */}
              <div className="flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-slate-50 transition-colors">
                <span className="font-black text-slate-900 text-[1rem]">相簿</span>
                <div className="flex items-center gap-2">
                  {photoAdded && (
                    <span className="text-[0.8125rem] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      已上傳 1 張
                    </span>
                  )}
                  <button
                    onClick={() => setActiveModal('photo')}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-label="新增相簿"
                  >
                    <Plus className="w-[1.5rem] h-[1.5rem]" />
                  </button>
                </div>
              </div>

              {/* 2. 綠色處方燈 (以 % 與進度條呈現，點擊開啟儀表板) */}
              {(() => {
                const dataToUse = prescriptionData || INITIAL_DOCTOR_PRESCRIPTIONS;
                const activeKeys = assignedGoals.length > 0
                  ? assignedGoals
                  : (submittedGoals.length > 0 ? submittedGoals : ['運動習慣', '飲食習慣']);

                let totalPrescriptionItems = 0;
                let completedPrescriptionItems = 0;

                activeKeys.forEach((key) => {
                  const sec = getDoctorPrescriptionSection(key, dataToUse);
                  if (sec) {
                    totalPrescriptionItems += sec.items.length;
                    completedPrescriptionItems += sec.items.filter((it) => it.completed).length;
                  }
                });

                const completedVideoCount = videoTasks.filter((t) => t.completed).length;
                const totalVideoCount = videoTasks.length;

                const totalItems = totalPrescriptionItems + totalVideoCount;
                const completedItems = completedPrescriptionItems + completedVideoCount;

                const greenPrescriptionPercent =
                  totalItems > 0
                    ? Math.round((completedItems / totalItems) * 100)
                    : totalVideoCount > 0
                    ? Math.round((completedVideoCount / totalVideoCount) * 100)
                    : 0;

                return (
                  <div
                    onClick={() => setShowGreenPrescriptionDashboard(true)}
                    className="flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-orange-50/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-black text-slate-900 text-[1rem] group-hover:text-orange-600 transition-colors">
                        綠色處方燈 {greenPrescriptionPercent}%
                      </span>
                      <div className="w-[6.5rem] sm:w-[9rem] bg-slate-200 h-[0.5rem] rounded-full overflow-hidden border border-slate-300">
                        <div
                          className="bg-orange-500 h-full transition-all duration-300 shadow-xs"
                          style={{ width: `${greenPrescriptionPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors">
                      <ChevronRight className="w-[1.5rem] h-[1.5rem]" />
                    </div>
                  </div>
                );
              })()}

              {/* 3. 血氧 */}
              <div
                onClick={() => setShowOxygenScreen(true)}
                className="flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="font-black text-slate-900 text-[1rem]">血氧</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-900 text-[0.875rem] font-black">
                    {oxygen ? `${oxygen} %` : '無資料'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[0.8125rem] font-extrabold border ${
                      oxygen
                        ? Number(oxygen) >= 95
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : Number(oxygen) >= 90
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {oxygen
                      ? Number(oxygen) >= 95
                        ? '正常'
                        : Number(oxygen) >= 90
                        ? '留意'
                        : '緊急'
                      : '無'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOxygenScreen(true);
                    }}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-label="記錄血氧"
                  >
                    <Plus className="w-[1.5rem] h-[1.5rem]" />
                  </button>
                </div>
              </div>

              {/* 5. 血壓 */}
              <div
                onClick={() => setShowBloodPressureScreen(true)}
                className="flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="font-black text-slate-900 text-[1rem]">血壓</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-900 text-[0.875rem] font-black">
                    {sysBP && diaBP ? `${sysBP}/${diaBP} mmHg` : '無資料'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[0.8125rem] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    正常
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBloodPressureScreen(true);
                    }}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-label="記錄血壓"
                  >
                    <Plus className="w-[1.5rem] h-[1.5rem]" />
                  </button>
                </div>
              </div>

              {/* 6. 血糖 */}
              <div className="flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-slate-50 transition-colors">
                <span className="font-black text-slate-900 text-[1rem]">血糖</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-900 text-[0.875rem] font-black">
                    {bloodSugar} mg/dL
                  </span>
                  <span className="px-3 py-1 rounded-full text-[0.8125rem] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {sugarMealState === 'before' ? '飯前正常' : '飯後正常'}
                  </span>
                  <button
                    onClick={() => setActiveModal('blood_sugar')}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-label="記錄血糖"
                  >
                    <Plus className="w-[1.5rem] h-[1.5rem]" />
                  </button>
                </div>
              </div>

              {/* 7. 活動量 */}
              <div className="flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-slate-50 transition-colors">
                <span className="font-black text-slate-900 text-[1rem]">活動量</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-900 text-[0.875rem] font-black">
                    {steps.toLocaleString()} 步
                  </span>
                  <span className="px-3 py-1 rounded-full text-[0.8125rem] font-extrabold bg-orange-100 text-orange-800 border border-orange-300">
                    目標 {Math.round((steps / 7000) * 100)}%
                  </span>
                  <button
                    onClick={() => setActiveModal('activity')}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-label="記錄活動量"
                  >
                    <Plus className="w-[1.5rem] h-[1.5rem]" />
                  </button>
                </div>
              </div>

              {/* 8. 體重 (MOVED) */}
              <div
                onClick={() => setShowWeightScreen(true)}
                className="flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="font-black text-slate-900 text-[1rem]">體重</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-900 text-[0.875rem] font-black">
                    {weight ? `${weight} kg` : '無資料'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[0.8125rem] font-extrabold border ${
                      weight
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {weight ? '輕度肥胖' : '無'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowWeightScreen(true);
                    }}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-label="記錄體重"
                  >
                    <Plus className="w-[1.5rem] h-[1.5rem]" />
                  </button>
                </div>
              </div>

              {/* 9. 數位社會處方燈 (MOVED) */}
              <button
                onClick={() => setShowAssignedVideosScreen(true)}
                className="w-full flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-slate-50 transition-colors text-left cursor-pointer active:scale-99 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <span className="font-black text-slate-900 text-[1rem]">數位社會處方燈</span>
                <div className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-500">
                  <ChevronRight className="w-[1.5rem] h-[1.5rem]" />
                </div>
              </button>

              {/* 10. 空汙 */}
              <div className="flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-slate-50 transition-colors">
                <span className="font-black text-slate-900 text-[1rem]">空汙</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-900 text-[0.875rem] font-black">AQI 30</span>
                  <span className="px-3 py-1 rounded-full text-[0.8125rem] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    良好
                  </span>
                  <button
                    onClick={() => setActiveModal('aqi')}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-label="空汙詳細資訊"
                  >
                    <Plus className="w-[1.5rem] h-[1.5rem]" />
                  </button>
                </div>
              </div>

              {/* 11. 問卷燈 */}
              <div
                onClick={() => setShowQuestionnaireScreen(true)}
                className="flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="font-black text-slate-900 text-[1rem]">問卷燈</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-600 text-[0.875rem] font-bold">
                    {isQuestionnaireSubmitted ? '已填寫 1 份' : '無資料'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[0.8125rem] font-extrabold border ${
                      isQuestionnaireSubmitted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {isQuestionnaireSubmitted ? '完成' : '無'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQuestionnaireScreen(true);
                    }}
                    className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-label="查看問卷"
                  >
                    <Plus className="w-[1.5rem] h-[1.5rem]" />
                  </button>
                </div>
              </div>

              {/* 12. 巴金森 */}
              <button
                onClick={() => setActiveModal('parkinsons')}
                className="w-full flex items-center justify-between px-4 py-3 min-h-[3.75rem] hover:bg-slate-50 transition-colors text-left cursor-pointer active:scale-99 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <span className="font-black text-slate-900 text-[1rem]">巴金森</span>
                <div className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-500">
                  <ChevronRight className="w-[1.5rem] h-[1.5rem]" />
                </div>
              </button>

            </div>
          </div>
        ) : (
          /* 親友健康 Tab */
          <div className="p-8 text-center space-y-4 text-slate-600">
            <div className="w-[4rem] h-[4rem] rounded-full bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
              <Smile className="w-[2.25rem] h-[2.25rem]" />
            </div>
            <p className="text-[1.125rem] font-black text-slate-900">尚無親友授權健康數據</p>
            <p className="text-[0.875rem] text-slate-600 leading-relaxed max-w-xs mx-auto">
              點擊邀請親友分享健康量測紀錄，共同關心長輩與家人的身體狀態。
            </p>
            <button
              onClick={() => alert('已發送親友邀請連結！')}
              className="min-h-[48px] px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[1rem] rounded-2xl shadow-md cursor-pointer active:scale-95 transition-all"
            >
              + 邀請親友加入
            </button>
          </div>
        )}
      </div>

      {/* Senior-Friendly Modal Dialogs */}
      {activeModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-[1.125rem]">
                {activeModal === 'blood_pressure' && '新增血壓紀錄'}
                {activeModal === 'heart_rate' && '新增心率紀錄'}
                {activeModal === 'blood_sugar' && '新增血糖紀錄'}
                {activeModal === 'activity' && '新增活動量步數'}
                {activeModal === 'weight' && '新增體重紀錄'}
                {activeModal === 'oxygen' && '新增血氧紀錄'}
                {activeModal === 'photo' && '上傳照片至相簿'}
                {activeModal === 'green_prescription' && '綠色處方燈'}
                {activeModal === 'prescription' && '數位社會處方燈'}
                {activeModal === 'aqi' && '今日空汙與環境'}
                {activeModal === 'questionnaire' && '填寫問卷燈'}
                {activeModal === 'parkinsons' && '巴金森氏症評估'}
                {activeModal === 'overflow_menu' && '健康數據功能選單'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="關閉"
              >
                <X className="w-[1.5rem] h-[1.5rem]" />
              </button>
            </div>

            {/* Modal Body Forms */}
            {activeModal === 'blood_pressure' && (
              <div className="space-y-4">
                <p className="text-[0.875rem] text-slate-600 font-bold">請輸入血壓測量數值：</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[0.8125rem] text-slate-700 font-extrabold block mb-1">收縮壓 (高壓)</label>
                    <input
                      type="number"
                      value={sysBP}
                      onChange={(e) => setSysBP(e.target.value)}
                      className="w-full h-[48px] px-3 border-2 border-slate-300 rounded-xl text-[1.125rem] font-black focus:outline-none focus:border-orange-500 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[0.8125rem] text-slate-700 font-extrabold block mb-1">舒張壓 (低壓)</label>
                    <input
                      type="number"
                      value={diaBP}
                      onChange={(e) => setDiaBP(e.target.value)}
                      className="w-full h-[48px] px-3 border-2 border-slate-300 rounded-xl text-[1.125rem] font-black focus:outline-none focus:border-orange-500 text-center"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onNavigate('SCR-08');
                      setActiveModal(null);
                    }}
                    className="flex-1 min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[0.875rem] rounded-2xl cursor-pointer"
                  >
                    開啟大數字鍵盤
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 min-h-[48px] bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[0.875rem] rounded-2xl cursor-pointer shadow-md"
                  >
                    快速儲存
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'blood_sugar' && (
              <div className="space-y-4">
                <label className="text-[0.875rem] text-slate-700 font-extrabold block">血糖數值 (mg/dL)</label>
                <input
                  type="number"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  className="w-full h-[48px] px-4 border-2 border-slate-300 rounded-xl text-[1.125rem] font-black focus:outline-none focus:border-orange-500 text-center"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setSugarMealState('before')}
                    className={`flex-1 min-h-[44px] rounded-xl font-extrabold text-[0.875rem] border ${
                      sugarMealState === 'before'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    飯前血糖
                  </button>
                  <button
                    onClick={() => setSugarMealState('after')}
                    className={`flex-1 min-h-[44px] rounded-xl font-extrabold text-[0.875rem] border ${
                      sugarMealState === 'after'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    飯後血糖
                  </button>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full min-h-[48px] bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[1rem] rounded-2xl cursor-pointer shadow-md"
                >
                  儲存血糖紀錄
                </button>
              </div>
            )}

            {activeModal === 'activity' && (
              <div className="space-y-4">
                <label className="text-[0.875rem] text-slate-700 font-extrabold block">今日累積步數</label>
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full h-[48px] px-4 border-2 border-slate-300 rounded-xl text-[1.125rem] font-black focus:outline-none focus:border-orange-500 text-center"
                />
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full min-h-[48px] bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[1rem] rounded-2xl cursor-pointer shadow-md"
                >
                  更新活動量
                </button>
              </div>
            )}

            {activeModal === 'weight' && (
              <div className="space-y-4">
                <label className="text-[0.875rem] text-slate-700 font-extrabold block">請輸入體重 (kg)</label>
                <input
                  type="number"
                  placeholder="例如: 65.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full h-[48px] px-4 border-2 border-slate-300 rounded-xl text-[1.125rem] font-black focus:outline-none focus:border-orange-500 text-center"
                />
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full min-h-[48px] bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[1rem] rounded-2xl cursor-pointer shadow-md"
                >
                  儲存體重資料
                </button>
              </div>
            )}

            {activeModal === 'oxygen' && (
              <div className="space-y-4">
                <label className="text-[0.875rem] text-slate-700 font-extrabold block">請輸入血氧濃度 (%)</label>
                <input
                  type="number"
                  placeholder="例如: 98"
                  value={oxygen}
                  onChange={(e) => setOxygen(e.target.value)}
                  className="w-full h-[48px] px-4 border-2 border-slate-300 rounded-xl text-[1.125rem] font-black focus:outline-none focus:border-orange-500 text-center"
                />
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full min-h-[48px] bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[1rem] rounded-2xl cursor-pointer shadow-md"
                >
                  儲存血氧紀錄
                </button>
              </div>
            )}

            {activeModal === 'photo' && (
              <div className="text-center space-y-4 py-2">
                <div className="w-[4.5rem] h-[4.5rem] bg-orange-100 rounded-2xl mx-auto flex items-center justify-center text-orange-600">
                  <Camera className="w-[2.5rem] h-[2.5rem]" />
                </div>
                <p className="text-[0.875rem] text-slate-700 font-bold leading-relaxed">
                  選擇生活照、健康餐食或藥包照片上傳至今日健康相簿
                </p>
                <button
                  onClick={() => {
                    setPhotoAdded(true);
                    setActiveModal(null);
                  }}
                  className="w-full min-h-[48px] bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[1rem] rounded-2xl cursor-pointer shadow-md"
                >
                  模擬選擇上傳照片
                </button>
              </div>
            )}

            {activeModal === 'green_prescription' && (
              <div className="space-y-4">
                {/* Status overview card */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2 text-emerald-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-black">
                      <TreePine className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm">今日綠意活動：{greenMinutes} 分鐘</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs ${
                      greenMinutes >= 30
                        ? 'bg-emerald-600 text-white'
                        : greenMinutes > 0
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-400 text-white'
                    }`}>
                      {greenMinutes >= 30 ? '綠燈 達成' : greenMinutes > 0 ? '累積中' : '未記錄'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                    接觸綠意與大自然環境可活化副交感神經，協助放鬆身心、穩定心率血壓與提升幸福感。
                  </p>
                </div>

                {/* Quick add minutes */}
                <div>
                  <label className="text-xs text-slate-700 font-extrabold block mb-1.5">
                    今日累積綠色活動時數 (分鐘)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={greenMinutes}
                      onChange={(e) => setGreenMinutes(Math.max(0, Number(e.target.value)))}
                      className="flex-1 h-[48px] px-3 border-2 border-slate-300 rounded-xl text-lg font-black focus:outline-none focus:border-emerald-500 text-center"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGreenMinutes((prev) => prev + 15)}
                        className="h-[48px] px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-xs rounded-xl cursor-pointer transition-colors active:scale-95"
                      >
                        +15分
                      </button>
                      <button
                        type="button"
                        onClick={() => setGreenMinutes((prev) => prev + 30)}
                        className="h-[48px] px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-xs rounded-xl cursor-pointer transition-colors active:scale-95"
                      >
                        +30分
                      </button>
                    </div>
                  </div>
                </div>

                {/* Green activities checklist */}
                <div>
                  <label className="text-xs text-slate-700 font-extrabold block mb-2">
                    推薦綠色處方項目：
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { label: '公園森林步道健走 30分', icon: '🌲', addMin: 30 },
                      { label: '陽光日照與芬多精深呼吸 15分', icon: '☀️', addMin: 15 },
                      { label: '園藝花草撫觸與植栽 20分', icon: '🪴', addMin: 20 },
                      { label: '社區綠意公園伸展放鬆 15分', icon: '🌿', addMin: 15 },
                    ].map((act) => {
                      const isDone = completedGreenTasks.includes(act.label);
                      return (
                        <button
                          key={act.label}
                          type="button"
                          onClick={() => {
                            if (isDone) {
                              setCompletedGreenTasks((prev) => prev.filter((t) => t !== act.label));
                              setGreenMinutes((prev) => Math.max(0, prev - act.addMin));
                            } else {
                              setCompletedGreenTasks((prev) => [...prev, act.label]);
                              setGreenMinutes((prev) => prev + act.addMin);
                            }
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{act.icon}</span>
                            <span>{act.label}</span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl cursor-pointer shadow-md active:scale-98 transition-all"
                >
                  儲存綠色處方紀錄
                </button>
              </div>
            )}

            {(activeModal === 'prescription' || activeModal === 'parkinsons' || activeModal === 'questionnaire' || activeModal === 'aqi') && (
              <div className="space-y-4 text-center py-2">
                <p className="text-[0.9375rem] text-slate-800 font-bold leading-relaxed">
                  {activeModal === 'prescription' && '數位社會處方包含運動、社交與心靈健康指引，協助長者預防延緩失能與健康維護。'}
                  {activeModal === 'parkinsons' && '巴金森氏症早期檢測：觀察手指敲擊、走路姿勢及身體震顫變化。'}
                  {activeModal === 'questionnaire' && '完成每日生活品質問卷，讓專業護理團隊即時了解您的身體健康動態。'}
                  {activeModal === 'aqi' && '今日戶外空氣品質良好 (AQI 30)，非常適合前往公園散步與適度體能活動。'}
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full min-h-[48px] bg-slate-900 text-white font-extrabold text-[1rem] rounded-2xl cursor-pointer"
                >
                  我知道了
                </button>
              </div>
            )}

            {activeModal === 'overflow_menu' && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onNavigate('REAL-NAME');
                  }}
                  className="w-full min-h-[48px] px-4 bg-slate-50 hover:bg-slate-100 text-left font-extrabold text-slate-800 rounded-xl flex items-center justify-between"
                >
                  <span>個人實名認證資料</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    alert('已匯出今日健康報告 (PDF)');
                  }}
                  className="w-full min-h-[48px] px-4 bg-slate-50 hover:bg-slate-100 text-left font-extrabold text-slate-800 rounded-xl flex items-center justify-between"
                >
                  <span>匯出健康數據報告</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full min-h-[48px] mt-2 bg-orange-600 text-white font-extrabold text-[1rem] rounded-2xl"
                >
                  關閉選單
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. Fixed Bottom Navigation Bar */}
      <BottomNavBar activeTab="data" onNavigate={onNavigate} unreadCount={1} />
    </div>
  );
};

