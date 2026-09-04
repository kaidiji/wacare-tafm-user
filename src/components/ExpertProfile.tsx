import React, { useState } from 'react';
import { ArrowLeft, Share2, MessageCircle, HelpCircle, ShieldCheck, MoreHorizontal, Heart, Check, Sparkles, Plus } from 'lucide-react';
import { ScreenId, Activity722State } from '../types';
import { aimeeAvatar, blissAvatar } from '../constants/avatars';
import { CreateDiscussionModal } from './heartCare/CreateDiscussionModal';

interface Props {
  expertId: string;
  onNavigate: (screen: ScreenId) => void;
  activityState: Activity722State;
  onAuthorizeSuccess: (expertId: 'aimee' | 'bliss') => void;
}

export const ExpertProfile: React.FC<Props> = ({
  expertId,
  onNavigate,
  activityState,
  onAuthorizeSuccess,
}) => {
  const isAuthorized = activityState.step1Authorized && activityState.authorizedExpert === expertId;
  const canAuthorizeHealthData = expertId === 'aimee' || expertId === 'bliss';
  const [showAuthModal, setShowAuthModal] = useState(() => canAuthorizeHealthData && !isAuthorized);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'discussion'>('discussion');

  const expertDataById = {
    aimee: {
      name: 'Aimee(艾咪) 血壓衛教助理',
      serviceTitle: '健康服務',
      followers: '4,241 位追蹤者',
      posts: '730 篇發問數',
      avatarImg: aimeeAvatar,
      color: 'bg-purple-100 text-purple-600',
      bannerBg: 'from-amber-400/20 via-orange-400/10 to-amber-200/20',
      discussionItems: [
        { name: '柯麗貞', time: '6 小時前', title: '血壓 123/80，需要再量一次嗎？', body: '123/80 需要再量一次嗎？', replies: 2, views: 1 },
        { name: 'Joy', time: '3 天前', title: '連續幾天血壓偏高，該怎麼辦...', body: '連續幾天血壓都高於 135 mmHg...', replies: 5, views: 12 },
      ],
    },
    bliss: {
      name: 'Bliss(比莉) 血壓衛教助理',
      serviceTitle: '健康服務',
      followers: '4,352 位追蹤者',
      posts: '224 篇發問數',
      avatarImg: blissAvatar,
      color: 'bg-rose-100 text-rose-600',
      bannerBg: 'from-rose-400/20 via-pink-400/10 to-rose-200/20',
      discussionItems: [
        { name: '美玲', time: '4 天前', title: '血壓偏低至 76/52 mmHg...', body: '血壓偏低到 76 52 70', replies: 1, views: 7 },
        { name: '阿信', time: '2 週前', title: '晚上量測血壓值記錄比較高', body: '晚上量測血壓值 132/85...', replies: 3, views: 18 },
      ],
    },
    'family-medicine': {
      name: '示範診所', serviceTitle: '綠色處方健康服務', followers: '42,580 位追蹤者', posts: '9,820 篇發問數', avatarImg: aimeeAvatar, color: 'bg-emerald-100 text-emerald-700', bannerBg: 'from-emerald-400/20 via-teal-400/10 to-emerald-200/20', discussionItems: [],
    },
    quanyin: {
      name: '全銀運動', serviceTitle: '綠色處方運動服務', followers: '26,235 位追蹤者', posts: '27,900 篇發問數', avatarImg: blissAvatar, color: 'bg-indigo-100 text-indigo-700', bannerBg: 'from-indigo-400/20 via-purple-400/10 to-indigo-200/20', discussionItems: [],
    },
  } as const;

  const simulatedExpertNames: Record<string, string> = {
    'greenfield-family': '青禾家庭醫學診所',
    'forest-wellness': '森沐健康診所',
    'sunny-lifestyle': '晴日生活醫學診所',
    'health-sequence': '康序家庭診所',
    'balance-wellness': '樂衡健康診所',
    'good-cycle': '好循環生活診所',
    'orange-heart': '橙心家庭醫學診所',
    'green-sprout': '綠芽健康診所',
    'steady-step': '安步生活診所',
    'evergreen-family': '長青家庭診所',
    'morning-light': '晨光家醫診所',
    'warm-care': '和煦健康診所',
    'first-heart': '初心家庭診所',
    'sun-bath': '沐陽生活診所',
    'health-bridge': '康橋健康診所',
    'happy-health': '樂康家庭診所',
    'sunny-river': '晴川家醫診所',
    'caring-heart': '仁心生活診所',
    'peaceful-harmony': '安禾健康診所',
    'joyful-life': '悅活家庭診所',
  };

  const expertData = expertDataById[expertId as keyof typeof expertDataById] ?? {
    name: simulatedExpertNames[expertId] || '專家診所',
    serviceTitle: '醫療院所',
    followers: '— 位追蹤者',
    posts: '— 篇發問數',
    avatarImg: aimeeAvatar,
    color: 'bg-emerald-100 text-emerald-700',
    bannerBg: 'from-emerald-400/20 via-teal-400/10 to-emerald-200/20',
    discussionItems: [],
  };

  const handleConfirmSaveAuthorization = () => {
    setShowConfirmModal(false);
    setShowAuthModal(false);
    if (expertId === 'aimee' || expertId === 'bliss') onAuthorizeSuccess(expertId);
    onNavigate('SCR-04');
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col justify-between select-none relative">
      {/* Top Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <button
          onClick={() => onNavigate('SCR-04')}
          className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 flex-1 mx-2 min-w-0 justify-center">
          <img src={expertData.avatarImg} alt={expertData.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs" />
          <div className="text-left min-w-0">
            <h2 className="text-sm font-black text-slate-900 truncate max-w-[170px]">{expertData.name}</h2>
            <span className="text-[10px] text-slate-400 font-medium block leading-none">{expertData.serviceTitle}</span>
          </div>
        </div>

        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Banner Card Header (IMG_8663 / IMG_8664) */}
        <div className="p-4 bg-linear-to-b from-orange-400/30 to-slate-50">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center space-y-4">
            {/* Avatar Visual */}
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={expertData.avatarImg}
                alt={expertData.name}
                className="w-32 h-32 rounded-3xl object-cover shadow-md border-2 border-white"
              />
              <span className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-xs">
                ✓
              </span>
            </div>

            {/* Expert Info Text */}
            <div>
              <h1 className="text-lg font-black text-slate-900">{expertData.name}</h1>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">{expertData.serviceTitle}</p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-bold mt-2">
                <span>{expertData.followers}</span>
                <span>•</span>
                <span className="text-orange-600">{expertData.posts}</span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              <button className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 cursor-pointer">
                <MessageCircle className="w-4 h-4 text-slate-500" />
                <span>訊息</span>
              </button>

              <button className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 cursor-pointer">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>發問</span>
              </button>

              {/* Data Auth Button (Highlight) */}
              <button
                onClick={() => canAuthorizeHealthData && setShowAuthModal(true)}
                disabled={!canAuthorizeHealthData}
                className={`py-2 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  !canAuthorizeHealthData
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    :
                  isAuthorized
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 ring-2 ring-orange-400 ring-offset-1'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{canAuthorizeHealthData ? (isAuthorized ? '已授權' : '數據授權') : '專家資訊'}</span>
              </button>

              <button disabled className="py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 flex flex-col items-center justify-center gap-1 cursor-not-allowed opacity-50">
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                <span>更多</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation (關於我 / 討論區) */}
        <div className="bg-white border-b border-slate-200 px-4 flex">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'border-orange-500 text-orange-600 font-extrabold'
                : 'border-transparent text-slate-500'
            }`}
          >
            關於我
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === 'discussion'
                ? 'border-orange-500 text-orange-600 font-extrabold'
                : 'border-transparent text-slate-500'
            }`}
          >
            討論區
          </button>
        </div>

        {/* Discussion Content */}
        {activeTab === 'discussion' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold text-slate-600 flex-1">
                <span className="px-3 py-1 bg-orange-500 text-white rounded-full shrink-0">健康促進</span>
                <span className="px-3 py-1 bg-slate-100 rounded-full shrink-0">自我保健</span>
                <span className="px-3 py-1 bg-slate-100 rounded-full shrink-0">照顧問題</span>
                <span className="px-3 py-1 bg-slate-100 rounded-full shrink-0">日常養生</span>
                <span className="px-3 py-1 bg-slate-100 rounded-full shrink-0">飲食營養</span>
              </div>
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="px-3 py-1 bg-[#ee7326] text-white font-bold text-xs rounded-xl hover:bg-[#d8621b] transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>發起討論</span>
              </button>
            </div>

            {expertData.discussionItems.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                    {item.name.substring(0, 1)}
                  </div>
                  <span className="font-bold text-slate-700">{item.name}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.body}</p>

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-50">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-slate-400" /> {item.replies} 回應
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-sm text-[10px]">
                    專家回應
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Tab Content */}
        {activeTab === 'about' && (
          <div className="p-4 space-y-3 text-xs text-slate-600 leading-relaxed bg-white my-2 rounded-2xl shadow-2xs border border-slate-100 mx-4">
            <h3 className="font-bold text-slate-900 text-sm mb-1">關於專家團隊</h3>
            <p>
              血壓衛教團隊致力於為高血壓與心血管風險民眾提供零距離的個人化健康衛教指導。協助使用者記錄、解讀血壓趨勢並獲得生活型態改善建議。
            </p>
          </div>
        )}
      </div>

      {/* Floating Ask Question Button */}
      <div className="p-4 sticky bottom-0 z-10 bg-gradient-to-t from-slate-50 to-transparent flex justify-center">
        <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all">
          <span>發問</span>
        </button>
      </div>

      {/* Step 1 Data Authorization Modal (IMG_8665) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150 select-none">
          <div className="bg-white rounded-t-3xl max-w-md w-full mx-auto max-h-[90vh] flex flex-col shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400 font-bold">分享健康數據給專家</span>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Consent Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl mx-auto border border-orange-100">
                  {'avatarEmoji' in expertData ? expertData.avatarEmoji : '🏥'}
                </div>
                <h3 className="font-black text-slate-900 text-base">{expertData.name}</h3>
                <span className="text-xs font-bold text-red-500 block">成功關注專家！</span>
                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  同意專家瀏覽您的資料，給予彼您實質的健康照顧，您可以隨時取消分享健康數據。（其他健康資料會陸續開放分享）
                </p>
              </div>

              {/* Checkboxes Card List */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                {/* Checkbox 1: 個人檔案 */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-orange-500 w-4 h-4 rounded" />
                  <div>
                    <span className="font-extrabold text-slate-900">個人檔案</span>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      請注意，您將分享個人檔案，包含出生年月日、身分證字號等個人機敏資訊，請再次做確認。
                    </p>
                  </div>
                </label>

                {/* Checkbox 2: 專家建議 */}
                <label className="flex items-center justify-between pt-2 border-t border-slate-200 cursor-pointer">
                  <span className="font-bold text-slate-800">專家建議</span>
                  <input type="checkbox" defaultChecked className="accent-orange-500 w-4 h-4 rounded" />
                </label>

                {/* Checkbox 3: 體重燈 */}
                <label className="flex items-center justify-between pt-2 border-t border-slate-200 cursor-pointer">
                  <span className="font-bold text-slate-800">體重燈</span>
                  <input type="checkbox" defaultChecked className="accent-orange-500 w-4 h-4 rounded" />
                </label>

                {/* Checkbox 4: 問卷燈 */}
                <label className="flex items-center justify-between pt-2 border-t border-slate-200 cursor-pointer">
                  <span className="font-bold text-slate-800">問卷燈</span>
                  <input type="checkbox" defaultChecked className="accent-orange-500 w-4 h-4 rounded" />
                </label>

                {/* Checkbox 5: 血壓 / 活動量 / 就醫紀錄 */}
                <label className="flex items-center justify-between pt-2 border-t border-slate-200 cursor-pointer">
                  <span className="font-bold text-slate-800">血壓與心律紀錄</span>
                  <input type="checkbox" defaultChecked className="accent-orange-500 w-4 h-4 rounded" />
                </label>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                當出現「您尚未開啟」的健康燈項目，在您同意授權專家時系統將一併幫您開啟
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-white flex gap-3 shrink-0">
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 py-3 border border-orange-400 text-orange-600 font-bold text-xs rounded-xl hover:bg-orange-50 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
              >
                儲存並同意
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 Double Confirmation Pop-up Modal (IMG_8666) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 border border-slate-100 text-center animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-amber-600">確認授權</h3>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              再次確認是否授權分享健康數據給{' '}
              <span className="font-bold text-orange-600">{expertData.name}</span> 健康服務：
              <br />
              <span className="text-slate-500 font-normal">
                個人檔案、體重燈、問卷燈、血壓、活動量、筆記
              </span>
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border border-orange-400 text-orange-600 font-bold text-xs rounded-xl hover:bg-orange-50 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSaveAuthorization}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer"
              >
                儲存授權
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreatePostModal && (
        <CreateDiscussionModal
          onClose={() => setShowCreatePostModal(false)}
          onSubmit={(postData) => {
            setShowCreatePostModal(false);
          }}
        />
      )}
    </div>
  );
};
