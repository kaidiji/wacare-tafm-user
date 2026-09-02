import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Check,
  X,
  Info,
  Clock,
  MessageSquare,
} from 'lucide-react';
import {
  HeartCareState,
  ReportedSymptom,
  MANDATORY_HEART_SYMPTOMS,
} from './heartCareData';

export interface SymptomDetailData {
  id: string;
  name: string;
  severity: 'yellow' | 'red' | 'normal';
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

export interface DailyStatusRecord {
  dateStr: string; // "YYYY-MM-DD" e.g. "2026-08-18"
  formattedDisplayDate: string; // "2026 年 8 月 18 日"
  slashDate: string; // "2026/08/18"
  noSymptoms: boolean; // true if "無特別狀況"
  selectedSymptomIds: string[]; // list of symptom IDs
  symptomsDetails: Record<string, SymptomDetailData>;
  feelingsText: string;
  reportedAt: string; // e.g. "11:48"
}

// Symptom checklist configuration
export interface HeartSymptomConfig {
  id: string;
  name: string;
  severity: 'yellow' | 'red' | 'normal';
  guidelineNote?: string;
  educationText?: string;
  emergencyWarning?: string;
  options?: string[];
  hasPillowCount?: boolean;
  hasNightWakeDetails?: boolean;
  hasEdemaDetails?: boolean;
  hasCoughTypeDetails?: boolean;
}

export const ALL_HEART_SYMPTOMS: HeartSymptomConfig[] = [
  {
    id: 'none',
    name: '無特別狀況',
    severity: 'normal',
  },
  ...MANDATORY_HEART_SYMPTOMS.map((s) => ({
    id: s.id,
    name: s.name,
    severity: s.severity,
    guidelineNote: s.guidelineNote,
    educationText: s.educationText,
    emergencyWarning: s.emergencyWarning,
    options: s.options,
    hasPillowCount: s.hasPillowCount,
    hasNightWakeDetails: s.hasNightWakeDetails,
    hasEdemaDetails: s.hasEdemaDetails,
    hasCoughTypeDetails: s.hasCoughTypeDetails,
  })),
];

interface Props {
  onBack: () => void;
  heartCareState: HeartCareState;
  onUpdateHeartCareState: (newState: HeartCareState) => void;
}

export const DailyStatusReportScreen: React.FC<Props> = ({
  onBack,
  heartCareState,
  onUpdateHeartCareState,
}) => {
  // Today definition: August 18, 2026
  const TODAY = useMemo(() => new Date(2026, 7, 18), []);
  const todayDateStr = '2026-08-18';

  // Sub-screens: 'calendar' | 'view_record' | 'edit_record'
  const [currentView, setCurrentView] = useState<'calendar' | 'view_record' | 'edit_record'>('calendar');

  // Currently selected date in calendar
  const [selectedDate, setSelectedDate] = useState<Date>(TODAY);

  // Month navigation in calendar
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(7); // 0-indexed: 7 is August

  // Toast notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper to create initial default detail for a symptom
  const createDefaultDetail = (id: string, name: string, severity: 'yellow' | 'red' | 'normal'): SymptomDetailData => {
    const found = MANDATORY_HEART_SYMPTOMS.find((s) => s.id === id);
    return {
      id,
      name,
      severity,
      hours: 0,
      minutes: 0,
      selectedOption: found?.options?.[0] || '',
      pillowCount: 1,
      nightWakeTime: '',
      nightWakeCount: 1,
      edemaSide: '單側',
      edemaPitting: false,
      coughType: '乾咳',
    };
  };

  // Store of all daily records: keyed by "YYYY-MM-DD"
  const [recordsMap, setRecordsMap] = useState<Record<string, DailyStatusRecord>>(() => {
    const map: Record<string, DailyStatusRecord> = {};

    // If heartCareState already has symptoms, seed today's record
    if (heartCareState.reportedSymptoms && heartCareState.reportedSymptoms.length > 0) {
      const details: Record<string, SymptomDetailData> = {};
      heartCareState.reportedSymptoms.forEach((s) => {
        details[s.id] = {
          id: s.id,
          name: s.name,
          severity: s.severity,
          hours: s.hours || 0,
          minutes: s.minutes || 0,
          selectedOption: s.selectedOption || '',
          pillowCount: s.pillowCount || 1,
          nightWakeTime: s.nightWakeTime || '',
          nightWakeCount: s.nightWakeCount || 1,
          edemaSide: (s.edemaSide as '單側' | '雙側') || '單側',
          edemaPitting: !!s.edemaPitting,
          coughType: (s.coughType as '乾咳' | '有痰') || '乾咳',
        };
      });

      map[todayDateStr] = {
        dateStr: todayDateStr,
        formattedDisplayDate: '2026 年 8 月 18 日',
        slashDate: '2026/08/18',
        noSymptoms: false,
        selectedSymptomIds: heartCareState.reportedSymptoms.map((s) => s.id),
        symptomsDetails: details,
        feelingsText: heartCareState.feelingsText || '',
        reportedAt: heartCareState.lastReportTime || '11:48',
      };
    }
    return map;
  });

  // Editing form symptom selection state
  const [editingSelectedSymptomIds, setEditingSelectedSymptomIds] = useState<string[]>([]);
  const [editingDetails, setEditingDetails] = useState<Record<string, SymptomDetailData>>({});
  const [editingFeelingsText, setEditingFeelingsText] = useState<string>('');

  // Format date helper: YYYY-MM-DD
  const getDateStr = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Format date helper: YYYY/MM/DD
  const getSlashDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  };

  // Format date helper: YYYY 年 M 月 D 日
  const getFormattedDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y} 年 ${m} 月 ${day} 日`;
  };

  const selectedDateStr = getDateStr(selectedDate);
  const existingRecordForSelectedDate = recordsMap[selectedDateStr];

  // Helper to open Edit Mode
  const handleOpenEdit = (date: Date) => {
    const dStr = getDateStr(date);
    const existing = recordsMap[dStr];
    if (existing) {
      setEditingSelectedSymptomIds(existing.selectedSymptomIds);
      setEditingDetails({ ...existing.symptomsDetails });
      setEditingFeelingsText(existing.feelingsText || '');
    } else {
      setEditingSelectedSymptomIds([]);
      setEditingDetails({});
      setEditingFeelingsText('');
    }
    setCurrentView('edit_record');
  };

  // Helper to toggle symptom checkbox
  const handleToggleSymptom = (symptomId: string) => {
    if (symptomId === 'none') {
      if (editingSelectedSymptomIds.includes('none')) {
        setEditingSelectedSymptomIds([]);
      } else {
        setEditingSelectedSymptomIds(['none']);
        setEditingDetails({});
      }
      return;
    }

    setEditingSelectedSymptomIds((prev) => {
      const filtered = prev.filter((id) => id !== 'none');
      if (filtered.includes(symptomId)) {
        return filtered.filter((id) => id !== symptomId);
      } else {
        // Initialize symptom details if not already present
        const symptomConfig = ALL_HEART_SYMPTOMS.find((s) => s.id === symptomId);
        if (symptomConfig && !editingDetails[symptomId]) {
          setEditingDetails((d) => ({
            ...d,
            [symptomId]: createDefaultDetail(symptomId, symptomConfig.name, symptomConfig.severity),
          }));
        }
        return [...filtered, symptomId];
      }
    });
  };

  // Update specific field in symptom detail
  const handleUpdateDetailField = (
    symptomId: string,
    field: keyof SymptomDetailData,
    value: any
  ) => {
    setEditingDetails((prev) => {
      const current = prev[symptomId] || createDefaultDetail(
        symptomId,
        ALL_HEART_SYMPTOMS.find((s) => s.id === symptomId)?.name || symptomId,
        ALL_HEART_SYMPTOMS.find((s) => s.id === symptomId)?.severity || 'yellow'
      );
      return {
        ...prev,
        [symptomId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  // Save/Update Daily Status Record
  const handleSaveRecord = () => {
    const isNone = editingSelectedSymptomIds.includes('none') || editingSelectedSymptomIds.length === 0;
    const finalSelectedIds = isNone ? ['none'] : editingSelectedSymptomIds;

    const finalDetails: Record<string, SymptomDetailData> = {};
    if (!isNone) {
      finalSelectedIds.forEach((id) => {
        const config = ALL_HEART_SYMPTOMS.find((s) => s.id === id);
        if (config) {
          finalDetails[id] = editingDetails[id] || createDefaultDetail(id, config.name, config.severity);
        }
      });
    }

    const nowTimeStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });

    const newRecord: DailyStatusRecord = {
      dateStr: selectedDateStr,
      formattedDisplayDate: getFormattedDate(selectedDate),
      slashDate: getSlashDate(selectedDate),
      noSymptoms: isNone,
      selectedSymptomIds: finalSelectedIds,
      symptomsDetails: finalDetails,
      feelingsText: editingFeelingsText,
      reportedAt: nowTimeStr,
    };

    setRecordsMap((prev) => ({
      ...prev,
      [selectedDateStr]: newRecord,
    }));

    // If today is updated, sync back to heartCareState
    if (selectedDateStr === todayDateStr) {
      const mappedSymptoms: ReportedSymptom[] = isNone
        ? []
        : finalSelectedIds.map((id) => {
            const detail = finalDetails[id] || createDefaultDetail(id, id, 'yellow');
            const found = MANDATORY_HEART_SYMPTOMS.find((s) => s.id === id);
            const detailStrings: string[] = [];
            if (detail.selectedOption) detailStrings.push(`程度: ${detail.selectedOption}`);
            if (found?.hasPillowCount) detailStrings.push(`需墊枕頭: ${detail.pillowCount} 顆`);
            if (found?.hasNightWakeDetails) {
              if (detail.nightWakeTime) detailStrings.push(`時間: ${detail.nightWakeTime}`);
              detailStrings.push(`次數: ${detail.nightWakeCount} 次`);
            }
            if (found?.hasEdemaDetails) {
              detailStrings.push(`部位: ${detail.edemaSide}`);
              detailStrings.push(`壓痕: ${detail.edemaPitting ? '有' : '無'}`);
            }
            if (found?.hasCoughTypeDetails) {
              detailStrings.push(`類型: ${detail.coughType}`);
            }

            return {
              id,
              name: detail.name,
              severity: detail.severity === 'normal' ? 'yellow' : detail.severity,
              hours: detail.hours,
              minutes: detail.minutes,
              educationText: found?.educationText || '',
              emergencyWarning: found?.emergencyWarning || '',
              reportTime: `今日 ${nowTimeStr}`,
              selectedOption: detail.selectedOption,
              pillowCount: detail.pillowCount,
              nightWakeTime: detail.nightWakeTime,
              nightWakeCount: detail.nightWakeCount,
              edemaSide: detail.edemaSide,
              edemaPitting: detail.edemaPitting,
              coughType: detail.coughType,
              details: detailStrings,
            };
          });

      onUpdateHeartCareState({
        ...heartCareState,
        reportedSymptoms: mappedSymptoms,
        feelingsText: editingFeelingsText,
        lastReportTime: `今日 ${nowTimeStr}`,
      });
    }

    setToastMessage('狀態回報已成功更新');
    setTimeout(() => setToastMessage(null), 2500);

    // Switch to view record screen
    setCurrentView('view_record');
  };

  // =========================================================================
  // VIEW 3: EDIT / FILL REPORT SCREEN (Reference: IMG_8906 + Interactive Detailed Inputs)
  // =========================================================================
  if (currentView === 'edit_record') {
    const isNoneChecked = editingSelectedSymptomIds.includes('none');

    return (
      <div className="flex-1 flex flex-col h-full bg-white text-slate-900 select-none font-sans overflow-hidden relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-14 left-4 right-4 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TOP HEADER: Back arrow | 日記 -> 狀態回報 | Date Subtitle */}
        <div className="px-4 py-3 bg-white flex items-center justify-between shrink-0 border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (existingRecordForSelectedDate) {
                setCurrentView('view_record');
              } else {
                setCurrentView('calendar');
              }
            }}
            className="p-1 -ml-1 text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
            aria-label="返回"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2]" />
          </button>

          <div className="text-center flex-1 pr-6">
            <h1 className="text-[1.1875rem] font-black text-slate-900 tracking-tight">
              狀態回報
            </h1>
            <div className="text-[0.9375rem] text-slate-800 font-medium mt-0.5">
              {getFormattedDate(selectedDate)}
            </div>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-6">
          {/* Section 1: Question Title & Prompt */}
          <div className="space-y-3">
            <div>
              <h2 className="text-[1.25rem] font-black text-slate-900 tracking-tight leading-snug">
                1. 今日是否有以下「新」發生狀況？
              </h2>
              <p className="text-[1.0625rem] text-slate-600 font-normal mt-1">
                如有「新」發生狀況請勾選（可複選）
              </p>
            </div>

            {/* Symptoms Checklist with Expandable Reporting Sub-forms */}
            <div className="space-y-3 pt-1">
              {ALL_HEART_SYMPTOMS.map((item) => {
                const isChecked =
                  item.id === 'none'
                    ? isNoneChecked
                    : editingSelectedSymptomIds.includes(item.id);

                const detail = editingDetails[item.id] || createDefaultDetail(item.id, item.name, item.severity);

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl transition-all ${
                      isChecked && item.id !== 'none'
                        ? 'bg-orange-50/40 border border-orange-200 shadow-2xs overflow-hidden'
                        : 'bg-white'
                    }`}
                  >
                    {/* Primary Item Row (Clickable) */}
                    <div
                      onClick={() => handleToggleSymptom(item.id)}
                      className="flex items-center gap-3.5 py-2.5 px-3 cursor-pointer select-none group"
                    >
                      {/* Checkbox Box */}
                      <div
                        className={`w-[22px] h-[22px] rounded flex items-center justify-center shrink-0 transition-all ${
                          isChecked
                            ? 'bg-[#ea580c] border border-[#ea580c] text-white shadow-2xs'
                            : 'border-2 border-slate-300 bg-white group-hover:border-slate-400'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3.5]" />}
                      </div>

                      {/* Symptom Label */}
                      <span
                        className={`text-[1.125rem] flex-1 transition-colors ${
                          isChecked ? 'text-slate-950 font-bold' : 'text-slate-800 font-medium'
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Severity Indicator Badge if checked */}
                      {isChecked && item.id !== 'none' && (
                        <span
                          className={`text-[0.75rem] font-bold px-2 py-0.5 rounded-full ${
                            item.severity === 'red'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.severity === 'red' ? '高風險' : '請注意'}
                        </span>
                      )}
                    </div>

                    {/* EXPANDABLE DETAILED REPORTING SUB-FORM (Shown when checked) */}
                    {isChecked && item.id !== 'none' && (
                      <div className="px-4 pb-4 pt-2 space-y-3 border-t border-orange-100 bg-white/70">
                        {/* 1. Symptom Severity / Level Radio Options */}
                        {item.options && item.options.length > 0 && (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                              <Info className="w-3.5 h-3.5 text-[#ea580c]" />
                              <span>請選擇症狀程度：</span>
                            </div>
                            <div className="space-y-1.5">
                              {item.options.map((opt) => {
                                const isOptSelected = detail.selectedOption === opt || (!detail.selectedOption && opt === item.options![0]);
                                return (
                                  <div
                                    key={opt}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateDetailField(item.id, 'selectedOption', opt);
                                    }}
                                    className={`p-2 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                                      isOptSelected
                                        ? 'border-[#ea580c] bg-orange-50 font-bold text-slate-900'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                  >
                                    <div
                                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                        isOptSelected ? 'border-[#ea580c]' : 'border-slate-300'
                                      }`}
                                    >
                                      {isOptSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                                      )}
                                    </div>
                                    <span className="text-xs">{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 2. Pillow Count (For 平躺喘) */}
                        {item.hasPillowCount && (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                            <span className="text-slate-800 font-bold text-xs">🛌 需墊高枕頭數量：</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={detail.pillowCount || 1}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  handleUpdateDetailField(item.id, 'pillowCount', Math.max(1, Math.min(10, val)));
                                }}
                                className="w-14 p-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-900 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#ea580c] text-xs"
                              />
                              <span className="text-xs font-bold text-slate-600">顆枕頭</span>
                            </div>
                          </div>
                        )}

                        {/* 3. Night Wake Time & Count (For 夜間喘醒) */}
                        {item.hasNightWakeDetails && (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-2xs">
                            <span className="text-slate-800 font-bold text-xs">🌃 發生時間與次數：</span>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[0.6875rem] font-bold text-slate-500 block mb-1">發生時間</label>
                                <input
                                  type="text"
                                  value={detail.nightWakeTime || ''}
                                  onChange={(e) => handleUpdateDetailField(item.id, 'nightWakeTime', e.target.value)}
                                  placeholder="如：半夜 2:30"
                                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#ea580c]"
                                />
                              </div>
                              <div>
                                <label className="text-[0.6875rem] font-bold text-slate-500 block mb-1">次數 (次)</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={detail.nightWakeCount || 1}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    handleUpdateDetailField(item.id, 'nightWakeCount', Math.max(1, val));
                                  }}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-[#ea580c] text-center"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Edema Side & Pitting (For 下肢水腫) */}
                        {item.hasEdemaDetails && (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-2xs">
                            <span className="text-slate-800 font-bold text-xs">🦶 水腫部位與壓痕性：</span>
                            <div className="grid grid-cols-2 gap-2">
                              {(['單側', '雙側'] as const).map((side) => (
                                <button
                                  key={side}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateDetailField(item.id, 'edemaSide', side);
                                  }}
                                  className={`py-1.5 px-3 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                                    detail.edemaSide === side
                                      ? 'bg-[#ea580c] border-[#ea580c] text-white'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {side}
                                </button>
                              ))}
                            </div>
                            <div className="pt-1">
                              <label
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateDetailField(item.id, 'edemaPitting', !detail.edemaPitting);
                                }}
                                className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 select-none"
                              >
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                    detail.edemaPitting
                                      ? 'bg-[#ea580c] border-[#ea580c] text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {detail.edemaPitting && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span>有壓痕性 (按壓皮膚凹陷不易回彈)</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {/* 5. Cough Type (For 咳嗽) */}
                        {item.hasCoughTypeDetails && (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-2xs">
                            <span className="text-slate-800 font-bold text-xs">🗣️ 咳嗽類型：</span>
                            <div className="grid grid-cols-2 gap-2">
                              {(['乾咳', '有痰'] as const).map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateDetailField(item.id, 'coughType', type);
                                  }}
                                  className={`py-1.5 px-3 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                                    detail.coughType === type
                                      ? 'bg-[#ea580c] border-[#ea580c] text-white'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 6. Duration (Hours & Minutes) */}
                        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-[#ea580c]" />
                            <span>持續時間：</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
                              <input
                                type="number"
                                min="0"
                                max="72"
                                value={detail.hours || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  handleUpdateDetailField(item.id, 'hours', Math.max(0, Math.min(72, val)));
                                }}
                                className="w-8 text-center font-bold text-slate-900 bg-transparent focus:outline-none text-xs"
                              />
                              <span className="text-[0.6875rem] font-bold text-slate-500 ml-1">小時</span>
                            </div>
                            <div className="flex items-center border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
                              <input
                                type="number"
                                min="0"
                                max="59"
                                value={detail.minutes || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  handleUpdateDetailField(item.id, 'minutes', Math.max(0, Math.min(59, val)));
                                }}
                                className="w-8 text-center font-bold text-slate-900 bg-transparent focus:outline-none text-xs"
                              />
                              <span className="text-[0.6875rem] font-bold text-slate-500 ml-1">分鐘</span>
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

          {/* Section 2: 備註 */}
          <div className="space-y-3 pt-2">
            <div>
              <h2 className="text-[1.25rem] font-black text-slate-900 tracking-tight leading-snug">
                2. 備註
              </h2>
              <p className="text-[1.0625rem] text-slate-600 font-normal mt-1">
                如有其他身體感受、飲食或特別狀況可在此補充（自由填寫）
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <MessageSquare className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>今日身體感受備註 (自由填寫)</span>
              </div>
              <textarea
                value={editingFeelingsText}
                onChange={(e) => setEditingFeelingsText(e.target.value)}
                placeholder="如有其他感受、飲食或特別狀況可在此補充..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] resize-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM FIXED ACTION BUTTONS */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xs border-t border-slate-100 space-y-2">
          {/* Main Orange Button: 更新狀態回報 */}
          <button
            type="button"
            onClick={handleSaveRecord}
            className="w-full py-3.5 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[1.0625rem] shadow-sm active:scale-98 transition-all cursor-pointer text-center"
          >
            {existingRecordForSelectedDate ? '更新狀態回報' : '完成狀態回報'}
          </button>

          {/* Secondary Button: 取消更新 */}
          <button
            type="button"
            onClick={() => {
              if (existingRecordForSelectedDate) {
                setCurrentView('view_record');
              } else {
                setCurrentView('calendar');
              }
            }}
            className="w-full py-1 text-center text-[#ea580c] hover:text-[#c2410c] font-bold text-[0.9375rem] active:opacity-75 transition-opacity cursor-pointer"
          >
            取消更新
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: VIEW RECORD SCREEN (Reference: IMG_8905 + Detailed Recorded Breakdown)
  // =========================================================================
  if (currentView === 'view_record') {
    const record = existingRecordForSelectedDate || {
      dateStr: selectedDateStr,
      formattedDisplayDate: getFormattedDate(selectedDate),
      slashDate: getSlashDate(selectedDate),
      noSymptoms: true,
      selectedSymptomIds: ['none'],
      symptomsDetails: {},
      feelingsText: '',
      reportedAt: '11:48',
    };

    const isNoneRecorded = record.noSymptoms || record.selectedSymptomIds.includes('none');

    return (
      <div className="flex-1 flex flex-col h-full bg-white text-slate-900 select-none font-sans overflow-hidden relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-14 left-4 right-4 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TOP HEADER: Back arrow | 狀態回報 | Date Subtitle */}
        <div className="px-4 py-3 bg-white flex items-center justify-between shrink-0 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentView('calendar')}
            className="p-1 -ml-1 text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
            aria-label="返回日曆"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2]" />
          </button>

          <div className="text-center flex-1 pr-6">
            <h1 className="text-[1.1875rem] font-black text-slate-900 tracking-tight">
              狀態回報
            </h1>
            <div className="text-[0.9375rem] text-slate-800 font-medium mt-0.5">
              {record.formattedDisplayDate}
            </div>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT (Read-only view) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-6">
          {/* Section 1: Question Title & Prompt */}
          <div className="space-y-3">
            <div>
              <h2 className="text-[1.25rem] font-black text-slate-900 tracking-tight leading-snug">
                1. 今日是否有以下「新」發生狀況？
              </h2>
              <p className="text-[1.0625rem] text-slate-600 font-normal mt-1">
                如有「新」發生狀況請勾選（可複選）
              </p>
            </div>

            {/* Read-Only Checklist items */}
            <div className="space-y-3 pt-1">
              {ALL_HEART_SYMPTOMS.map((item) => {
                const isChecked =
                  item.id === 'none'
                    ? isNoneRecorded
                    : record.selectedSymptomIds.includes(item.id);

                const detail = record.symptomsDetails[item.id];

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl transition-all ${
                      isChecked && item.id !== 'none'
                        ? 'bg-slate-50 border border-slate-200 overflow-hidden'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 py-2 px-3 select-none">
                      {/* Read-only Checkbox box */}
                      <div
                        className={`w-[22px] h-[22px] rounded flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-slate-200 border border-slate-300 text-slate-700'
                            : 'border-2 border-slate-200 bg-slate-50'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>

                      {/* Symptom Label */}
                      <span
                        className={`text-[1.125rem] flex-1 ${
                          isChecked ? 'font-bold text-slate-950' : 'font-normal text-slate-600'
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Badge if recorded */}
                      {isChecked && item.id !== 'none' && (
                        <span
                          className={`text-[0.6875rem] font-bold px-2 py-0.5 rounded-full ${
                            item.severity === 'red'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.severity === 'red' ? '高風險' : '已通報'}
                        </span>
                      )}
                    </div>

                    {/* Render saved details summary underneath checked symptom */}
                    {isChecked && item.id !== 'none' && detail && (
                      <div className="px-4 pb-3 pt-1.5 border-t border-slate-200/60 bg-white/90 text-xs space-y-1.5">
                        {detail.selectedOption && (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="font-bold text-slate-900">程度：</span>
                            <span>{detail.selectedOption}</span>
                          </div>
                        )}

                        {item.hasPillowCount && detail.pillowCount && (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="font-bold text-slate-900">需墊枕頭：</span>
                            <span>{detail.pillowCount} 顆</span>
                          </div>
                        )}

                        {item.hasNightWakeDetails && (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="font-bold text-slate-900">發生時間與次數：</span>
                            <span>{detail.nightWakeTime || '未備註時間'}，{detail.nightWakeCount || 1} 次</span>
                          </div>
                        )}

                        {item.hasEdemaDetails && (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="font-bold text-slate-900">水腫情形：</span>
                            <span>{detail.edemaSide || '單側'}，{detail.edemaPitting ? '有壓痕性' : '無壓痕性'}</span>
                          </div>
                        )}

                        {item.hasCoughTypeDetails && detail.coughType && (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="font-bold text-slate-900">咳嗽類型：</span>
                            <span>{detail.coughType}</span>
                          </div>
                        )}

                        {(detail.hours > 0 || detail.minutes > 0) && (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="font-bold text-slate-900">持續時間：</span>
                            <span>{detail.hours} 小時 {detail.minutes} 分鐘</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: 備註 */}
          <div className="space-y-3 pt-2">
            <div>
              <h2 className="text-[1.25rem] font-black text-slate-900 tracking-tight leading-snug">
                2. 備註
              </h2>
              <p className="text-[1.0625rem] text-slate-600 font-normal mt-1">
                身體感受、飲食或特別狀況備註
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>今日身體感受備註</span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed font-medium pl-5 whitespace-pre-wrap">
                {record.feelingsText || '無填寫特別備註'}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM FIXED ACTION BUTTONS */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xs border-t border-slate-100 space-y-2">
          {/* Main Orange Button: 編輯狀態回報 */}
          <button
            type="button"
            onClick={() => handleOpenEdit(selectedDate)}
            className="w-full py-3.5 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[1.0625rem] shadow-sm active:scale-98 transition-all cursor-pointer text-center"
          >
            編輯狀態回報
          </button>

          {/* Secondary Button: 返回 */}
          <button
            type="button"
            onClick={() => setCurrentView('calendar')}
            className="w-full py-1 text-center text-[#ea580c] hover:text-[#c2410c] font-bold text-[0.9375rem] active:opacity-75 transition-opacity cursor-pointer"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: CALENDAR OVERVIEW SCREEN (Reference: IMG_8903 & IMG_8904)
  // =========================================================================
  // Days of week header
  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to generate calendar days for a specific year & month (0-indexed)
  const generateMonthDays = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNum: number | null; dateObj?: Date; dateStr?: string }> = [];

    // Empty lead slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: null });
    }

    // Month days
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      days.push({
        dayNum: d,
        dateObj,
        dateStr: getDateStr(dateObj),
      });
    }

    return days;
  };

  const augustDays = generateMonthDays(2026, 7); // August 2026
  const septemberDays = generateMonthDays(2026, 8); // September 2026

  const hasRecordOnSelectedDate = Boolean(recordsMap[selectedDateStr]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-slate-900 select-none font-sans overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-4 right-4 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP HEADER (Reference: IMG_8903 / IMG_8904) */}
      <div className="px-4 py-3 bg-white flex items-center justify-between shrink-0 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
          aria-label="返回心臟照護燈"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <div className="text-center flex-1 pr-6">
          <h1 className="text-[1.25rem] font-black text-slate-900 tracking-tight">
            心臟照護燈
          </h1>
          <div className="text-[0.9375rem] text-slate-700 font-medium mt-0.5">
            狀態回報總覽
          </div>
        </div>
      </div>

      {/* CALENDAR SCROLLABLE CONTAINER */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-32">
        {/* Month Selector Bar: 2026 年 8月 ▾ | 今日 (IMG_8903) */}
        <div className="flex items-center justify-between px-2 py-2 mb-2">
          <div className="flex items-center gap-1 text-[1.125rem] font-extrabold text-slate-900 cursor-pointer">
            <span>
              {viewYear} 年 {viewMonth + 1}月
            </span>
            <ChevronDown className="w-4 h-4 text-slate-700" />
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDate(TODAY);
              setViewYear(2026);
              setViewMonth(7);
            }}
            className="text-[1.0625rem] font-bold text-[#ea580c] hover:text-[#c2410c] active:opacity-75 transition-all cursor-pointer"
          >
            今日
          </button>
        </div>

        {/* 1st Month: August 2026 Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-7 gap-y-3.5 text-center items-center">
            {augustDays.map((item, idx) => {
              if (!item.dayNum || !item.dateObj || !item.dateStr) {
                return <div key={idx} className="h-10" />;
              }

              const isSelected = item.dateStr === selectedDateStr;
              const hasRecord = Boolean(recordsMap[item.dateStr]);

              return (
                <div
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateObj!)}
                  className="flex items-center justify-center cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[1.0625rem] transition-all ${
                      isSelected && hasRecord
                        ? 'bg-[#ea580c] text-white shadow-md shadow-orange-500/40 ring-4 ring-orange-200/70 scale-105'
                        : isSelected && !hasRecord
                        ? 'border-2 border-[#ea580c] text-slate-900 font-black shadow-sm'
                        : hasRecord
                        ? 'bg-orange-100 text-[#ea580c] font-black'
                        : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {item.dayNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2nd Month: September 2026 Header & Weekdays */}
        <div className="mt-4">
          <div className="text-[1.125rem] font-black text-slate-900 px-2 mb-3">
            9月 2026
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 text-center text-[0.9375rem] font-bold text-slate-900 mb-4">
            {weekDayHeaders.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          {/* September Grid */}
          <div className="grid grid-cols-7 gap-y-3.5 text-center items-center">
            {septemberDays.map((item, idx) => {
              if (!item.dayNum || !item.dateObj || !item.dateStr) {
                return <div key={idx} className="h-10" />;
              }

              const isSelected = item.dateStr === selectedDateStr;
              const hasRecord = Boolean(recordsMap[item.dateStr]);

              return (
                <div
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateObj!)}
                  className="flex items-center justify-center cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[1.0625rem] transition-all ${
                      isSelected && hasRecord
                        ? 'bg-[#ea580c] text-white shadow-md shadow-orange-500/40 ring-4 ring-orange-200/70 scale-105'
                        : isSelected && !hasRecord
                        ? 'border-2 border-[#ea580c] text-slate-900 font-black shadow-sm'
                        : hasRecord
                        ? 'bg-orange-100 text-[#ea580c] font-black'
                        : 'text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {item.dayNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM PERSISTENT ACTION AREA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xs border-t border-slate-100 space-y-2">
        {/* Date Display: e.g. 2026/08/18 */}
        <div className="text-center font-extrabold text-[1.125rem] text-slate-900">
          {getSlashDate(selectedDate)}
        </div>

        {/* Dynamic Action Button: 填寫紀錄 OR 查看紀錄 */}
        {hasRecordOnSelectedDate ? (
          <button
            type="button"
            onClick={() => setCurrentView('view_record')}
            className="w-full py-3.5 rounded-full border-2 border-[#ea580c] text-[#ea580c] hover:bg-orange-50 active:scale-98 font-black text-[1.0625rem] transition-all cursor-pointer text-center shadow-2xs"
          >
            查看紀錄
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleOpenEdit(selectedDate)}
            className="w-full py-3.5 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white active:scale-98 font-black text-[1.0625rem] transition-all cursor-pointer text-center shadow-md shadow-orange-500/20"
          >
            填寫紀錄
          </button>
        )}
      </div>
    </div>
  );
};
