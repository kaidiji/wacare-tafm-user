import React, { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  ChevronRight,
  HelpCircle,
  X,
  Check,
  Wand2,
  Trash2,
} from 'lucide-react';
import { VitalsData } from './heartCareData';

export interface WeightRecordItem {
  id: string;
  dateStr: string; // e.g. "2026-08-18"
  dateTimeDisplay: string; // e.g. "2026/8/18 11:12"
  shortDate: string; // e.g. "8/18"
  weight: number; // e.g. 92
  height: number; // e.g. 178
  waist: number; // e.g. 98
  bmi: number; // e.g. 29
  statusLabel: string; // e.g. "輕度肥胖"
  statusColor: 'red' | 'amber' | 'green' | 'blue';
}

const calculateBMI = (
  weight: number,
  height: number
): { bmi: number; label: string; color: 'red' | 'amber' | 'green' | 'blue' } => {
  if (!weight || !height) return { bmi: 0, label: '未知', color: 'green' };
  const hM = height / 100;
  const bmiVal = parseFloat((weight / (hM * hM)).toFixed(1));
  const roundedBmi = Math.round(bmiVal);

  if (bmiVal < 18.5) {
    return { bmi: roundedBmi, label: '體重過輕', color: 'blue' };
  } else if (bmiVal < 24) {
    return { bmi: roundedBmi, label: '正常', color: 'green' };
  } else if (bmiVal < 27) {
    return { bmi: roundedBmi, label: '過重', color: 'amber' };
  } else if (bmiVal < 30) {
    return { bmi: roundedBmi, label: '輕度肥胖', color: 'red' };
  } else if (bmiVal < 35) {
    return { bmi: roundedBmi, label: '中度肥胖', color: 'red' };
  } else {
    return { bmi: roundedBmi, label: '重度肥胖', color: 'red' };
  }
};

export const INITIAL_WEIGHT_RECORDS: WeightRecordItem[] = [
  {
    id: 'wt_1',
    dateStr: '2026-08-18',
    dateTimeDisplay: '2026/8/18 11:12',
    shortDate: '8/18',
    weight: 92,
    height: 178,
    waist: 98,
    bmi: 29,
    statusLabel: '輕度肥胖',
    statusColor: 'red',
  },
];

interface Props {
  onBack: () => void;
  nickname?: string;
  currentVitals?: VitalsData;
  onUpdateVitals?: (vitals: Partial<VitalsData>) => void;
}

export const WeightDetailScreen: React.FC<Props> = ({
  onBack,
  nickname = 'Kai',
  currentVitals,
  onUpdateVitals,
}) => {
  // Records state
  const [records, setRecords] = useState<WeightRecordItem[]>(() => {
    if (currentVitals?.weight !== undefined) {
      const wt = currentVitals.weight;
      const ht = 178;
      const ws = 98;
      const { bmi, label, color } = calculateBMI(wt, ht);
      return [
        {
          id: 'wt_1',
          dateStr: '2026-08-18',
          dateTimeDisplay: '2026/8/18 11:12',
          shortDate: '8/18',
          weight: wt,
          height: ht,
          waist: ws,
          bmi,
          statusLabel: label,
          statusColor: color,
        },
      ];
    }
    return INITIAL_WEIGHT_RECORDS;
  });

  // Modal and detail view states
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<WeightRecordItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<WeightRecordItem | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Input states in modal
  const [modalDateTime, setModalDateTime] = useState<string>('2026/8/18 11:13');
  const [activeSlot, setActiveSlot] = useState<'weight' | 'height' | 'waist'>('weight');
  const [inputWeight, setInputWeight] = useState<string>('');
  const [inputHeight, setInputHeight] = useState<string>('');
  const [inputWaist, setInputWaist] = useState<string>('');

  // Open modal for new record
  const handleOpenAddModal = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setModalDateTime(`${y}/${m}/${day} ${hh}:${mm}`);
    setInputWeight('');
    setInputHeight('');
    setInputWaist('');
    setActiveSlot('weight');
    setEditingRecord(null);
    setShowModal(true);
  };

  // Open modal for editing record
  const handleOpenEditModal = (rec: WeightRecordItem) => {
    setEditingRecord(rec);
    setModalDateTime(rec.dateTimeDisplay);
    setInputWeight(String(rec.weight));
    setInputHeight(String(rec.height));
    setInputWaist(String(rec.waist));
    setActiveSlot('weight');
    setShowModal(true);
  };

  // Keypad press handler
  const handleKeypadPress = (key: string) => {
    const updateTarget = (prev: string) => {
      if (key === 'DEL') {
        return prev.slice(0, -1);
      }
      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev ? `${prev}.` : '0.';
      }
      // Check max length
      if (prev.length >= 5) return prev;
      return prev + key;
    };

    if (activeSlot === 'weight') {
      setInputWeight((prev) => updateTarget(prev));
    } else if (activeSlot === 'height') {
      setInputHeight((prev) => updateTarget(prev));
    } else {
      setInputWaist((prev) => updateTarget(prev));
    }
  };

  // Simulated OCR Photo Upload
  const handlePhotoUploadSim = () => {
    setInputWeight('92');
    setInputHeight('178');
    setInputWaist('98');
    setToastMessage('已成功辨識體重計數據：92 kg');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Save measurement
  const isFormValid = Boolean(inputWeight && parseFloat(inputWeight) > 0);

  const handleSave = () => {
    if (!isFormValid) return;

    const wt = parseFloat(inputWeight) || 92;
    const ht = parseFloat(inputHeight) || 178;
    const ws = parseFloat(inputWaist) || 98;
    const { bmi, label, color } = calculateBMI(wt, ht);

    const [dPart] = modalDateTime.split(' ');
    const parts = dPart.split('/');
    const shortDate = `${parts[1]}/${parts[2]}`;
    const dateStr = `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;

    if (editingRecord) {
      const updatedRec: WeightRecordItem = {
        ...editingRecord,
        dateTimeDisplay: modalDateTime,
        dateStr,
        shortDate,
        weight: wt,
        height: ht,
        waist: ws,
        bmi,
        statusLabel: label,
        statusColor: color,
      };

      setRecords((prev) =>
        prev.map((r) => (r.id === editingRecord.id ? updatedRec : r))
      );
      if (selectedRecordForDetail?.id === editingRecord.id) {
        setSelectedRecordForDetail(updatedRec);
      }
      setToastMessage('體重記錄已更新');
    } else {
      const newRec: WeightRecordItem = {
        id: `wt_${Date.now()}`,
        dateStr,
        dateTimeDisplay: modalDateTime,
        shortDate,
        weight: wt,
        height: ht,
        waist: ws,
        bmi,
        statusLabel: label,
        statusColor: color,
      };
      setRecords([newRec, ...records]);
      setToastMessage('體重記錄已新增');
    }

    if (onUpdateVitals) {
      onUpdateVitals({ weight: wt });
    }

    setShowModal(false);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Dot plot calculations (Reference: IMG_8899)
  const chartWidth = 320;
  const chartHeight = 220;
  const padLeft = 45;
  const padBottom = 30;
  const padTop = 30;
  const padRight = 35;

  // Render Measurement Input Modal (Reference: IMG_8901)
  const renderMeasurementModal = () => {
    if (!showModal) return null;

    return (
      <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
        <div className="bg-white rounded-t-[2rem] p-5 pb-6 shadow-2xl w-full border-t border-slate-200 max-h-[96%] overflow-y-auto animate-in slide-in-from-bottom duration-250 flex flex-col justify-between">
          {/* Modal Title with ? icon: 請測量您的體重 ❓ */}
          <div className="flex items-center justify-center gap-1.5 pt-1 pb-4 relative">
            <h2 className="text-[1.25rem] font-bold text-slate-900 tracking-tight">
              {editingRecord ? '編輯體重記錄' : '請測量您的體重'}
            </h2>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-slate-700 hover:text-slate-900 p-0.5 cursor-pointer"
              title="體重量測說明"
            >
              <HelpCircle className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Date & Time Select Box: e.g. 2026/8/18 11:13 ▾ */}
          <div className="mb-4">
            <div className="w-full py-2.5 px-3.5 rounded-lg border border-slate-300 bg-white flex items-center justify-between text-slate-700 font-medium text-[1rem] shadow-2xs">
              <span>{modalDateTime}</span>
              <span className="text-slate-400 text-xs">▾</span>
            </div>
          </div>

          {/* 3 Input Field Boxes: 體重(kg) | 身高(cm) | 腰圍(cm) */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {/* Weight Box */}
            <div
              onClick={() => setActiveSlot('weight')}
              className="flex flex-col items-center cursor-pointer"
            >
              <span className="text-sm font-medium text-slate-600 mb-1.5">體重(kg)</span>
              <div
                className={`w-full h-12 rounded-lg flex items-center justify-center text-center transition-all bg-white ${
                  activeSlot === 'weight'
                    ? 'border-2 border-[#f26f21] shadow-2xs'
                    : 'border border-slate-300'
                }`}
              >
                <span
                  className={`text-[1.125rem] font-bold ${
                    inputWeight ? 'text-slate-900' : 'text-slate-400 font-normal'
                  }`}
                >
                  {inputWeight || ''}
                </span>
              </div>
            </div>

            {/* Height Box */}
            <div
              onClick={() => setActiveSlot('height')}
              className="flex flex-col items-center cursor-pointer"
            >
              <span className="text-sm font-medium text-slate-600 mb-1.5">身高(cm)</span>
              <div
                className={`w-full h-12 rounded-lg flex items-center justify-center text-center transition-all bg-white ${
                  activeSlot === 'height'
                    ? 'border-2 border-[#f26f21] shadow-2xs'
                    : 'border border-slate-300'
                }`}
              >
                <span
                  className={`text-[1.125rem] font-bold ${
                    inputHeight ? 'text-slate-900' : 'text-slate-400 font-normal'
                  }`}
                >
                  {inputHeight || ''}
                </span>
              </div>
            </div>

            {/* Waist Box */}
            <div
              onClick={() => setActiveSlot('waist')}
              className="flex flex-col items-center cursor-pointer"
            >
              <span className="text-sm font-medium text-slate-600 mb-1.5">腰圍(cm)</span>
              <div
                className={`w-full h-12 rounded-lg flex items-center justify-center text-center transition-all bg-white ${
                  activeSlot === 'waist'
                    ? 'border-2 border-[#f26f21] shadow-2xs'
                    : 'border border-slate-300'
                }`}
              >
                <span
                  className={`text-[1.125rem] font-bold ${
                    inputWaist ? 'text-slate-900' : 'text-slate-400 font-normal'
                  }`}
                >
                  {inputWaist || ''}
                </span>
              </div>
            </div>
          </div>

          {/* Custom 3x4 Number Keypad (with . and 刪除) */}
          <div className="bg-[#f4f5f7] rounded-xl p-3 mb-3.5">
            <div className="grid grid-cols-3 gap-y-2.5 gap-x-2 text-[1.5rem] font-normal text-slate-900">
              {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeypadPress(k)}
                  className="h-11 rounded-lg flex items-center justify-center hover:bg-white active:bg-slate-200 active:scale-95 transition-all cursor-pointer select-none"
                >
                  {k}
                </button>
              ))}
              {/* 4th row: . , 0 , 刪除 */}
              <button
                type="button"
                onClick={() => handleKeypadPress('.')}
                className="h-11 rounded-lg flex items-center justify-center hover:bg-white active:bg-slate-200 active:scale-95 transition-all cursor-pointer select-none text-[1.75rem]"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-11 rounded-lg flex items-center justify-center hover:bg-white active:bg-slate-200 active:scale-95 transition-all cursor-pointer select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('DEL')}
                className="h-11 rounded-lg flex items-center justify-center text-[1.125rem] font-bold text-red-500 hover:bg-white active:bg-red-50 active:scale-95 transition-all cursor-pointer select-none"
              >
                刪除
              </button>
            </div>
          </div>

          {/* 拍照上傳 Button (Reference: IMG_8901) */}
          <button
            type="button"
            onClick={handlePhotoUploadSim}
            className="w-full py-2.5 rounded-lg bg-[#f26f21] hover:bg-[#e05e10] text-white font-bold text-[0.9375rem] flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all mb-4 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>拍照上傳</span>
          </button>

          {/* Bottom Actions: 取消 | 完成 */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingRecord(null);
              }}
              className="flex-1 py-2.5 rounded-full border border-[#f26f21] text-[#f26f21] font-bold text-[0.9375rem] hover:bg-orange-50 active:scale-98 transition-all cursor-pointer text-center"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isFormValid}
              className={`flex-1 py-2.5 rounded-full font-bold text-[0.9375rem] transition-all text-center cursor-pointer ${
                isFormValid
                  ? 'bg-[#f26f21] text-white hover:bg-[#e05e10] shadow-sm active:scale-98'
                  : 'bg-[#7c8087] text-white/90'
              }`}
            >
              完成
            </button>
          </div>

          {/* Delete button if in edit mode */}
          {editingRecord && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setRecords((prev) => prev.filter((r) => r.id !== editingRecord.id));
                  if (selectedRecordForDetail?.id === editingRecord.id) {
                    setSelectedRecordForDetail(null);
                  }
                  setShowModal(false);
                  setEditingRecord(null);
                  setToastMessage('已刪除此筆體重記錄');
                  setTimeout(() => setToastMessage(null), 2000);
                }}
                className="inline-flex items-center gap-1 text-xs text-red-500 font-bold hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>刪除此筆記錄</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Guideline Help Modal
  const renderHelpModal = () => {
    if (!showHelpModal) return null;

    return (
      <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 space-y-3.5">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <HelpCircle className="w-5 h-5 text-[#f26f21]" />
              <span>體重與 BMI 標準說明</span>
            </h3>
            <button
              onClick={() => setShowHelpModal(false)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">BMI 判定標準 (國健署)：</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>體重過輕：BMI &lt; 18.5</li>
                <li>健康體位：18.5 ≤ BMI &lt; 24.0</li>
                <li>體重過重：24.0 ≤ BMI &lt; 27.0</li>
                <li>輕度肥胖：27.0 ≤ BMI &lt; 30.0</li>
                <li>中度肥胖：30.0 ≤ BMI &lt; 35.0</li>
                <li>重度肥胖：BMI ≥ 35.0</li>
              </ul>
            </div>

            <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200 text-orange-950">
              <p className="font-bold mb-0.5">心臟照護提醒：</p>
              <p>
                體重短時間快速上升（如 2 天內增加超過 1.5 公斤），可能是體內水分滯留或心衰竭惡化的早期徵兆，請留意是否有下肢水腫或呼吸不適。
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowHelpModal(false)}
            className="w-full py-2 bg-[#f26f21] hover:bg-[#e05e10] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            我知道了
          </button>
        </div>
      </div>
    );
  };

  // =========================================================================
  // VIEW 2: DETAILED INFORMATION SCREEN (Reference: IMG_8900)
  // =========================================================================
  if (selectedRecordForDetail) {
    const rec = selectedRecordForDetail;
    const hm = (rec.height || 178) / 100;
    const minW = (18.5 * hm * hm).toFixed(1);
    const maxW = (23.9 * hm * hm).toFixed(1);

    return (
      <div className="flex-1 flex flex-col h-full bg-white text-slate-800 overflow-hidden relative select-none font-sans">
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

        {/* TOP HEADER: Back arrow | 詳細資訊 | 編輯 (Reference: IMG_8900) */}
        <div className="bg-white px-4 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setSelectedRecordForDetail(null)}
            className="p-1 -ml-1 text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
            aria-label="返回"
          >
            <ChevronLeft className="w-7 h-7 stroke-[1.8]" />
          </button>

          <h1 className="text-[1.125rem] font-medium text-slate-900 tracking-tight">
            詳細資訊
          </h1>

          <button
            type="button"
            onClick={() => handleOpenEditModal(rec)}
            className="p-1 -mr-1 text-slate-500 hover:text-slate-900 active:scale-95 font-normal text-[1rem] transition-all cursor-pointer"
          >
            編輯
          </button>
        </div>

        {/* DETAILS CONTENT (Reference: IMG_8900) */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white pb-10">
          {/* Section: 時間 */}
          <div className="bg-[#f0f2f5] px-5 py-3.5 text-[1.125rem] font-bold text-slate-900">
            時間
          </div>
          <div className="bg-white px-5 py-4 text-[1.0625rem] text-slate-900 font-normal">
            {rec.dateTimeDisplay}
          </div>

          {/* Section: 身高 */}
          <div className="bg-[#f0f2f5] px-5 py-3.5 text-[1.125rem] font-bold text-slate-900">
            身高
          </div>
          <div className="bg-white px-5 py-4 text-[1.0625rem] text-slate-900 font-normal">
            {rec.height} 公分
          </div>

          {/* Section: 體重 */}
          <div className="bg-[#f0f2f5] px-5 py-3.5 text-[1.125rem] font-bold text-slate-900">
            體重
          </div>
          <div className="bg-white px-5 py-4 text-[1.0625rem] text-slate-900 font-normal">
            {rec.weight} 公斤
          </div>

          {/* Section: 腰圍 */}
          <div className="bg-[#f0f2f5] px-5 py-3.5 text-[1.125rem] font-bold text-slate-900">
            腰圍
          </div>
          <div className="bg-white px-5 py-4 text-[1.0625rem] text-slate-900 font-normal">
            {rec.waist} 公分
          </div>

          {/* Section: BMI */}
          <div className="bg-[#f0f2f5] px-5 py-3.5 text-[1.125rem] font-bold text-slate-900">
            BMI
          </div>
          <div className="bg-white px-5 py-5 text-[1.0625rem] text-slate-900 leading-relaxed space-y-3.5">
            <p>
              您的身體質量指數（BMI）為{rec.bmi}，屬於「{rec.statusLabel}」。
              {rec.bmi < 18.5
                ? '建議適度增加營養攝取與肌力訓練，維持健康體態！💪✨ 相對於您的身高，以下為您的建議體重範圍。'
                : rec.bmi < 24
                ? '太棒了！請繼續保持均衡飲食與規律運動的生活習慣！💪✨ 相對於您的身高，以下為您的建議體重範圍。'
                : '透過規律運動與均衡飲食，健康管理就從現在開始！💪✨ 相對於您的身高，以下為您的建議體重範圍。'}
            </p>
            <div className="text-[#10b981] font-bold text-[1.25rem] tracking-tight pt-1">
              {minW} kg – {maxW} kg
            </div>
          </div>
        </div>

        {/* Modals */}
        {renderMeasurementModal()}
        {renderHelpModal()}
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: WEIGHT CHART & LIST SCREEN (Reference: IMG_8899)
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col h-full bg-white text-slate-800 overflow-hidden relative select-none font-sans">
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

      {/* TOP HEADER: Back | Nickname (e.g. Kai) | + Button (Reference: IMG_8899) */}
      <div className="bg-white px-4 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
          aria-label="返回"
        >
          <ChevronLeft className="w-7 h-7 stroke-[1.8]" />
        </button>

        <h1 className="text-[1.125rem] font-medium text-slate-900 tracking-tight">
          {nickname || 'Kai'}
        </h1>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="p-1 -mr-1 text-slate-500 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
          aria-label="新增體重"
        >
          <Plus className="w-7 h-7 stroke-[1.5]" />
        </button>
      </div>

      {/* SCROLLABLE MAIN BODY */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* ========================================================================= */}
        {/* MIDDLE SECTION: WEIGHT & DATE DOT PLOT (Reference: IMG_8899) */}
        {/* ========================================================================= */}
        <div className="px-6 pt-6 pb-2 bg-white flex flex-col items-center">
          <div className="relative w-full max-w-[340px] h-[230px] flex items-center justify-center">
            {/* Y-axis label */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-normal tracking-tight select-none"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg) translateY(50%)',
              }}
            >
              體重單位 (kg)
            </div>

            {/* SVG Dot Plot */}
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
            >
              {/* L-shaped Axis (Left Y border line, Bottom X border line) */}
              <line
                x1={padLeft}
                y1={padTop}
                x2={padLeft}
                y2={chartHeight - padBottom}
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />
              <line
                x1={padLeft}
                y1={chartHeight - padBottom}
                x2={chartWidth - padRight + 15}
                y2={chartHeight - padBottom}
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />

              {/* Data Points (Orange circle + text value) */}
              {records.map((rec, idx) => {
                // Fixed point at the right matching IMG_8899
                const cx = chartWidth - padRight;
                const cy = padTop + 15;

                return (
                  <g key={rec.id || idx}>
                    {/* Orange Dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="5.5"
                      fill="#ea580c"
                      className="transition-all"
                    />

                    {/* Weight value below dot */}
                    <text
                      x={cx}
                      y={cy + 16}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#0f172a"
                    >
                      {rec.weight}
                    </text>

                    {/* Date label on X-axis */}
                    <text
                      x={cx}
                      y={chartHeight - padBottom + 16}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="normal"
                      fill="#64748b"
                    >
                      {rec.shortDate}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Gray Divider */}
        <div className="border-t border-slate-100 my-2" />

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: DATE BREAKDOWN & METRICS (Reference: IMG_8899) */}
        {/* ========================================================================= */}
        <div className="px-5 space-y-6">
          {records.map((rec) => {
            // Status tag style
            let badgeClass = 'border-red-400 text-red-500 bg-white';
            if (rec.statusColor === 'green') {
              badgeClass = 'border-emerald-500 text-emerald-600 bg-white';
            } else if (rec.statusColor === 'amber') {
              badgeClass = 'border-amber-400 text-amber-600 bg-white';
            } else if (rec.statusColor === 'blue') {
              badgeClass = 'border-blue-400 text-blue-500 bg-white';
            }

            return (
              <div key={rec.id} className="pt-2">
                {/* Header Row: DateTime + Status Tag + Chevron */}
                <div
                  onClick={() => setSelectedRecordForDetail(rec)}
                  className="flex items-center justify-between py-2 cursor-pointer group"
                >
                  <div className="text-[1.125rem] font-bold text-slate-900 tracking-tight">
                    {rec.dateTimeDisplay}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Button: e.g. 正常-綠燈, 輕度肥胖-紅燈 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecordForDetail(rec);
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all active:scale-95 hover:shadow-xs cursor-pointer ${badgeClass}`}
                    >
                      {rec.statusLabel}
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </div>
                </div>

                {/* 4 Metrics Rows: BMI, 腰圍, 體重, 身高 (Clickable to Detailed Info) */}
                <div
                  onClick={() => setSelectedRecordForDetail(rec)}
                  className="space-y-3.5 pt-2 pb-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[1rem]">
                    <span className="text-slate-900 font-medium">BMI</span>
                    <span className="text-slate-900 font-medium">{rec.bmi}</span>
                  </div>

                  <div className="flex items-center justify-between text-[1rem]">
                    <span className="text-slate-900 font-medium">腰圍</span>
                    <span className="text-slate-900 font-medium">{rec.waist}公分</span>
                  </div>

                  <div className="flex items-center justify-between text-[1rem]">
                    <span className="text-slate-900 font-medium">體重</span>
                    <span className="text-slate-900 font-medium">{rec.weight}公斤</span>
                  </div>

                  <div className="flex items-center justify-between text-[1rem]">
                    <span className="text-slate-900 font-medium">身高</span>
                    <span className="text-slate-900 font-medium">{rec.height}公分</span>
                  </div>
                </div>

                {/* Bottom line */}
                <div className="border-b border-slate-200/70 pt-1" />
              </div>
            );
          })}

          {records.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              尚無體重記錄，請點擊右上角「+」新增。
            </div>
          )}
        </div>
      </div>

      {/* Input Modal */}
      {renderMeasurementModal()}

      {/* Help Modal */}
      {renderHelpModal()}
    </div>
  );
};
