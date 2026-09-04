import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  Map,
  Scan,
  Sparkles,
  Stethoscope,
  ChevronLeft
} from 'lucide-react';
import { ScreenId } from '../types';
import { BottomNavBar } from './BottomNavBar';
import { aimeeAvatar, blissAvatar } from '../constants/avatars';

interface Props {
  onNavigate: (screen: ScreenId) => void;
  onSelectExpert: (expertId: string) => void;
  step1Authorized: boolean;
  authorizedExpert: string | null;
  followedExperts: string[];
  onToggleFollow: (expertId: string) => void;
  greenPrescriptionOnly?: boolean;
  onOpenExpertMessage?: (expertId: string) => void;
}

interface ExpertItem {
  id: string;
  name: string;
  type: string;
  followers: string;
  posts: string;
  avatarType: 'bunny' | 'badge' | 'image';
  badgeTitle?: string;
  badgeSub?: string;
  badgeBg?: string;
  avatarImg?: string;
  isSelectable?: boolean;
  expertId?: string;
  hasGreenPrescription?: boolean;
}

export const Scr04ExpertList: React.FC<Props> = ({
  onNavigate,
  onSelectExpert,
  step1Authorized,
  authorizedExpert,
  followedExperts,
  onToggleFollow,
  greenPrescriptionOnly = false,
  onOpenExpertMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(greenPrescriptionOnly);

  // 專家名單資料
  const allExperts: ExpertItem[] = [
    {
      id: 'quanyin',
      name: '全銀運動',
      type: '健康服務',
      followers: '26,235 位追蹤者',
      posts: '27,900 篇發問數',
      avatarType: 'badge',
      badgeTitle: '全銀',
      badgeSub: '運動',
      badgeBg: 'bg-[#392e66]',
      hasGreenPrescription: false,
      isSelectable: true,
    },
    {
      id: 'family-medicine',
      name: '示範診所',
      type: '健康服務',
      followers: '42,580 位追蹤者',
      posts: '9,820 篇發問數',
      avatarType: 'badge',
      badgeTitle: '示範',
      badgeSub: '診所',
      badgeBg: 'bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800',
      hasGreenPrescription: true,
      isSelectable: true,
    },
    {
      id: 'wa-bunny',
      name: 'Wa 邦尼 人工智慧',
      type: '健康服務',
      followers: '107,253 位追蹤者',
      posts: '11,372 篇發問數',
      avatarType: 'bunny',
    },
    ...[
      ['greenfield-family', '青禾家庭醫學診所', true, '8,240 位追蹤者', '1,860 篇發問數', '青禾', '家醫', 'bg-emerald-700'],
      ['forest-wellness', '森沐健康診所', true, '7,680 位追蹤者', '1,540 篇發問數', '森沐', '健康', 'bg-teal-700'],
      ['sunny-lifestyle', '晴日生活醫學診所', true, '6,930 位追蹤者', '1,320 篇發問數', '晴日', '生活', 'bg-amber-600'],
      ['health-sequence', '康序家庭診所', true, '6,410 位追蹤者', '1,180 篇發問數', '康序', '家庭', 'bg-sky-700'],
      ['balance-wellness', '樂衡健康診所', true, '5,880 位追蹤者', '1,060 篇發問數', '樂衡', '健康', 'bg-indigo-700'],
      ['good-cycle', '好循環生活診所', true, '5,320 位追蹤者', '940 篇發問數', '好循', '環生', 'bg-violet-700'],
      ['orange-heart', '橙心家庭醫學診所', true, '4,960 位追蹤者', '860 篇發問數', '橙心', '家醫', 'bg-orange-600'],
      ['green-sprout', '綠芽健康診所', true, '4,580 位追蹤者', '790 篇發問數', '綠芽', '健康', 'bg-green-700'],
      ['steady-step', '安步生活診所', true, '4,120 位追蹤者', '720 篇發問數', '安步', '生活', 'bg-cyan-700'],
      ['evergreen-family', '長青家庭診所', true, '3,760 位追蹤者', '650 篇發問數', '長青', '家庭', 'bg-lime-700'],
      ['morning-light', '晨光家醫診所', false, '3,420 位追蹤者', '590 篇發問數', '晨光', '家醫', 'bg-blue-700'],
      ['warm-care', '和煦健康診所', false, '3,080 位追蹤者', '540 篇發問數', '和煦', '健康', 'bg-pink-700'],
      ['first-heart', '初心家庭診所', false, '2,760 位追蹤者', '480 篇發問數', '初心', '家庭', 'bg-rose-700'],
      ['sun-bath', '沐陽生活診所', false, '2,430 位追蹤者', '420 篇發問數', '沐陽', '生活', 'bg-yellow-700'],
      ['health-bridge', '康橋健康診所', false, '2,180 位追蹤者', '380 篇發問數', '康橋', '健康', 'bg-slate-700'],
      ['happy-health', '樂康家庭診所', false, '1,940 位追蹤者', '340 篇發問數', '樂康', '家庭', 'bg-red-700'],
      ['sunny-river', '晴川家醫診所', false, '1,720 位追蹤者', '300 篇發問數', '晴川', '家醫', 'bg-fuchsia-700'],
      ['caring-heart', '仁心生活診所', false, '1,510 位追蹤者', '260 篇發問數', '仁心', '生活', 'bg-purple-700'],
      ['peaceful-harmony', '安禾健康診所', false, '1,280 位追蹤者', '220 篇發問數', '安禾', '健康', 'bg-stone-700'],
      ['joyful-life', '悅活家庭診所', false, '1,060 位追蹤者', '180 篇發問數', '悅活', '家庭', 'bg-zinc-700'],
    ].map(([id, name, hasGreenPrescription, followers, posts, badgeTitle, badgeSub, badgeBg]) => ({
      id: id as string,
      name: name as string,
      type: '醫療院所',
      followers: followers as string,
      posts: posts as string,
      avatarType: 'badge' as const,
      badgeTitle: badgeTitle as string,
      badgeSub: badgeSub as string,
      badgeBg: badgeBg as string,
      hasGreenPrescription: hasGreenPrescription as boolean,
      isSelectable: true,
    })),
  ];

  const discovering = greenPrescriptionOnly || isDiscovering;
  const baseExperts = greenPrescriptionOnly
    ? allExperts.filter((exp) => exp.hasGreenPrescription === true)
    : discovering
      ? allExperts
      : allExperts.filter((exp) => followedExperts.includes(exp.id));

  // 搜尋過濾
  const displayedExperts = baseExperts.filter((exp) => {
    if (greenPrescriptionOnly && exp.hasGreenPrescription !== true) return false;
    if (!searchTerm.trim()) return true;
    const keyword = searchTerm.trim().toLowerCase();
    return (
      exp.name.toLowerCase().includes(keyword) ||
      exp.type.toLowerCase().includes(keyword) ||
      (keyword.includes('綠色處方') && exp.hasGreenPrescription === true)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white font-sans antialiased text-slate-900 select-none overflow-hidden justify-between">
      {/* 1. Header Bar with Centered Title & More Options */}
      <header className="px-4 py-3 bg-white sticky top-0 z-20 flex items-center justify-between min-h-[3.25rem]">
        {discovering && !greenPrescriptionOnly ? (
          <button
            className="p-1 -ml-1 text-slate-600 rounded-full hover:bg-slate-100"
            aria-label="返回已追蹤專家"
            onClick={() => { setIsDiscovering(false); setSearchTerm(''); }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : <div className="w-8" />}
        
        <h1 className="text-base font-black text-slate-900 tracking-tight text-center">
          {greenPrescriptionOnly ? '綠色處方專家' : discovering ? '搜尋更多專家帳號' : '專家名單'}
        </h1>

        <button
          className="p-1.5 -mr-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
          aria-label="更多選項"
        >
          <MoreVertical className="w-5 h-5 text-slate-400" />
        </button>
      </header>

      {/* 2. Search & Tool Row (Map Icon + Search Input + Scan Icon) */}
      <div className="px-4 py-2 bg-white flex items-center gap-3 shrink-0">
        <button
          className="p-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="地圖檢視"
        >
          <Map className="w-6 h-6 text-slate-700 stroke-[1.75]" />
        </button>

        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => { if (!greenPrescriptionOnly) setIsDiscovering(true); }}
            placeholder="搜尋更多專家帳號"
            className="w-full pl-10 pr-4 py-2.5 bg-[#F2F3F6] rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 text-slate-800 font-medium"
          />
        </div>

        <button
          className="p-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="掃描條碼"
        >
          <Scan className="w-6 h-6 text-slate-700 stroke-[1.75]" />
        </button>
      </div>

      {/* 3. Expert List Items */}
      <div className="flex-1 overflow-y-auto min-h-0 touch-pan-y divide-y divide-slate-100">
        {displayedExperts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <p className="text-sm font-bold text-slate-600">查無此專家</p>
            <p className="text-xs">請嘗試搜尋其他關鍵字！</p>
          </div>
        ) : (
          displayedExperts.map((exp) => {
            const isAuthorized = step1Authorized && authorizedExpert === exp.id;

            return (
              <div
                key={exp.id}
                onClick={() => {
                  if (exp.isSelectable) onSelectExpert(exp.expertId || exp.id);
                }}
                  className={`px-4 py-4 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 ${
                  exp.isSelectable ? 'cursor-pointer' : ''
                }`}
              >
                {/* Left: Custom Avatar Badge */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {exp.avatarType === 'bunny' ? (
                    // Wa 邦尼 AI Avatar
                    <div className="w-14 h-14 rounded-full bg-[#EBF5FE] border border-sky-200/80 flex flex-col items-center justify-center p-1 relative overflow-hidden shrink-0 shadow-2xs">
                      <div className="text-[7px] text-sky-800 font-extrabold leading-none tracking-tighter text-center">
                        AI人工智慧
                      </div>
                      <div className="w-6 h-6 rounded-md bg-amber-400 border border-amber-500 flex items-center justify-center my-0.5 shadow-2xs">
                        <span className="text-[12px]">🐰</span>
                      </div>
                      <div className="flex items-center gap-0.5 leading-none">
                        <span className="text-[7px] font-black text-sky-900">Wa邦尼</span>
                        <span className="text-[6px] bg-red-500 text-white font-bold px-0.5 rounded-xs scale-90">
                          24hr服務
                        </span>
                      </div>
                    </div>
                  ) : exp.id === 'quanyin' ? (
                    // 全銀運動 Avatar Badge
                    <div className="w-14 h-14 rounded-full bg-[#392e66] text-white flex flex-col items-center justify-center text-center p-1 leading-none shadow-2xs relative shrink-0 border border-white/20 overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#5a4a9c_0%,#281e52_100%)]" />
                      <div className="relative z-10 flex flex-col items-center">
                        <span className="text-[11px] font-black tracking-tight leading-none text-white">
                          全銀
                        </span>
                        <span className="text-[11px] font-black tracking-tight leading-none text-white mt-0.5">
                          運動
                        </span>
                        <span className="text-[7px] text-[#f37021] font-black mt-0.5">
                          🧡 WaCare
                        </span>
                      </div>
                    </div>
                  ) : exp.avatarType === 'badge' ? (
                    // Circular Medical/Service Badge
                    <div
                      className={`w-14 h-14 rounded-full ${exp.badgeBg} text-white flex flex-col items-center justify-center text-center p-1 leading-none shadow-2xs relative shrink-0 border border-white/20`}
                    >
                      <span className="text-[11px] font-black tracking-tight leading-tight drop-shadow-xs">
                        {exp.badgeTitle}
                        <br />
                        {exp.badgeSub}
                      </span>
                      <span className="text-[7px] text-amber-200 font-bold mt-0.5 tracking-tighter">
                        ❤️ WaCare
                      </span>
                    </div>
                  ) : (
                    // Image Avatar
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                      <img
                        src={exp.avatarImg}
                        alt={exp.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Middle Information */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="font-bold text-slate-900 text-sm tracking-tight">
                        {exp.name}
                      </h2>
                      {isAuthorized && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded-full shrink-0">
                          已授權
                        </span>
                      )}
                      {exp.hasGreenPrescription && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          綠色處方
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      {exp.type}
                    </div>

                    <div className="flex flex-col gap-0.5 text-xs font-medium">
                      <span className="text-slate-500">{exp.followers}</span>
                      <span className="text-[#E65100] font-bold">{exp.posts}</span>
                    </div>
                  </div>
                </div>

                {/* Right: "訊息" Pill Button */}
                <div
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {followedExperts.includes(exp.id) ? <button
                    type="button"
                    onClick={() => onOpenExpertMessage ? onOpenExpertMessage(exp.id) : onNavigate('MESSAGES')}
                    className="px-4 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EA] active:scale-95 text-slate-800 font-bold text-xs rounded-full transition-all cursor-pointer shadow-2xs"
                    data-expert-message-button={exp.id}
                  >
                    訊息
                  </button> : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Shared Bottom Navigation Bar */}
      <BottomNavBar activeTab="expert" onNavigate={onNavigate} />
    </div>
  );
};
