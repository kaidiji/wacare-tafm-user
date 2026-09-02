import React, { useState, useRef } from 'react';
import { HelpCircle, ChevronDown, Camera, Bluetooth, Upload, X, ArrowLeft, CheckCircle2, FileText } from 'lucide-react';

export type MeasurementType = 'bp' | 'spO2' | 'weight' | 'rr' | 'bt' | 'ecg';

export interface MeasurementModalProps {
  type: MeasurementType;
  onClose: () => void;
  onSubmit: (data: {
    type: MeasurementType;
    timestamp: string;
    note?: string;
    values: Record<string, any>;
  }) => void;
  initialValues?: Record<string, any>;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({
  type,
  onClose,
  onSubmit,
  initialValues = {},
}) => {
  const initVals = (initialValues || {}) as Record<string, any>;
  // Config per measurement type
  const getModalConfig = () => {
    switch (type) {
      case 'bp':
        return {
          title: '請測量您的血壓與心率',
          fields: [
            { id: 'sysBP', label: '收縮壓', unit: 'mmHg', placeholder: 'mmHg', maxLen: 3, isDecimal: false },
            { id: 'diaBP', label: '舒張壓', unit: 'mmHg', placeholder: 'mmHg', maxLen: 3, isDecimal: false },
            { id: 'pulse', label: '心律', unit: '次/分', placeholder: '次/分', maxLen: 3, isDecimal: false },
          ],
          hasCamera: true,
          hasBluetooth: true,
          hasFileUpload: false,
          allowDecimal: false,
          tipsTitle: '722 血壓與心率量測原則與建議',
          tipsContent: '請在安靜坐下休息 5 分鐘後量測，雙腳平放不交叉。遵循「722」原則：連續 7 天、早晚各 2 次、每次量 2 遍取平均值，並同步記錄心率。',
        };
      case 'spO2':
        return {
          title: '請測量您的血氧',
          fields: [
            { id: 'spO2', label: '血氧濃度', unit: '%', placeholder: '%', maxLen: 3, isDecimal: false },
            { id: 'pulse', label: '心律', unit: 'bpm', placeholder: 'bpm', maxLen: 3, isDecimal: false },
          ],
          hasCamera: true,
          hasBluetooth: false,
          hasFileUpload: false,
          allowDecimal: false,
          tipsTitle: '血氧飽和度 (SpO₂) 量測建議',
          tipsContent: '請保持手指溫暖且安靜平放。正常血氧值應為 95% ~ 100%。若低於 94% 請再次測量，低於 90% 請儘速就醫。',
        };
      case 'weight':
        return {
          title: '請測量您的體重',
          fields: [
            { id: 'weight', label: '體重(kg)', unit: 'kg', placeholder: 'kg', maxLen: 5, isDecimal: true },
            { id: 'height', label: '身高(cm)', unit: 'cm', placeholder: 'cm', maxLen: 3, isDecimal: false },
            { id: 'waist', label: '腰圍(cm)', unit: 'cm', placeholder: 'cm', maxLen: 3, isDecimal: false },
          ],
          hasCamera: true,
          hasBluetooth: false,
          hasFileUpload: false,
          allowDecimal: true,
          tipsTitle: '體重量測黃金時間點',
          tipsContent: '建議每日「早晨起床排尿後、吃早餐前」穿著輕便服裝量測最為準確。若 2 天內體重暴增 2 公斤以上，請注意下肢水腫與心衰狀況。',
        };
      case 'rr':
        return {
          title: '請測量您的呼吸頻率',
          fields: [
            { id: 'respRate', label: '呼吸頻率', unit: '次/分', placeholder: '次/分', maxLen: 2, isDecimal: false },
          ],
          hasCamera: true,
          hasBluetooth: false,
          hasFileUpload: false,
          allowDecimal: false,
          tipsTitle: '呼吸頻率記錄指引',
          tipsContent: '請在靜止放鬆狀態下，計算每分鐘胸腔起伏的次數。成年人正常休息呼吸頻率約為 12 ~ 20 次/分。',
        };
      case 'bt':
        return {
          title: '請測量您的體溫',
          fields: [
            { id: 'bodyTemp', label: '體溫', unit: '°C', placeholder: '°C', maxLen: 4, isDecimal: true },
          ],
          hasCamera: true,
          hasBluetooth: false,
          hasFileUpload: false,
          allowDecimal: true,
          tipsTitle: '體溫量測說明',
          tipsContent: '建議使用額溫槍或耳溫槍量測，正常體溫範圍約在 36.1°C ~ 37.2°C 之間。',
        };
      case 'ecg':
        return {
          title: '請測量您的心電圖',
          fields: [], // No manual numeric entry fields for ECG
          hasCamera: false,
          hasBluetooth: true,
          hasFileUpload: true,
          allowDecimal: false,
          tipsTitle: '心電圖 (ECG) 上傳與同步說明',
          tipsContent: '心電圖數據僅支援透過「上傳心電圖檔案 (圖檔/PDF)」或「藍芽裝置同步」進行匯入，無法手動填寫數值。',
        };
    }
  };

  const config = getModalConfig();

  // Active field management
  const [activeFieldId, setActiveFieldId] = useState<string>(config.fields[0]?.id || '');

  // Field values state
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => {
      initial[f.id] = initVals[f.id] ? String(initVals[f.id]) : '';
    });
    return initial;
  });

  // ECG status state (for ECG type)
  const [ecgStatus, setEcgStatus] = useState<string>(
    initVals.ecgStatus || '正常竇性心律，節律規則'
  );

  // ECG uploaded file state & Bluetooth sync state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isBluetoothSynced, setIsBluetoothSynced] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Note text
  const [note, setNote] = useState<string>(initVals.note || '');

  // Timestamp formatting
  const now = new Date();
  const defaultTs = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${String(
    now.getHours()
  ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [timestamp, setTimestamp] = useState<string>(initVals.timestamp || defaultTs);

  // Date picker modal
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTipsModal, setShowTipsModal] = useState<boolean>(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Keypad press handler
  const handleKeypadPress = (key: string) => {
    const currentFieldConfig = config.fields.find((f) => f.id === activeFieldId);
    if (!currentFieldConfig) return;

    if (key === 'DEL') {
      setValues((prev) => ({
        ...prev,
        [activeFieldId]: prev[activeFieldId] ? prev[activeFieldId].slice(0, -1) : '',
      }));
    } else if (key === '.') {
      if (!currentFieldConfig.isDecimal) return;
      const currentVal = values[activeFieldId] || '';
      if (!currentVal.includes('.')) {
        setValues((prev) => ({ ...prev, [activeFieldId]: currentVal + '.' }));
      }
    } else {
      // Digit key
      const currentVal = values[activeFieldId] || '';
      if (currentVal.length < currentFieldConfig.maxLen) {
        const nextVal = currentVal + key;
        setValues((prev) => ({ ...prev, [activeFieldId]: nextVal }));

        // Auto advance field if maxLen reached for non-decimal
        if (!currentFieldConfig.isDecimal && nextVal.length === currentFieldConfig.maxLen) {
          const currentIndex = config.fields.findIndex((f) => f.id === activeFieldId);
          if (currentIndex < config.fields.length - 1) {
            setActiveFieldId(config.fields[currentIndex + 1].id);
          }
        }
      }
    }
  };

  // Form validity check
  const isFormValid = (() => {
    if (type === 'ecg') {
      return Boolean(uploadedFileName || isBluetoothSynced || values.pulse);
    }
    // For general fields, primary field must be filled
    const primaryField = config.fields[0];
    return Boolean(primaryField && values[primaryField.id] && values[primaryField.id].trim().length > 0);
  })();

  // Submit handler
  const handleComplete = () => {
    if (!isFormValid) return;
    const numericValues: Record<string, any> = {};
    Object.keys(values).forEach((k) => {
      if (values[k]) {
        numericValues[k] = values[k].includes('.') ? parseFloat(values[k]) : parseInt(values[k], 10);
      }
    });

    if (type === 'ecg') {
      numericValues.ecgStatus = ecgStatus;
      if (uploadedFileName) numericValues.fileName = uploadedFileName;
      if (isBluetoothSynced) numericValues.isBluetoothSynced = true;
    }

    onSubmit({
      type,
      timestamp,
      note,
      values: numericValues,
    });
  };

  // Photo / AI OCR upload simulation
  const handlePhotoUpload = () => {
    if (type === 'bp') {
      setValues({ sysBP: '118', diaBP: '78', pulse: '72' });
    } else if (type === 'spO2') {
      setValues({ spO2: '98', pulse: '70' });
    } else if (type === 'weight') {
      setValues({ weight: '68.5', height: '165', waist: '82' });
    } else if (type === 'rr') {
      setValues({ respRate: '16' });
    } else if (type === 'bt') {
      setValues({ bodyTemp: '36.5' });
    }
    showToast('📸 拍照 OCR辨識成功！數據已自動填入');
  };

  // Bluetooth upload simulation
  const handleBluetoothUpload = () => {
    if (type === 'bp') {
      setValues({ sysBP: '122', diaBP: '82', pulse: '74' });
    } else if (type === 'ecg') {
      setIsBluetoothSynced(true);
      setValues({ pulse: '74' });
      setEcgStatus('正常竇性心律，節律規則');
    }
    showToast('⚡ 藍芽裝置數據同步成功！');
  };

  // ECG File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      showToast(`📂 已選擇心電圖檔案：${file.name}`);
    }
  };

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3000);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none">
      {/* Main Card Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl w-full max-w-[360px] mx-auto border border-slate-100 flex flex-col gap-1.5 sm:gap-2 relative max-h-[96%] overflow-y-auto">
        {/* Toast Alert */}
        {statusToast && (
          <div className="absolute top-2 left-3 right-3 z-50 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-200">
            <span>{statusToast}</span>
            <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setStatusToast(null)} />
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between pt-0.5">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shrink-0"
            aria-label="返回"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">{config.title}</h2>
            <button
              onClick={() => setShowTipsModal(true)}
              className="text-slate-400 hover:text-orange-500 transition-colors p-0.5 cursor-pointer"
              title="查看衛教說明"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="w-8 h-8 shrink-0" /> {/* Spacer for symmetry */}
        </div>

        {/* Date & Time Selector Dropdown */}
        <button
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 transition-colors cursor-pointer"
        >
          <span>{timestamp}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* ECG MODE: Exclusive File Upload & Bluetooth Sync Options (No Manual Input / Keypad) */}
        {type === 'ecg' ? (
          <div className="space-y-2 sm:space-y-2.5 my-1">
            {/* File Upload Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="text-[11px] font-bold text-slate-500 bg-sky-50/80 px-3 py-1.5 rounded-lg border border-sky-100 text-center">
              心電圖不支援手動輸入，請選擇以下方式上傳：
            </div>

            {/* Two Exclusive Upload Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Method 1: Upload File */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  uploadedFileName
                    ? 'border-sky-500 bg-sky-50/80 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/30'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">上傳心電圖檔案</div>
                    <div className="text-[10px] font-medium text-slate-400">圖檔 / PDF 報告</div>
                  </div>
                </div>
                {uploadedFileName && <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />}
              </button>

              {/* Method 2: Bluetooth Sync */}
              <button
                type="button"
                onClick={handleBluetoothUpload}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  isBluetoothSynced
                    ? 'border-[#ee7326] bg-orange-50/80 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#ee7326] shrink-0">
                    <Bluetooth className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">藍芽同步上傳</div>
                    <div className="text-[10px] font-medium text-slate-400">連接 ECG 設備</div>
                  </div>
                </div>
                {isBluetoothSynced && <CheckCircle2 className="w-5 h-5 text-[#ee7326] shrink-0" />}
              </button>
            </div>

            {/* Upload Confirmation Status Badges */}
            {uploadedFileName && (
              <div className="p-2 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs font-bold text-sky-900">
                <div className="flex items-center gap-1.5 truncate">
                  <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">{uploadedFileName}</span>
                </div>
                <span className="text-emerald-700 text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 font-extrabold">
                  檔案已就緒
                </span>
              </div>
            )}

            {isBluetoothSynced && (
              <div className="p-2 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between text-xs font-bold text-orange-900">
                <div className="flex items-center gap-1.5">
                  <Bluetooth className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>藍芽同步成功（心律: {values.pulse || '74'} bpm）</span>
                </div>
                <span className="text-emerald-700 text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 font-extrabold">
                  裝置已就緒
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Measurement Input Fields (For non-ECG Vitals) */}
            <div
              className={`grid gap-1.5 sm:gap-2 ${
                config.fields.length === 3
                  ? 'grid-cols-3'
                  : config.fields.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {config.fields.map((f) => {
                const isActive = activeFieldId === f.id;
                const currentVal = values[f.id] || '';

                return (
                  <div
                    key={f.id}
                    onClick={() => setActiveFieldId(f.id)}
                    className={`p-1.5 sm:p-2 rounded-xl text-center border-2 cursor-pointer transition-all ${
                      isActive
                        ? 'border-[#ee7326] bg-orange-50/30 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[0.68rem] sm:text-xs font-extrabold text-slate-600 block mb-0.5 leading-none">
                      {f.label}
                    </span>
                    <div className="h-6 flex items-center justify-center font-mono">
                      {currentVal ? (
                        <span className="text-base sm:text-xl font-black text-slate-900">{currentVal}</span>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold text-slate-300">{f.placeholder}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Keypad Container */}
            <div className="bg-[#f2f4f6] p-2 rounded-xl">
              <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(num)}
                    className="py-1.5 sm:py-2 bg-white hover:bg-slate-50 active:bg-orange-100 text-slate-900 font-bold text-base sm:text-lg rounded-lg shadow-2xs active:scale-95 transition-all text-center leading-none cursor-pointer"
                  >
                    {num}
                  </button>
                ))}

                {/* Row 4 */}
                <button
                  onClick={() => handleKeypadPress('.')}
                  disabled={!config.allowDecimal}
                  className={`py-1.5 sm:py-2 font-bold text-base sm:text-lg rounded-lg transition-all text-center leading-none ${
                    config.allowDecimal
                      ? 'bg-white hover:bg-slate-50 text-slate-900 shadow-2xs cursor-pointer active:scale-95'
                      : 'bg-transparent text-transparent cursor-default'
                  }`}
                >
                  .
                </button>

                <button
                  onClick={() => handleKeypadPress('0')}
                  className="py-1.5 sm:py-2 bg-white hover:bg-slate-50 active:bg-orange-100 text-slate-900 font-bold text-base sm:text-lg rounded-lg shadow-2xs active:scale-95 transition-all text-center leading-none cursor-pointer"
                >
                  0
                </button>

                <button
                  onClick={() => handleKeypadPress('DEL')}
                  className="py-1.5 sm:py-2 bg-white hover:bg-red-50 text-red-500 font-bold text-xs sm:text-sm rounded-lg shadow-2xs active:scale-95 transition-all text-center leading-none cursor-pointer"
                >
                  刪除
                </button>
              </div>
            </div>

            {/* Action Upload Buttons */}
            <div className={`grid gap-1.5 ${config.hasCamera && config.hasBluetooth ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Camera Upload Button */}
              {config.hasCamera && (
                <button
                  onClick={handlePhotoUpload}
                  className="py-2 bg-[#ee7326] hover:bg-[#d9641d] active:bg-[#c55513] text-white font-bold text-xs sm:text-sm rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>拍照上傳</span>
                </button>
              )}

              {/* Bluetooth Upload Button */}
              {config.hasBluetooth && (
                <button
                  onClick={handleBluetoothUpload}
                  className="py-2 bg-white border-2 border-[#ee7326] text-[#ee7326] hover:bg-orange-50 font-bold text-xs sm:text-sm rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Bluetooth className="w-3.5 h-3.5" />
                  <span>藍芽上傳</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* Usage instructions link */}
        <div className="text-right">
          <button
            onClick={() => setShowInstructionsModal(true)}
            className="text-[11px] text-[#ee7326] hover:underline font-bold cursor-pointer"
          >
            ⓘ 使用說明
          </button>
        </div>

        {/* Note / Memo Input Field */}
        <div className="relative">
          <input
            type="text"
            value={note}
            maxLength={100}
            onChange={(e) => setNote(e.target.value)}
            placeholder="備註（最多 100 個字）"
            className="w-full pl-2.5 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ee7326] font-medium"
          />
          <span className="absolute right-2.5 top-2 text-[9px] text-slate-400 font-mono">
            {note.length}/100
          </span>
        </div>

        {/* Footer Pill Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            onClick={onClose}
            className="py-2 border-2 border-[#ee7326] text-[#ee7326] font-bold text-xs sm:text-sm rounded-full hover:bg-orange-50 transition-colors cursor-pointer text-center"
          >
            取消
          </button>

          <button
            onClick={handleComplete}
            disabled={!isFormValid}
            className={`py-2 font-bold text-xs sm:text-sm rounded-full transition-all shadow-2xs text-center ${
              isFormValid
                ? 'bg-[#7c838a] hover:bg-slate-700 active:scale-95 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            完成
          </button>
        </div>
      </div>

      {/* MODAL 1: Tips & Educational Help */}
      {showTipsModal && (
        <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-extrabold text-slate-900 text-base">{config.tipsTitle}</h3>
              <button onClick={() => setShowTipsModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{config.tipsContent}</p>
            <button
              onClick={() => setShowTipsModal(false)}
              className="w-full py-2.5 bg-[#ee7326] text-white font-bold rounded-xl text-xs hover:bg-[#d9641d]"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Instructions Modal */}
      {showInstructionsModal && (
        <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-extrabold text-slate-900 text-base">ⓘ 上傳與配對說明</h3>
              <button onClick={() => setShowInstructionsModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed font-medium">
              <p>1. <strong>拍照上傳</strong>：點擊「拍照上傳」按鈕，系統將自動拍攝量測計螢幕並進行 AI 文字辨識帶入數字。</p>
              <p>2. <strong>藍芽上傳</strong>：請確認手機藍芽已開啟，並點擊藍芽儀器上的紀錄傳輸按鈕即可自動配對上傳。</p>
              {config.hasFileUpload && (
                <p>3. <strong>檔案上傳</strong>：可將醫院印發或智慧手錶匯出之 ECG 心電圖報告圖檔 (JPG/PNG) 或 PDF 選擇上傳。</p>
              )}
            </div>
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="w-full py-2.5 bg-[#ee7326] text-white font-bold rounded-xl text-xs hover:bg-[#d9641d]"
            >
              閉合說明
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Date & Time Wheel Picker */}
      {showDatePicker && (
        <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-4 shadow-2xl w-full border-t border-slate-200">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-slate-100 mb-2">
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="text-slate-500 font-bold text-sm hover:text-slate-800"
              >
                取消
              </button>
              <span className="font-bold text-slate-900 text-sm">選擇量測時間</span>
              <button
                type="button"
                onClick={() => {
                  setShowDatePicker(false);
                  showToast('✅ 時間已更新');
                }}
                className="text-[#ee7326] font-bold text-sm hover:text-[#d9641d]"
              >
                確認
              </button>
            </div>

            <div className="p-4 text-center">
              <input
                type="datetime-local"
                defaultValue={now.toISOString().slice(0, 16)}
                onChange={(e) => {
                  if (e.target.value) {
                    const formatted = e.target.value.replace('T', ' ');
                    setTimestamp(formatted);
                  }
                }}
                className="p-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#ee7326]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
