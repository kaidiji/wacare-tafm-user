import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Check, Camera, ShieldCheck, User } from 'lucide-react';
import { UserProfile, ScreenId } from '../types';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateBack: () => void;
}

export const RealNameVerification: React.FC<Props> = ({
  profile,
  onUpdateProfile,
  onNavigateBack,
}) => {
  const [editingField, setEditingField] = useState<keyof UserProfile | null>(null);
  const [tempValue, setTempValue] = useState('');

  const openEdit = (field: keyof UserProfile) => {
    setEditingField(field);
    setTempValue(profile[field] || '');
  };

  const handleSaveField = () => {
    if (editingField) {
      onUpdateProfile({
        ...profile,
        [editingField]: tempValue,
      });
      setEditingField(null);
    }
  };

  const isRealNameComplete =
    Boolean(profile.realName?.trim()) &&
    Boolean(profile.birthday?.trim()) &&
    Boolean(profile.gender?.trim()) &&
    profile.gender !== '無' &&
    profile.gender !== '未設定' &&
    Boolean(profile.idNumber?.trim());

  return (
    <div className="min-h-full bg-slate-100 flex flex-col justify-between select-none relative overflow-y-auto">
      {/* Top Bar (IMG_8674/IMG_8675 Header) */}
      <div className="bg-white px-4 py-3.5 border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between shadow-2xs">
        <button
          onClick={onNavigateBack}
          className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base font-black text-slate-900">個人檔案</h1>

        <div className="w-9" />
      </div>

      {/* Main Scrollable Profile List Container */}
      <div className="p-4 space-y-4 max-w-md mx-auto w-full pb-12">
        {/* Verification Status Banner */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-2xs ${
            isRealNameComplete
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            <ShieldCheck className={`w-5 h-5 ${isRealNameComplete ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div>
              <div className="font-extrabold">
                {isRealNameComplete ? '個人資料：已完成個人檔案驗證' : '個人資料：檔案資料未齊全'}
              </div>
              <div className="text-[11px] font-normal opacity-80">
                {isRealNameComplete
                  ? '姓名、生日、性別與身分證字號已填寫完成'
                  : '請填寫真實姓名、生日、性別與身分證字號'}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Top Header */}
        <div className="text-center py-2">
          <div className="relative w-24 h-24 mx-auto mb-2">
            <div className="w-24 h-24 rounded-full bg-slate-200 border-2 border-white shadow-md flex items-center justify-center text-slate-500 overflow-hidden">
              <User className="w-12 h-12" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 1: 個人健康資訊 (IMG_8675) */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-500 px-2 py-1">個人健康資訊</div>

          <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 shadow-2xs overflow-hidden">
            {/* 暱稱 */}
            <div
              onClick={() => openEdit('nickname')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-900 block">暱稱</span>
                <span className="text-xs text-slate-500 font-medium">
                  {profile.nickname || '未設定 (點擊填寫)'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* 生日 (Required for Real-Name) */}
            <div
              onClick={() => openEdit('birthday')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  生日
                  {!profile.birthday && <span className="text-[10px] text-red-500 font-bold">*必填</span>}
                </span>
                <span
                  className={`text-xs font-medium ${
                    profile.birthday ? 'text-slate-800 font-bold' : 'text-slate-400'
                  }`}
                >
                  {profile.birthday || '未設定 (點擊填寫，例如 1988/05/12)'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* 性別 (Required for Real-Name) */}
            <div
              onClick={() => openEdit('gender')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  性別
                  {(!profile.gender || profile.gender === '無' || profile.gender === '未設定') && (
                    <span className="text-[10px] text-red-500 font-bold">*必填</span>
                  )}
                </span>
                <span
                  className={`text-xs font-medium ${
                    profile.gender && profile.gender !== '無' && profile.gender !== '未設定'
                      ? 'text-slate-800 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {profile.gender || '無 (點擊選擇 男 / 女)'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* 身高 */}
            <div
              onClick={() => openEdit('height')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-900 block">身高</span>
                <span className="text-xs text-slate-500 font-medium">
                  {profile.height ? `${profile.height} 公分` : '0 公分'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* 體重 */}
            <div
              onClick={() => openEdit('weight')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-900 block">體重</span>
                <span className="text-xs text-slate-500 font-medium">
                  {profile.weight ? `${profile.weight} 公斤` : '0 公斤'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* 血型 */}
            <div
              onClick={() => openEdit('bloodType')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-900 block">血型</span>
                <span className="text-xs text-slate-500 font-medium">
                  {profile.bloodType || '未設定'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Section 2: 個人證件資訊 (IMG_8674) */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-500 px-2 py-1">個人證件資訊</div>

          <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 shadow-2xs overflow-hidden">
            {/* 真實姓名 (Required for Real-Name) */}
            <div
              onClick={() => openEdit('realName')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  真實姓名
                  {!profile.realName && <span className="text-[10px] text-red-500 font-bold">*必填</span>}
                </span>
                <span
                  className={`text-xs font-medium ${
                    profile.realName ? 'text-slate-800 font-bold' : 'text-slate-400'
                  }`}
                >
                  {profile.realName || '請輸入真實姓名 (例如：紀凱迪)'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* 手機 */}
            <div
              onClick={() => openEdit('phone')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-900 block">手機</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-xs font-bold ${profile.phone ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {profile.phone || '未驗證 (點擊填寫)'}
                  </span>
                  {profile.phone && (
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* 電子信箱 */}
            <div
              onClick={() => openEdit('email')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-900 block">電子信箱</span>
                <span className="text-xs text-slate-500 font-medium">
                  {profile.email || '未設定 (點擊填寫)'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* 身分證字號 (Required for Real-Name) */}
            <div
              onClick={() => openEdit('idNumber')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  身分證字號
                  {!profile.idNumber && <span className="text-[10px] text-red-500 font-bold">*必填</span>}
                </span>
                <span
                  className={`text-xs font-medium ${
                    profile.idNumber ? 'text-slate-800 font-bold' : 'text-slate-400'
                  }`}
                >
                  {profile.idNumber || '請輸入身分證字號 (例如：A123456789)'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Footer Disclaimer Text */}
        <p className="text-[11px] text-slate-400 leading-relaxed px-2 text-justify">
          WaCare 所搜集之資訊可能涉及您個人之醫療資訊，如經您提供，代表已書面同意本公司依使用者條款搜集、處理及利用。
        </p>

        {/* Back / Save Button */}
        <div className="pt-2">
          <button
            onClick={onNavigateBack}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer active:scale-98 transition-all"
          >
            完成資料填寫並儲存
          </button>
        </div>
      </div>

      {/* Editing Dialog Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-900">
              修改{' '}
              {editingField === 'realName'
                ? '真實姓名'
                : editingField === 'birthday'
                ? '生日'
                : editingField === 'gender'
                ? '性別'
                : editingField === 'idNumber'
                ? '身分證字號'
                : editingField === 'nickname'
                ? '暱稱'
                : editingField === 'phone'
                ? '手機'
                : editingField === 'email'
                ? '電子信箱'
                : editingField === 'height'
                ? '身高'
                : editingField === 'weight'
                ? '體重'
                : '血型'}
            </h3>

            {editingField === 'gender' ? (
              <div className="grid grid-cols-3 gap-2">
                {['男', '女', '其他'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setTempValue(g)}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      tempValue === g
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            ) : editingField === 'birthday' ? (
              <input
                type="date"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder="請輸入內容"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingField(null)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveField}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
