import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Calendar
} from 'lucide-react';
import {
  MANDATORY_HEART_SYMPTOMS,
  ReportedSymptom,
  VitalsData
} from './heartCareData';

interface Props {
  onBack: () => void;
  onSubmitSymptoms: (vitals: VitalsData, symptoms: ReportedSymptom[], feelingsText?: string) => void;
  existingVitals?: VitalsData;
  existingSymptoms?: ReportedSymptom[];
}

interface SymptomInputState {
  checked: boolean;
  hours: number;
  minutes: number;
  selectedOption: string;
  pillowCount: number;
  nightWakeTime: string;
  nightWakeCount: number;
  edemaSide: '單側' | '雙側';
  edemaPitting: boolean;
  coughType: '乾咳' | '有痰';
}

export const HeartCareQuestionnaire: React.FC<Props> = ({
  onBack,
  onSubmitSymptoms,
  existingVitals,
  existingSymptoms = [],
}) => {
  // 1. Record Date and Time State
  const [selectedDateTime, setSelectedDateTime] = useState<string>(() => {
    const now = new Date();
    const isoStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    return isoStr;
  });
  const [isEditingTime, setIsEditingTime] = useState<boolean>(false);

  // Helper to format ISO datetime
  const getFormattedDateTime = (isoVal: string) => {
    try {
      const dt = new Date(isoVal);
      if (isNaN(dt.getTime())) return isoVal;
      const daysTW = ['日', '一', '二', '三', '四', '五', '六'];
      return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}(${daysTW[dt.getDay()]}) ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return isoVal;
    }
  };

  // 2. Vitals state (inherited from existing or defaults, not edited in this questionnaire)
  const [vitalsForm] = useState<VitalsData>(() => ({
    sysBP: existingVitals?.sysBP ?? 135,
    diaBP: existingVitals?.diaBP ?? 85,
    heartRate: existingVitals?.heartRate ?? 72,
    spO2: existingVitals?.spO2 ?? 96,
    respRate: existingVitals?.respRate ?? 16,
    bodyTemp: existingVitals?.bodyTemp ?? 36.8,
    weight: existingVitals?.weight ?? 65.5,
    weightChange2Days: existingVitals?.weightChange2Days ?? 1.8,
    ecgStatus: existingVitals?.ecgStatus ?? '正常竇性心律，節律規則',
  }));

  // 3. Free Text Feelings Input State
  const [feelingsText, setFeelingsText] = useState<string>('');

  // 4. Initialize Form State for Symptoms 1-15
  const [formState, setFormState] = useState<{ [key: string]: SymptomInputState }>(() => {
    const initial: { [key: string]: SymptomInputState } = {};
    MANDATORY_HEART_SYMPTOMS.forEach((symptom) => {
      const existing = existingSymptoms.find((s) => s.id === symptom.id);
      initial[symptom.id] = {
        checked: !!existing,
        hours: existing ? existing.hours : 0,
        minutes: existing ? existing.minutes : 0,
        selectedOption: symptom.options?.[0] || '',
        pillowCount: 0,
        nightWakeTime: '',
        nightWakeCount: 0,
        edemaSide: '單側',
        edemaPitting: false,
        coughType: '乾咳',
      };
    });
    return initial;
  });

  const toggleCheck = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        checked: !prev[id].checked,
      },
    }));
  };

  const updateField = (id: string, field: keyof SymptomInputState, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const updateHours = (id: string, val: number) => {
    const clamped = Math.max(0, Math.min(72, val));
    updateField(id, 'hours', clamped);
  };

  const updateMinutes = (id: string, val: number) => {
    const clamped = Math.max(0, Math.min(59, val));
    updateField(id, 'minutes', clamped);
  };

  const checkedSymptoms = MANDATORY_HEART_SYMPTOMS.filter((s) => formState[s.id]?.checked);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reportTimeStr = getFormattedDateTime(selectedDateTime);

    const reportedList: ReportedSymptom[] = checkedSymptoms.map((symptom) => {
      const state = formState[symptom.id];
      const details: string[] = [];
      if (state.selectedOption) details.push(`程度: ${state.selectedOption}`);
      if (symptom.hasPillowCount) details.push(`需墊枕頭: ${state.pillowCount} 顆`);
      if (symptom.hasNightWakeDetails) {
        if (state.nightWakeTime) details.push(`時間: ${state.nightWakeTime}`);
        details.push(`次數: ${state.nightWakeCount} 次`);
      }
      if (symptom.hasEdemaDetails) {
        details.push(`水腫部位: ${state.edemaSide}`);
        details.push(`壓痕性: ${state.edemaPitting ? '是' : '否'}`);
      }
      if (symptom.hasCoughTypeDetails) {
        details.push(`類型: ${state.coughType}`);
      }

      return {
        id: symptom.id,
        name: symptom.name,
        severity: symptom.severity,
        hours: state.hours,
        minutes: state.minutes,
        guidelineNote: symptom.guidelineNote,
        educationText: symptom.educationText,
        emergencyWarning: symptom.emergencyWarning,
        reportTime: reportTimeStr,
        selectedOption: state.selectedOption,
        pillowCount: state.pillowCount,
        nightWakeTime: state.nightWakeTime,
        nightWakeCount: state.nightWakeCount,
        edemaSide: state.edemaSide,
        edemaPitting: state.edemaPitting,
        coughType: state.coughType,
        details,
      };
    });

    onSubmitSymptoms(vitalsForm, reportedList, feelingsText);
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] relative font-sans text-slate-900 select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="px-4 py-3 bg-[#ee7326] sticky top-0 z-20 shadow-xs shrink-0">
        <div className="flex items-center justify-between min-h-[3.25rem]">
          <button
            onClick={onBack}
            className="min-w-[44px] min-h-[44px] flex items-center justify-start text-white hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
            aria-label="返回"
          >
            <ArrowLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <h1 className="text-[1.25rem] font-black text-white tracking-tight text-center flex-1">
            每日狀態回報
          </h1>

          <div className="w-[44px]" />
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Record Time Section */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <p className="text-[0.875rem] font-bold text-slate-400 mb-1.5">紀錄時間</p>
          {isEditingTime ? (
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-[#ee7326] rounded-xl text-[1rem] font-bold text-slate-800 focus:outline-none"
              />
              <button
                onClick={() => setIsEditingTime(false)}
                className="px-3.5 py-2 bg-[#ee7326] text-white text-xs font-bold rounded-xl"
              >
                確定
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTime(true)}
              className="flex items-center justify-between text-slate-800 font-bold text-[1.125rem] cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#ee7326]" />
                <span>{getFormattedDateTime(selectedDateTime)}</span>
              </div>
              <ArrowRight className="w-6 h-6 text-[#ee7326] stroke-[2.5]" />
            </div>
          )}
        </div>

        {/* Free Text Input for Feelings */}
        <div className="px-4 pt-4 pb-3 bg-white border-b border-slate-100 space-y-2">
          <p className="text-[0.875rem] font-bold text-slate-500">記錄您的感受 (自由填寫內容)</p>
          <textarea
            value={feelingsText}
            onChange={(e) => setFeelingsText(e.target.value)}
            placeholder="請自由輸入您的身體感受、食慾、睡覺感受或特別補充事項..."
            rows={3}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[0.9375rem] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ee7326] focus:bg-white transition-all resize-none font-medium"
          />
        </div>

        {/* Symptom Checklist (Items 1 through 15) */}
        <div className="p-4 bg-[#fdfbf7]">
          <p className="text-[1rem] font-bold text-slate-800 mb-2">每日症狀自我檢測 (15 項症狀勾選)</p>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
            {MANDATORY_HEART_SYMPTOMS.map((symptom) => {
              const state = formState[symptom.id] || {
                checked: false,
                hours: 0,
                minutes: 0,
                selectedOption: symptom.options?.[0] || '',
                pillowCount: 0,
                nightWakeTime: '',
                nightWakeCount: 0,
                edemaSide: '單側',
                edemaPitting: false,
                coughType: '乾咳',
              };
              const isChecked = state.checked;

              return (
                <div key={symptom.id} className="transition-colors">
                  <div
                    onClick={() => toggleCheck(symptom.id)}
                    className="flex items-center gap-4 px-4 py-3.5 cursor-pointer min-h-[52px] hover:bg-orange-50/20"
                  >
                    <div
                      className={`w-6 h-6 rounded-xs border-2 flex items-center justify-center shrink-0 transition-all ${
                        isChecked
                          ? 'bg-[#ee7326] border-[#ee7326] text-white'
                          : 'border-[#ee7326] bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <span className="font-bold text-[1.0625rem] text-slate-900 flex-1">
                      {symptom.name}
                    </span>
                  </div>

                  {isChecked && (
                    <div className="px-4 pb-5 pt-2 bg-[#fdfbf7] space-y-3">
                      {symptom.options && symptom.options.length > 0 && (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[0.875rem]">
                            <Info className="w-4 h-4 text-[#ee7326]" />
                            <span>請選擇符合您目前的症狀程度：</span>
                          </div>
                          <div className="space-y-2">
                            {symptom.options.map((opt) => (
                              <div
                                key={opt}
                                onClick={() => updateField(symptom.id, 'selectedOption', opt)}
                                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                                  state.selectedOption === opt
                                    ? 'border-[#ee7326] bg-orange-50/20 font-bold text-slate-900'
                                    : 'border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    state.selectedOption === opt ? 'border-[#ee7326]' : 'border-slate-300'
                                  }`}
                                >
                                  {state.selectedOption === opt && (
                                    <div className="w-2 h-2 rounded-full bg-[#ee7326]" />
                                  )}
                                </div>
                                <span className="text-[0.875rem]">{opt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 需墊枕頭幾顆細節 */}
                      {symptom.hasPillowCount && (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2 shadow-xs">
                          <span className="text-slate-800 font-bold text-[0.875rem]">🛌 需墊高枕頭數量：</span>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={state.pillowCount || 1}
                              onChange={(e) => updateField(symptom.id, 'pillowCount', parseInt(e.target.value) || 1)}
                              className="w-20 p-2 border border-slate-200 rounded-xl text-center font-bold text-slate-900 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#ee7326]"
                            />
                            <span className="text-[0.875rem] font-bold text-slate-600">顆枕頭</span>
                          </div>
                        </div>
                      )}

                      {/* 夜間喘醒細節 */}
                      {symptom.hasNightWakeDetails && (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-3 shadow-xs">
                          <span className="text-slate-800 font-bold text-[0.875rem]">🌃 請輸入發生時間與次數：</span>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[0.75rem] font-bold text-slate-500 block mb-1">發生時間</label>
                              <input
                                type="text"
                                value={state.nightWakeTime}
                                onChange={(e) => updateField(symptom.id, 'nightWakeTime', e.target.value)}
                                placeholder="如：凌晨 2 點"
                                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-[0.875rem] font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#ee7326]"
                              />
                            </div>
                            <div>
                              <label className="text-[0.75rem] font-bold text-slate-500 block mb-1">次數 (次)</label>
                              <input
                                type="number"
                                min="0"
                                value={state.nightWakeCount}
                                onChange={(e) => updateField(symptom.id, 'nightWakeCount', parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-[0.875rem] font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#ee7326]"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 水腫部位細節 */}
                      {symptom.hasEdemaDetails && (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-3 shadow-xs">
                          <span className="text-slate-800 font-bold text-[0.875rem]">🦶 水腫部位與壓痕性：</span>
                          <div className="grid grid-cols-2 gap-3">
                            {(['單側', '雙側'] as const).map((side) => (
                              <button
                                key={side}
                                type="button"
                                onClick={() => updateField(symptom.id, 'edemaSide', side)}
                                className={`py-2 px-3 rounded-xl font-bold text-[0.875rem] border transition-all cursor-pointer ${
                                  state.edemaSide === side
                                    ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {side}
                              </button>
                            ))}
                          </div>
                          <div className="pt-1">
                            <label
                              onClick={() => updateField(symptom.id, 'edemaPitting', !state.edemaPitting)}
                              className="flex items-center gap-2 cursor-pointer font-bold text-[0.8125rem] text-slate-800 select-none"
                            >
                              <div
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                  state.edemaPitting
                                    ? 'bg-[#ee7326] border-[#ee7326] text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {state.edemaPitting && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span>有壓痕性 (壓下去不會馬上彈回來)</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* 咳嗽類型 */}
                      {symptom.hasCoughTypeDetails && (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-3 shadow-xs">
                          <span className="text-slate-800 font-bold text-[0.875rem]">🗣️ 咳嗽類型：</span>
                          <div className="grid grid-cols-2 gap-3">
                            {(['乾咳', '有痰'] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => updateField(symptom.id, 'coughType', type)}
                                className={`py-2 px-3 rounded-xl font-bold text-[0.875rem] border transition-all cursor-pointer ${
                                  state.coughType === type
                                    ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Duration */}
                      <div className="bg-[#fdfbf7] border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between flex-wrap gap-2 shadow-xs">
                        <span className="text-slate-800 font-bold text-[0.875rem]">持續時間：</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-xl px-2.5 py-1 bg-white">
                            <input
                              type="number"
                              min="0"
                              max="72"
                              value={state.hours}
                              onChange={(e) => updateHours(symptom.id, parseInt(e.target.value) || 0)}
                              className="w-8 text-center font-bold text-slate-900 bg-transparent focus:outline-none"
                            />
                            <span className="text-[0.8125rem] font-medium text-slate-500 ml-1">小時</span>
                          </div>
                          <div className="flex items-center border border-slate-200 rounded-xl px-2.5 py-1 bg-white">
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={state.minutes}
                              onChange={(e) => updateMinutes(symptom.id, parseInt(e.target.value) || 0)}
                              className="w-8 text-center font-bold text-slate-900 bg-transparent focus:outline-none"
                            />
                            <span className="text-[0.8125rem] font-medium text-slate-500 ml-1">分鐘</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-20" />
      </div>

      {/* Solid Orange Bottom Upload Button */}
      <div className="p-0 bg-white border-t border-slate-200 sticky bottom-0 z-20 shrink-0">
        <button
          onClick={handleSubmit}
          className="w-full h-[56px] bg-[#ee7326] text-white text-[1.25rem] font-bold hover:bg-[#d6611a] active:bg-[#c45514] transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
        >
          上傳
        </button>
      </div>
    </div>
  );
};
