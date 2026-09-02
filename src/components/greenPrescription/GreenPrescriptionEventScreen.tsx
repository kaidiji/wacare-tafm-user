import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Stethoscope,
  HeartPulse,
  Activity,
  Check,
  X
} from 'lucide-react';
import { ScreenId } from '../../types';
import { FamilyMedicineLogo, WaCareLogo } from './PartnerLogos';
import { GreenPrescriptionConsentModal } from './GreenPrescriptionConsentModal';
import { LifestyleQuestionnaireFormScreen } from '../LifestyleQuestionnaireFormScreen';

interface Props {
  onBack: () => void;
  onCompleteAndReturnToChat: (goals: string[]) => void;
  isConsentCompleted: boolean;
  onSetConsentCompleted: (completed: boolean) => void;
  isQuestionnaireSubmitted: boolean;
  submittedGoals: string[];
  onDispatchPrescription?: (goals?: string[]) => void;
}

export const GreenPrescriptionEventScreen: React.FC<Props> = ({
  onBack,
  onCompleteAndReturnToChat,
  isConsentCompleted,
  onSetConsentCompleted,
  isQuestionnaireSubmitted,
  submittedGoals,
  onDispatchPrescription,
}) => {
  // Modal states
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [showLifestyleFormScreen, setShowLifestyleFormScreen] = useState(false);

  // Questionnaire selection state
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    submittedGoals.length > 0 ? submittedGoals : []
  );

  const handleOpenQuestionnaire = () => {
    // If consent is not completed, we can open consent first or notify
    if (!isConsentCompleted) {
      setIsConsentModalOpen(true);
      return;
    }
    setShowLifestyleFormScreen(true);
  };

  const handleFinishQuestionnaire = (goals: string[]) => {
    setSelectedGoals(goals);
    setShowLifestyleFormScreen(false);
    onCompleteAndReturnToChat(goals);
  };

  if (showLifestyleFormScreen) {
    return (
      <LifestyleQuestionnaireFormScreen
        onBack={() => setShowLifestyleFormScreen(false)}
        onSubmit={handleFinishQuestionnaire}
        initialGoals={selectedGoals}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans antialiased text-slate-900 select-none overflow-hidden">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between shadow-2xs z-10">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer active:scale-95"
          aria-label="返回訊息"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base font-black text-slate-900 tracking-tight">
          綠色處方活動專屬頁
        </h1>

        <div className="w-8" />
      </header>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-8">
        
        {/* 1. Partner Header Banner (Taiwan Association of Family Medicine & WaCare) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3.5 relative overflow-hidden">
          {/* Top Row: Tag on left, Dual Partner Logos on top right */}
          <div className="flex items-start justify-between gap-2">
            <div className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md text-[10px] font-black">
              <span>🌿 健康台灣深耕計畫</span>
            </div>

            {/* Compact Logos in Top-Right */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 shrink-0">
              <FamilyMedicineLogo className="w-6 h-6 shrink-0 drop-shadow-2xs" />
              <div className="h-4 w-px bg-slate-200" />
              <WaCareLogo className="h-4 w-auto shrink-0" />
            </div>
          </div>

          {/* Program Title & Introduction */}
          <div className="space-y-1.5">
            <h2 className="text-base font-black text-slate-900 leading-snug tracking-tight">
              綠色家庭醫學推動計畫
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              結合智慧科技健康促進處方訓練，由家庭醫師實踐 <span className="font-bold text-teal-700">ESG 導向永續健康創新照護模式</span>。透過非藥物的生活型態介入，協助您建立規律運動、均衡營養、舒眠與減壓習慣。
            </p>
          </div>

          {/* 3 Core Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-2 text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto text-xs">
                👨‍⚕️
              </div>
              <div className="text-[11px] font-black text-teal-900">醫師專業評估</div>
              <div className="text-[9px] text-teal-700 font-medium">量身生活指引</div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2 text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs">
                🌿
              </div>
              <div className="text-[11px] font-black text-emerald-900">綠色處方影音</div>
              <div className="text-[9px] text-emerald-700 font-medium">核心衛教課程</div>
            </div>

            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2 text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto text-xs">
                📱
              </div>
              <div className="text-[11px] font-black text-amber-900">智慧數據追蹤</div>
              <div className="text-[9px] text-amber-700 font-medium">成效即時掌握</div>
            </div>
          </div>
        </div>

        {/* 2. Process Section Title */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
            參與計畫流程（共兩個步驟）
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {isConsentCompleted && isQuestionnaireSubmitted
              ? '全部已完成 2/2'
              : isConsentCompleted
              ? '已完成 1/2'
              : '進行中 0/2'}
          </span>
        </div>

        {/* 3. STEP 1: CONSENT FORM (填寫同意書) */}
        <div
          className={`rounded-2xl p-4 border transition-all ${
            isConsentCompleted
              ? 'bg-slate-50/80 border-slate-200 opacity-90'
              : 'bg-white border-teal-200 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                  isConsentCompleted
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-teal-700 text-white shadow-2xs'
                }`}
              >
                {isConsentCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">
                    步驟一：填寫個人資料授權同意書
                  </h4>
                  {isConsentCompleted && (
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                      已同意
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  請詳閱個人資料利用暨授權同意書，完成去識別化健康數據授權以參與計畫。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-medium">
              {isConsentCompleted ? '✓ 已完成條款簽署' : '⚠️ 請滑至底端後勾選同意'}
            </div>

            {/* BUTTON 1: "點擊前往" (Becomes disabled/greyed out when completed) */}
            <button
              type="button"
              disabled={isConsentCompleted}
              onClick={() => setIsConsentModalOpen(true)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 ${
                isConsentCompleted
                  ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-teal-700 hover:bg-teal-800 text-white active:scale-95 cursor-pointer'
              }`}
            >
              {isConsentCompleted ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已完成</span>
                </>
              ) : (
                <>
                  <span>點擊前往</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. STEP 2: LIFESTYLE QUESTIONNAIRE (填寫生活型態問券) */}
        <div
          className={`rounded-2xl p-4 border transition-all ${
            isQuestionnaireSubmitted
              ? 'bg-slate-50/80 border-slate-200'
              : !isConsentCompleted
              ? 'bg-white border-slate-200 opacity-85'
              : 'bg-white border-orange-200 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                  isQuestionnaireSubmitted
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : isConsentCompleted
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isQuestionnaireSubmitted ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">
                    步驟二：填寫生活型態問券
                  </h4>
                  {isQuestionnaireSubmitted && (
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                      已完成
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  勾選您目前最想改善的生活面向（運動、飲食、睡眠、減壓等），醫師將為您派發對應處方。
                </p>
              </div>
            </div>
          </div>

          {/* Selected Goals tags if already submitted */}
          {selectedGoals.length > 0 && (
            <div className="mt-2.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">
                📌 目前關注面向：
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedGoals.map((g) => (
                  <span
                    key={g}
                    className="text-[10px] bg-teal-100 text-teal-800 font-extrabold px-2 py-0.5 rounded border border-teal-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-medium">
              {!isConsentCompleted
                ? '請先完成步驟一'
                : isQuestionnaireSubmitted
                ? '✓ 問卷已送達診所'
                : '可複選多個面向'}
            </div>

            {/* BUTTON 2: "填寫問券" */}
            <button
              type="button"
              onClick={handleOpenQuestionnaire}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                !isConsentCompleted
                  ? 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                  : isQuestionnaireSubmitted
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isQuestionnaireSubmitted ? '重新填寫問券' : '填寫問券'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Modal 1: Consent Form Modal */}
      <GreenPrescriptionConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onConsentComplete={() => onSetConsentCompleted(true)}
      />
    </div>
  );
};
