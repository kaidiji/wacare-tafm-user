import React, { useState } from 'react';
import { ArrowLeft, Check, Lightbulb, FolderCheck } from 'lucide-react';
import { ScreenId } from '../types';
import { aimeeAvatar, blissAvatar } from '../constants/avatars';

interface Props {
  expertId?: string;
  onNavigate: (screen: ScreenId) => void;
  onAuthorizeSuccess: (expId: string) => void;
}

interface AuthItem {
  id: string;
  label: string;
  subtext?: string;
  isSpecial?: 'profile' | 'advice';
}

export const DataAuthorizationScreen: React.FC<Props> = ({
  expertId = 'greenPrescription',
  onNavigate,
  onAuthorizeSuccess,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Checkbox states matching IMG_8943.PNG
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({
    profile: true,
    advice: true,
    notes: true,
    bloodSugar: true,
    bloodOxygen: true,
    weather: true,
    menHealth: true,
    clinicVisit: true,
  });

  const getExpertDetails = () => {
    if (expertId === 'aimee') {
      return {
        name: 'Aimee(艾咪) 血壓衛教助理',
        avatarImg: aimeeAvatar,
        isCustomAvatar: false,
        type: 'aimee',
      };
    }
    if (expertId === 'bliss') {
      return {
        name: 'Bliss(比莉) 血壓衛教助理',
        avatarImg: blissAvatar,
        isCustomAvatar: false,
        type: 'bliss',
      };
    }
    if (expertId === 'family-medicine') {
      return {
        name: '示範診所',
        avatarImg: '',
        isCustomAvatar: true,
        type: 'expert',
        title: '示範診所',
        sub: '綠色處方燈',
      };
    }
    // Default or greenPrescription/quanyin: 全銀運動 健康服務
    return {
      name: '全銀運動',
      avatarImg: '',
      isCustomAvatar: true,
      type: 'quanyin',
      title: '全銀',
      sub: '運動',
    };
  };

  const expertInfo = getExpertDetails();

  const handleToggle = (key: string) => {
    setSelectedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Human readable label mappings
  const itemLabels: Record<string, string> = {
    profile: '個人檔案',
    advice: '專家建議',
    notes: '筆記',
    bloodSugar: '血糖',
    bloodOxygen: '血氧',
    weather: '氣象',
    menHealth: '男性健康',
    clinicVisit: '回診',
  };

  const authorizedItemListString = Object.entries(selectedItems)
    .filter(([_, isChecked]) => isChecked)
    .map(([key]) => itemLabels[key] || key)
    .join('、');

  const handleSaveAndConsent = () => {
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    setShowConfirmModal(false);
    onAuthorizeSuccess(expertId || 'quanyin');
    if (expertId === 'aimee' || expertId === 'bliss') {
      onNavigate('SCR-04');
    } else if (expertId === 'family-medicine') {
      onNavigate('MESSAGES');
    } else {
      onNavigate('GREEN-PRESCRIPTION-TASKS');
    }
  };

  const handleGoBack = () => {
    if (expertId === 'aimee' || expertId === 'bliss') {
      onNavigate('SCR-04');
    } else if (expertId === 'family-medicine') {
      onNavigate('MESSAGES');
    } else {
      onNavigate('GREEN-PRESCRIPTION-TASKS');
    }
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col justify-between select-none relative font-sans">
      {/* Top Header Bar */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between shadow-2xs">
        <button
          type="button"
          onClick={handleGoBack}
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm">
          <FolderCheck className="w-4 h-4 text-slate-500" />
          <span>分享健康數據給專家</span>
        </div>

        <div className="w-9" />
      </div>

      {/* Main Content (IMG_8943.PNG) */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto max-w-md mx-auto w-full pb-24">
        {/* Channel / Expert Avatar & Info */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          {expertInfo.isCustomAvatar ? (
            expertInfo.type === 'quanyin' ? (
              <div className="w-24 h-24 rounded-full bg-[#392e66] text-white flex flex-col items-center justify-center shadow-md border-4 border-white ring-2 ring-orange-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#5a4a9c_0%,#281e52_100%)]" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <span className="text-sm font-black tracking-tight text-white">全銀</span>
                  <span className="text-sm font-black tracking-tight text-white -mt-0.5">運動</span>
                  <span className="text-[#f37021] text-[9px] font-black mt-0.5">🧡 WaCare</span>
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-teal-500 via-emerald-600 to-teal-800 text-white flex flex-col items-center justify-center shadow-md border-4 border-white ring-2 ring-teal-100">
                <span className="text-2xl mb-0.5">🌿</span>
                <span className="text-[11px] font-black tracking-tight leading-none text-center">健康專家</span>
              </div>
            )
          ) : (
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-4 border-white bg-slate-100">
              <img src={expertInfo.avatarImg} alt={expertInfo.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{expertInfo.name}</h2>
              <span className="text-xs font-semibold text-slate-500">健康服務</span>
            </div>
            {expertInfo.type === 'quanyin' && (
              <p className="text-[11px] text-slate-400 font-medium">全銀數位社會處方推廣頻道</p>
            )}
          </div>

          <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-0.5 rounded-full border border-rose-100">
            成功關注專家！
          </span>

          <p className="text-xs text-slate-500 leading-relaxed px-3">
            同意專家瀏覽您的健康數據資料，提供您個人化的健康照顧與生活處方指導，您可以隨時在設定中取消分享。（其他健康資料會陸續開放分享）
          </p>
        </div>

        {/* Authorization Scope Checkbox List (IMG_8943.PNG) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4 text-xs">
          {/* 1. 個人檔案 */}
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <label
              onClick={() => handleToggle('profile')}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <span className="text-slate-500 text-base">👤</span>
                <span>個人檔案</span>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  selectedItems.profile ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {selectedItems.profile && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </label>
            <p className="text-[11px] text-slate-400 leading-normal pl-6">
              請注意，您將分享個人檔案，包含出生年月日、身分證字號等個人機敏資訊，請再次做確認。
            </p>
          </div>

          {/* 2. 專家建議 */}
          <div className="pb-3 border-b border-slate-100">
            <label
              onClick={() => handleToggle('advice')}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>專家建議</span>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  selectedItems.advice ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {selectedItems.advice && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </label>
          </div>

          {/* Lightbox hint banner */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 leading-relaxed">
            當出現「您尚未開啟」的健康燈項目，在您同意授權專家時系統將一併幫您開啟
          </div>

          {/* 3. 筆記 */}
          <div className="pb-3 border-b border-slate-100">
            <label
              onClick={() => handleToggle('notes')}
              className="flex items-center justify-between cursor-pointer group"
            >
              <span className="font-bold text-slate-800 text-sm pl-1">筆記</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  selectedItems.notes ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {selectedItems.notes && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </label>
          </div>

          {/* 4. 血糖 */}
          <div className="pb-3 border-b border-slate-100">
            <label
              onClick={() => handleToggle('bloodSugar')}
              className="flex items-center justify-between cursor-pointer group"
            >
              <span className="font-bold text-slate-800 text-sm pl-1">血糖</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  selectedItems.bloodSugar ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {selectedItems.bloodSugar && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </label>
          </div>

          {/* 5. 血氧 */}
          <div className="pb-3 border-b border-slate-100">
            <label
              onClick={() => handleToggle('bloodOxygen')}
              className="flex items-center justify-between cursor-pointer group"
            >
              <span className="font-bold text-slate-800 text-sm pl-1">血氧</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  selectedItems.bloodOxygen ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {selectedItems.bloodOxygen && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </label>
          </div>

          {/* 6. 氣象 */}
          <div className="pb-3 border-b border-slate-100">
            <label
              onClick={() => handleToggle('weather')}
              className="flex items-center justify-between cursor-pointer group"
            >
              <span className="font-bold text-slate-800 text-sm pl-1">氣象</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  selectedItems.weather ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {selectedItems.weather && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </label>
          </div>

          {/* 7. 男性健康 */}
          <div className="pb-3 border-b border-slate-100">
            <label
              onClick={() => handleToggle('menHealth')}
              className="flex items-center justify-between cursor-pointer group"
            >
              <span className="font-bold text-slate-800 text-sm pl-1">男性健康</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  selectedItems.menHealth ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {selectedItems.menHealth && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </label>
          </div>

          {/* 8. 回診 */}
          <div className="pb-1">
            <label
              onClick={() => handleToggle('clinicVisit')}
              className="flex items-center justify-between cursor-pointer group"
            >
              <span className="font-bold text-slate-800 text-sm pl-1">回診</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  selectedItems.clinicVisit ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {selectedItems.clinicVisit && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Bottom Fixed Action Buttons (IMG_8943.PNG) */}
      <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 left-0 right-0 z-20 flex items-center gap-3 shadow-lg">
        <button
          type="button"
          onClick={handleGoBack}
          className="flex-1 py-3 border border-orange-500 text-orange-600 font-bold text-sm rounded-full hover:bg-orange-50 transition-colors cursor-pointer text-center"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleSaveAndConsent}
          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-full shadow-md shadow-orange-500/20 transition-all cursor-pointer text-center active:scale-98"
        >
          儲存並同意
        </button>
      </div>

      {/* Confirmation Modal ("確認授權" Popup matching IMG_8944.PNG) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-amber-500 tracking-tight">確認授權</h3>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p className="text-slate-500">再次確認是否</p>
              <p className="text-slate-800">
                授權分享健康數據給 <span className="font-bold text-slate-900">{expertInfo.name}</span>：
              </p>
              <div className="pt-1">
                <p className="text-slate-800 font-medium px-2 py-1 leading-relaxed">
                  {authorizedItemListString || '個人檔案、血氧、筆記、血糖、氣象、男性健康、回診'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-orange-500 text-orange-600 font-bold text-xs rounded-full hover:bg-orange-50 transition-colors cursor-pointer bg-white"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-full shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              >
                儲存授權
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
