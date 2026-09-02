import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  title?: string;
  dateLabel?: string;
  completedDate?: string;
  submittedGoals?: string[];
}

const goalDetailsMap: Record<string, { label: string; desc: string; icon: string }> = {
  '運動習慣': {
    label: '運動習慣',
    desc: '規律有氧、肌力訓練與日常身體活動維持',
    icon: '🏃',
  },
  '飲食習慣': {
    label: '飲食習慣',
    desc: '地中海飲食模式、少糖低鈉與均衡全穀攝取',
    icon: '🥗',
  },
  '睡眠品質': {
    label: '睡眠品質',
    desc: '改善入睡困難、睡眠中斷與養成規律作息',
    icon: '🌙',
  },
  '壓力管理': {
    label: '壓力管理',
    desc: '身心放鬆技巧、呼吸調節與自律神經平衡',
    icon: '🧘',
  },
  '戒菸／戒酒／戒檳榔': {
    label: '戒菸／戒酒／戒檳榔',
    desc: '成癮物質戒斷、健康生活替代策略',
    icon: '🚭',
  },
  '戒菸 / 戒酒 / 戒檳榔': {
    label: '戒菸／戒酒／戒檳榔',
    desc: '成癮物質戒斷、健康生活替代策略',
    icon: '🚭',
  },
  '避免危害物質使用': {
    label: '戒菸／戒酒／戒檳榔 (避免危害物質使用)',
    desc: '成癮物質戒斷、健康生活替代策略',
    icon: '🚭',
  },
  '增加人際互動': {
    label: '增加人際互動',
    desc: '提升大腦認知防失智、社群互動交流',
    icon: '👥',
  },
};

export const QuestionnaireResultScreen: React.FC<Props> = ({
  onClose,
  title = '生活型態問卷',
  dateLabel = '2026/08/27',
  completedDate = '2026/08/27 10:30',
  submittedGoals = ['運動習慣', '飲食習慣'],
}) => {
  const displayGoals = submittedGoals.length > 0 ? submittedGoals : ['運動習慣', '飲食習慣'];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-md mx-auto h-full animate-in fade-in duration-200">
      {/* 1. Header (Reference IMG_9002) */}
      <div className="bg-white border-b border-slate-100 px-4 pt-12 pb-3 flex items-center justify-between shrink-0 shadow-2xs">
        <button
          onClick={onClose}
          className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="關閉"
        >
          <X className="w-6 h-6 stroke-[2]" />
        </button>

        <h1 className="text-[1.0625rem] font-black text-slate-900 tracking-tight">
          {title}
        </h1>

        <div className="w-6" />
      </div>

      {/* 2. Top Tab Bar (Results view) */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center">
          <div className="flex-1 py-3 text-center text-[0.9375rem] font-black text-[#f37021] relative">
            <span>結果</span>
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#f37021]" />
          </div>
        </div>
      </div>

      {/* 3. Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 pb-10">
        {/* Top Summary Banner */}
        <div className="bg-white pt-6 pb-5 px-6 text-center border-b border-slate-100 space-y-3">
          <div className="space-y-0.5">
            <div className="text-4xl font-black text-emerald-500 tracking-tight flex items-center justify-center gap-1.5">
              <span>{displayGoals.length}</span>
              <span className="text-xl font-bold text-emerald-600">項改善面向</span>
            </div>
            <p className="text-xs font-bold text-slate-400 tracking-wider">
              生活型態醫學評估結果
            </p>
          </div>

          {/* Green Status Box with avatar matching IMG_9002 */}
          <div className="bg-emerald-50/70 border border-emerald-300/80 rounded-2xl p-3.5 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs text-xl">
              👩‍⚕️
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-emerald-900 leading-tight">
                已建檔，處方已由醫師制定中
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                填寫時間：{completedDate}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            ※量表結果僅做為參考使用，亦非臨床診斷。
          </p>
        </div>

        {/* Question Details List (Reference IMG_9002) */}
        <div className="bg-white divide-y divide-slate-100 border-b border-slate-200/80">
          <div className="p-5 space-y-3">
            <h2 className="text-[0.9375rem] font-black text-slate-900 leading-snug">
              1. 您目前最希望由醫師與專家協助改善的生活型態面向為何？
            </h2>

            <div className="space-y-2.5 pt-1">
              {displayGoals.map((goalKey, idx) => {
                const info = goalDetailsMap[goalKey] || {
                  label: goalKey,
                  desc: '生活型態醫學專業評估項目',
                  icon: '🌿',
                };
                return (
                  <div
                    key={goalKey}
                    className="flex items-start gap-3 bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5"
                  >
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-[#f37021] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm">
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {info.desc}
                      </p>
                    </div>
                    <span className="shrink-0 text-emerald-600 font-black text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      已選取
                    </span>
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
