import React, { useState } from 'react';
import { X, Plus, CheckCircle2, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';
import { ScreenId } from '../types';
import { LifestyleQuestionnaireFormScreen } from './LifestyleQuestionnaireFormScreen';
import { QuestionnaireResultScreen } from './QuestionnaireResultScreen';

export interface QuestionnaireRecord {
  id: string;
  title: string;
  category: string;
  status: 'completed' | 'pending';
  completedDate?: string;
  dateLabel?: string;
  summary?: string;
  scoreOrResult?: string;
  targetScreen?: ScreenId;
  description?: string;
  enabled?: boolean;
}

interface Props {
  onBack: () => void;
  onNavigate?: (screen: ScreenId) => void;
  isLifestyleSubmitted?: boolean;
  submittedGoals?: string[];
  onSubmitLifestyleQuestionnaire?: (goals: string[]) => void;
}

export const QuestionnaireScreen: React.FC<Props> = ({
  onBack,
  onNavigate,
  isLifestyleSubmitted = false,
  submittedGoals = [],
  onSubmitLifestyleQuestionnaire,
}) => {
  const [activeTab, setActiveTab] = useState<'completed' | 'pending'>(
    isLifestyleSubmitted ? 'completed' : 'completed'
  );
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showLifestyleForm, setShowLifestyleForm] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026 年 8 月');

  // Exact questionnaires list matching IMG_8998 (With only '生活型態問卷' clickable)
  const allSelectableQuestionnaires = [
    { id: 'q-lifestyle', title: '生活型態問卷', enabled: true },
    { id: 'q-1', title: '地區醫院全人全社區照護計劃', enabled: false },
    { id: 'q-2', title: '全民健康保險家庭醫師整合性照護計劃', enabled: false },
    { id: 'q-3', title: '長者 ICOPE 調查表(個人)', enabled: false },
    { id: 'q-4', title: '健康識能量表(個人)', enabled: false },
    { id: 'q-5', title: '心情溫度計量表(個人)', enabled: false },
    { id: 'q-6', title: 'PSS 壓力知覺量表', enabled: false },
    { id: 'q-7', title: 'PSQI 睡眠品質評估量表', enabled: false },
    { id: 'q-8', title: 'ICOPE 初評調查表(專家版)', enabled: false },
    { id: 'q-9', title: 'DHA 長者健康調查', enabled: false },
    { id: 'q-10', title: '職場問卷-過勞量表', enabled: false },
    { id: 'q-11', title: 'SDSCA 糖尿病自我照護問卷', enabled: false },
  ];

  // Records for completed / pending tabs
  const completedList: QuestionnaireRecord[] = isLifestyleSubmitted
    ? [
        {
          id: 'q-lifestyle',
          title: '生活型態問卷',
          dateLabel: '8月27日',
          category: '綠色家庭醫學計畫',
          status: 'completed',
          completedDate: '2026/08/27 10:30',
          summary: `已選定改善面向：${submittedGoals.join('、') || '運動習慣、飲食習慣'}`,
          scoreOrResult: '已完成評估 · 專家處方指派中',
          targetScreen: 'GREEN-PRESCRIPTION-EVENT',
          description: '台灣家庭醫學醫學會 ╳ WaCare 合作，由專業醫師依據結果開立綠色處方。',
        },
      ]
    : [];

  const pendingList: QuestionnaireRecord[] = !isLifestyleSubmitted
    ? [
        {
          id: 'q-lifestyle',
          title: '生活型態問卷',
          dateLabel: '8月27日',
          category: '綠色家庭醫學計畫',
          status: 'pending',
          summary: '包含運動、飲食、睡眠、壓力、戒癮與人際互動等面向評估',
          scoreOrResult: '未填寫',
          description: '台灣家庭醫學醫學會 ╳ WaCare 合作，由專業醫師依據結果開立綠色處方。',
        },
      ]
    : [];

  const currentList = activeTab === 'completed' ? completedList : pendingList;

  const handleSelectQuestionnaireItem = (item: { id: string; title: string; enabled: boolean }) => {
    if (!item.enabled) return;
    setShowSelectModal(false);
    setShowLifestyleForm(true);
  };

  const handleFinishLifestyleForm = (goals: string[]) => {
    setShowLifestyleForm(false);
    if (onSubmitLifestyleQuestionnaire) {
      onSubmitLifestyleQuestionnaire(goals);
    }
    setActiveTab('completed');
  };

  // If user opens questionnaire result details
  if (showResultScreen) {
    return (
      <QuestionnaireResultScreen
        onClose={() => setShowResultScreen(false)}
        title="生活型態問卷"
        dateLabel="2026/08/27"
        completedDate="2026/08/27 10:30"
        submittedGoals={submittedGoals}
      />
    );
  }

  // If user opens lifestyle questionnaire form
  if (showLifestyleForm) {
    return (
      <LifestyleQuestionnaireFormScreen
        onBack={() => setShowLifestyleForm(false)}
        onSubmit={handleFinishLifestyleForm}
        initialGoals={submittedGoals}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative font-sans antialiased text-slate-900 select-none">
      {/* 1. Header Bar (Matching design exactly: Close 'X', Center '問卷', Right orange '+') */}
      <header className="pt-2 px-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center justify-between min-h-[3.25rem]">
          {/* Close button (X) */}
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-900 transition-colors cursor-pointer active:scale-95"
            title="關閉"
          >
            <X className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Title */}
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            問卷
          </h1>

          {/* Plus button (Orange circle with white plus) */}
          <button
            onClick={() => setShowSelectModal(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f37021] text-white hover:bg-orange-600 transition-transform active:scale-95 cursor-pointer shadow-xs"
            title="新增問卷"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* 2. Tabs Bar: 已完成 / 未完成 */}
        <div className="flex items-center text-center mt-1 border-b border-slate-200/90">
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 text-[0.9375rem] font-black cursor-pointer transition-colors relative ${
              activeTab === 'completed'
                ? 'text-[#f37021]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>已完成</span>
            {activeTab === 'completed' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#f37021]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 text-[0.9375rem] font-black cursor-pointer transition-colors relative ${
              activeTab === 'pending'
                ? 'text-[#f37021]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>未完成</span>
            {activeTab === 'pending' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#f37021]" />
            )}
          </button>
        </div>
      </header>

      {/* 3. Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col">
        {currentList.length === 0 ? (
          /* Empty State Matching Uploaded Screenshot (IMG_8995.PNG) */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center my-auto">
            {/* Cartoon Medical Illustration (Nurse, Doctor, Caregiver) */}
            <div className="w-56 h-56 flex items-center justify-center relative mb-6">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-xs"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background decorative soft glow */}
                <circle cx="100" cy="100" r="85" fill="#f8fafc" />

                {/* Left Character: Nurse with cap and pink uniform */}
                <g id="nurse" className="translate-x-0">
                  <path
                    d="M58 80 C48 85, 45 105, 52 118 C56 125, 62 128, 68 128 C65 110, 68 95, 75 88 Z"
                    fill="#0284c7"
                  />
                  <ellipse cx="68" cy="105" rx="14" ry="16" fill="#fed7aa" />
                  <circle cx="63" cy="103" r="1.5" fill="#0f172a" />
                  <circle cx="73" cy="103" r="1.5" fill="#0f172a" />
                  <path d="M64 110 Q68 114 72 110" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M57 90 C57 85, 79 85, 79 90 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <path d="M66 87 h4 M68 85 v4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M56 124 L60 160 L76 160 L80 124 Z" fill="#fbcfe8" />
                  <path d="M60 124 L68 132 L76 124" fill="#ffffff" />
                  <line x1="64" y1="160" x2="64" y2="182" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="72" y1="160" x2="72" y2="182" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="63" cy="182" rx="4" ry="2" fill="#ffffff" stroke="#cbd5e1" />
                  <ellipse cx="73" cy="182" rx="4" ry="2" fill="#ffffff" stroke="#cbd5e1" />
                </g>

                {/* Center Character: Doctor with lab coat and glasses */}
                <g id="doctor">
                  <path d="M85 82 C85 70, 115 70, 115 82 C115 86, 118 92, 116 98 L84 98 C82 92, 85 86, 85 82 Z" fill="#0369a1" />
                  <rect x="88" y="86" width="24" height="30" rx="6" fill="#ffedd5" />
                  <rect x="90" y="94" width="8" height="6" rx="1.5" fill="none" stroke="#0f172a" strokeWidth="1.5" />
                  <rect x="102" y="94" width="8" height="6" rx="1.5" fill="none" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="98" y1="97" x2="102" y2="97" stroke="#0f172a" strokeWidth="1.5" />
                  <path d="M96 107 Q100 111 104 107" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M84 118 L86 165 L114 165 L116 118 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                  <path d="M96 118 L100 126 L104 118" fill="#e2e8f0" />
                  <line x1="100" y1="126" x2="100" y2="165" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="94" y1="165" x2="94" y2="184" stroke="#94a3b8" strokeWidth="2.5" />
                  <line x1="106" y1="165" x2="106" y2="184" stroke="#94a3b8" strokeWidth="2.5" />
                  <ellipse cx="94" cy="184" rx="4" ry="2" fill="#ffffff" stroke="#cbd5e1" />
                  <ellipse cx="106" cy="184" rx="4" ry="2" fill="#ffffff" stroke="#cbd5e1" />
                </g>

                {/* Right Character: Caregiver with green jacket */}
                <g id="caregiver">
                  <path
                    d="M125 88 C132 85, 148 90, 146 112 C146 122, 138 128, 132 128 C135 112, 130 96, 125 88 Z"
                    fill="#0284c7"
                  />
                  <ellipse cx="132" cy="105" rx="14" ry="16" fill="#fed7aa" />
                  <circle cx="127" cy="103" r="1.5" fill="#0f172a" />
                  <circle cx="137" cy="103" r="1.5" fill="#0f172a" />
                  <path d="M128 110 Q132 114 136 110" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M120 124 L124 162 L140 162 L144 124 Z" fill="#86efac" />
                  <path d="M142 126 Q154 116 148 106" stroke="#86efac" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <ellipse cx="148" cy="106" rx="3" ry="3" fill="#fed7aa" />
                  <line x1="128" y1="162" x2="128" y2="182" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="136" y1="162" x2="136" y2="182" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="128" cy="182" rx="4" ry="2" fill="#ffffff" stroke="#cbd5e1" />
                  <ellipse cx="136" cy="182" rx="4" ry="2" fill="#ffffff" stroke="#cbd5e1" />
                </g>
              </svg>
            </div>

            {/* Empty text exactly matching reference screenshot */}
            <p className="text-base font-black text-slate-900 tracking-tight mb-2">
              {activeTab === 'completed' ? '還沒有填寫過問卷！' : '目前沒有未完成的問卷！'}
            </p>
            
            <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-slate-900">
              <span>點擊右上方</span>
              <button
                onClick={() => setShowSelectModal(true)}
                className="w-5 h-5 rounded-full bg-[#f37021] text-white inline-flex items-center justify-center shadow-2xs hover:scale-110 transition-transform cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span>開始吧！</span>
            </div>
          </div>
        ) : (
          /* List of Questionnaires matching IMG_9001.PNG */
          <div className="flex-1 flex flex-col bg-white">
            {/* Month Header Dropdown */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50 cursor-pointer select-none">
              <h2 className="text-[1.0625rem] font-black text-slate-900 tracking-tight">
                {selectedMonth}
              </h2>
              <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                <svg className="w-3.5 h-3.5 fill-slate-400" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-slate-100">
              {currentList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.status === 'completed') {
                      setShowResultScreen(true);
                    } else {
                      setShowLifestyleForm(true);
                    }
                  }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 active:bg-slate-100/70 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center text-[0.9375rem] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                    <span className="mr-3 text-slate-600 font-bold">
                      {item.dateLabel || '8月27日'}
                    </span>
                    <span className="font-bold text-slate-800">
                      {item.title}
                    </span>
                  </div>

                  <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                    <ChevronRight className="w-5 h-5 stroke-[2]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Select Questionnaire Modal (Matching IMG_8998 exactly: Full list with arrows, only 生活型態問卷 enabled) */}
      {showSelectModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end justify-center p-0 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-4 sm:p-5 w-full h-[90vh] shadow-2xl border border-slate-200 flex flex-col animate-in slide-in-from-bottom duration-250">
            {/* Modal Header (Matching IMG_8998: 'X' left, '選擇問卷' center) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 relative min-h-[3rem]">
              <button
                onClick={() => setShowSelectModal(false)}
                className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-900 cursor-pointer active:scale-95 z-10"
              >
                <X className="w-6 h-6 stroke-[2.2]" />
              </button>

              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight text-center absolute inset-x-0 mx-auto pointer-events-none">
                選擇問卷
              </h2>

              <div className="w-8" />
            </div>

            {/* Modal Questionnaires List (Matching IMG_8998 layout and items) */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-1">
              {allSelectableQuestionnaires.map((item) => {
                const isEnabled = item.enabled;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectQuestionnaireItem(item)}
                    className={`flex items-center justify-between py-4 px-2 transition-all ${
                      isEnabled
                        ? 'cursor-pointer hover:bg-orange-50/60 active:bg-orange-100/60 rounded-xl group'
                        : 'opacity-45 cursor-not-allowed select-none'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[0.9375rem] font-black ${
                          isEnabled
                            ? 'text-slate-900 group-hover:text-orange-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {item.title}
                      </span>
                      {isEnabled && (
                        <span className="text-[10px] bg-orange-100 text-orange-700 font-extrabold px-1.5 py-0.2 rounded-md">
                          可填寫
                        </span>
                      )}
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 transition-colors ${
                        isEnabled
                          ? 'text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5'
                          : 'text-slate-300'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
