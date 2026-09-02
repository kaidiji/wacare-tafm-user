import React, { useState } from 'react';
import { X, CheckSquare, Square, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onBack: () => void;
  onSubmit: (goals: string[]) => void;
  initialGoals?: string[];
}

export const LifestyleQuestionnaireFormScreen: React.FC<Props> = ({
  onBack,
  onSubmit,
  initialGoals = [],
}) => {
  // Page step: 1 (Instruction / Revised Date) or 2 (Questions Form)
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);

  // Selected goals state
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    initialGoals.length > 0 ? initialGoals : []
  );

  // Completed submission modal state
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);

  const QUESTIONNAIRE_OPTIONS = [
    {
      id: 'opt-1',
      label: '運動習慣',
      icon: '🏃‍♂️',
      desc: '提升肌力與心肺耐力、防跌與下肢訓練',
      details: '每週運動頻率、有氧與肌力阻抗訓練、久坐活動改善',
    },
    {
      id: 'opt-2',
      label: '飲食習慣',
      icon: '🥗',
      desc: '低GI健康飲食、體脂與健腦營養管理',
      details: '地中海飲食原則、每日彩虹蔬果攝取、少加工少精緻糖',
    },
    {
      id: 'opt-3',
      label: '睡眠品質',
      icon: '🌙',
      desc: '改善夜尿中斷、建立深度好眠規律',
      details: '規律就寢週期、改善入睡障礙、營造優質睡眠環境',
    },
    {
      id: 'opt-4',
      label: '壓力管理',
      icon: '🧘',
      desc: '自律神經調節、放鬆減壓與大腦賦能',
      details: '腹式呼吸放鬆訓練、日常情緒察覺、減輕慢性焦慮疲憊',
    },
    {
      id: 'opt-5',
      label: '戒菸／戒酒／戒檳榔',
      icon: '🚭',
      desc: '成癮物質戒斷、健康生活替代策略',
      details: '戒菸與減害諮詢、健康生活替代策略、心血管健康保護',
    },
    {
      id: 'opt-6',
      label: '增加人際互動',
      icon: '👥',
      desc: '提升大腦認知防失智、社群互動交流',
      details: '多元社交連結、線上志工與互動交流、活化大腦心智',
    },
  ];

  const handleToggleGoal = (label: string) => {
    setSelectedGoals((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleFinalSubmit = () => {
    if (selectedGoals.length === 0) return;
    setShowSubmittedModal(true);
  };

  const handleConfirmFinish = () => {
    setShowSubmittedModal(false);
    onSubmit(selectedGoals);
  };

  return (
    <div className="flex flex-col h-full bg-white relative font-sans antialiased text-slate-900 select-none">
      {/* 1. Header (Matching reference IMG_8996 & IMG_8997: Close 'X' and Title '生活型態問卷') */}
      <header className="pt-2 px-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center justify-between min-h-[3.25rem] relative">
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-900 transition-colors cursor-pointer active:scale-95 z-10"
            title="關閉"
          >
            <X className="w-6 h-6 stroke-[2.2]" />
          </button>

          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight text-center absolute inset-x-0 mx-auto pointer-events-none">
            生活型態問卷
          </h1>

          <div className="w-8" />
        </div>

        {/* 2. Step Indicator Bar (Matching IMG_8996 / IMG_8997: Orange active circle number + grey circle) */}
        <div className="flex items-center gap-2 py-2 px-2">
          {/* Step 1 indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                currentPage === 1
                  ? 'bg-[#f37021] text-white shadow-2xs'
                  : 'bg-[#f37021] text-white'
              }`}
            >
              {currentPage === 1 ? '1' : '✓'}
            </span>
          </div>

          {/* Step 2 indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                currentPage === 2
                  ? 'bg-[#f37021] text-white shadow-2xs'
                  : 'w-2.5 h-2.5 rounded-full bg-slate-300'
              }`}
            >
              {currentPage === 2 ? '2' : ''}
            </span>
          </div>
        </div>
      </header>

      {/* 3. Main Content based on currentPage */}
      <div className="flex-1 overflow-y-auto bg-white p-5">
        {currentPage === 1 ? (
          /* PAGE 1: 说明 + 修訂日期：2026/08/27 (Matching reference) */
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">說明</h2>
            
            {/* Red font revised date matching image: 修訂日期：2026/08/27 */}
            <div className="text-sm font-bold text-red-600">
              修訂日期：2026/08/27
            </div>

            <div className="pt-2 text-sm text-slate-700 leading-relaxed">
              <p>
                請根據您目前的日常生活狀態與最希望改善的健康目標進行勾選，醫師與健康專家團隊將依據您的填寫結果開立專屬「綠色處方」。
              </p>
            </div>
          </div>
        ) : (
          /* PAGE 2: Questionnaire Questions Format (Matching IMG_8997) */
          <div className="space-y-6 pb-6">
            {/* Question 1: Multiple choice lifestyle goals (必填) */}
            <div className="space-y-3">
              <div className="text-sm font-black text-slate-900 leading-snug flex items-start justify-between">
                <span>
                  1. 您目前最希望由醫師與專家協助改善的生活型態面向為何？（可複選）
                </span>
                <span className="text-red-600 text-xs font-black shrink-0 ml-1">
                  (必填)
                </span>
              </div>

              <div className="space-y-2.5">
                {QUESTIONNAIRE_OPTIONS.map((item) => {
                  const isChecked = selectedGoals.includes(item.label);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleGoal(item.label)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-orange-50/70 border-[#f37021] text-slate-900 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isChecked ? (
                          <div className="w-5 h-5 rounded-md bg-[#f37021] text-white flex items-center justify-center shrink-0">
                            <CheckSquare className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white flex items-center justify-center shrink-0">
                            <Square className="w-4 h-4 text-transparent" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-black flex items-center gap-1.5 text-slate-900">
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Action Buttons Bar (Matching IMG_8996 & IMG_8997) */}
      <footer className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20 shadow-lg">
        {currentPage === 1 ? (
          /* Page 1 Bottom: Orange "下一頁" button (IMG_8996) */
          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className="w-full py-3.5 bg-[#f37021] hover:bg-orange-600 active:scale-98 text-white font-black text-base rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>下一頁</span>
          </button>
        ) : (
          /* Page 2 Bottom: "上一頁" (orange text link) & "送出" button (IMG_8997) */
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="py-3 px-4 text-[#f37021] hover:text-orange-700 font-black text-base cursor-pointer active:scale-95 transition-colors shrink-0"
            >
              上一頁
            </button>
            <button
              type="button"
              disabled={selectedGoals.length === 0}
              onClick={handleFinalSubmit}
              className={`flex-1 py-3.5 rounded-2xl font-black text-base transition-all cursor-pointer shadow-sm ${
                selectedGoals.length > 0
                  ? 'bg-[#f37021] hover:bg-orange-600 text-white active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              送出
            </button>
          </div>
        )}
      </footer>

      {/* Completion Confirmation Modal */}
      {showSubmittedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden p-5 text-center space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">
                問卷已成功送出
              </span>
              <h3 className="text-base font-black text-slate-900">
                已完成，待專家指派處方
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed px-1">
                示範診所團隊已收到您的目標需求，專家將為您分析並開立專屬綠色處方與行動任務！
              </p>
            </div>

            <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-2.5 text-left space-y-1">
              <span className="text-[10px] font-bold text-orange-800 block">
                ✓ 您所選取的改善面向：
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedGoals.map((g) => (
                  <span
                    key={g}
                    className="text-[10px] bg-orange-200 text-orange-950 font-black px-1.5 py-0.2 rounded"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmFinish}
              className="w-full py-3 bg-[#f37021] hover:bg-orange-600 text-white font-black text-sm rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              確認並完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
