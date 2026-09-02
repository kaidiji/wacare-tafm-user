import React, { useState, useRef } from 'react';
import {
  Bell,
  ChevronRight,
  ChevronLeft,
  Settings,
  Search,
} from 'lucide-react';
import { ScreenId } from '../types';
import { BottomNavBar } from './BottomNavBar';
import bpActivityCardImage from '../assets/images/bp_activity_card_1785289078174.jpg';

interface Props {
  onNavigate: (screen: ScreenId) => void;
  nickname?: string;
  onOpenBloodPressure?: () => void;
  onOpenExperts?: () => void;
}

export const Scr03Home: React.FC<Props> = ({
  onNavigate,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const bannersCount = 4;

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollPos = container.scrollLeft;
    const itemWidth = container.clientWidth * 0.88;
    const index = Math.round(scrollPos / itemWidth);
    setActiveIndex(Math.min(Math.max(index, 0), bannersCount - 1));
  };

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const itemWidth = container.clientWidth * 0.88;
    container.scrollTo({
      left: index * (itemWidth + 12),
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsMouseDown(true);
    setHasDragged(false);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeftState(carouselRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !carouselRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasDragged(true);
    }
    carouselRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleCardClick = (targetScreen?: ScreenId) => {
    if (!hasDragged && targetScreen) {
      onNavigate(targetScreen);
    }
  };

  return (
    <div className="min-h-full bg-slate-100 flex flex-col justify-between select-none">
      {/* Top Search Header Bar */}
      <div className="bg-slate-700/90 backdrop-blur-xs text-white px-3.5 pt-3 pb-3 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('REAL-NAME')}
            className="p-1.5 text-slate-200 hover:text-white rounded-full cursor-pointer transition-colors"
            title="設定"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="健康問題找解答..."
              className="w-full pl-9 pr-3 py-2 bg-white text-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none shadow-inner font-medium"
            />
          </div>

          <button
            onClick={() => onNavigate('MESSAGES')}
            className="p-2 bg-slate-600/80 hover:bg-slate-600 text-slate-200 rounded-full relative cursor-pointer transition-colors"
            title="通知訊息"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-700" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 space-y-5">
        
        {/* Banner Carousel Area */}
        <div className="pt-3 px-1 relative group">
          
          {/* Scroll Navigation Left Button */}
          {activeIndex > 0 && (
            <button
              onClick={() => scrollToIndex(activeIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center shadow-lg hover:bg-slate-900/90 transition-all cursor-pointer backdrop-blur-xs"
              title="上一張"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Scroll Navigation Right Button */}
          {activeIndex < bannersCount - 1 && (
            <button
              onClick={() => scrollToIndex(activeIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center shadow-lg hover:bg-slate-900/90 transition-all cursor-pointer backdrop-blur-xs"
              title="下一張"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            ref={carouselRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 px-3 cursor-grab active:cursor-grabbing touch-pan-x py-1"
          >
            
            {/* Banner 1: 8月守護星兒 免費課程 */}
            <div
              onClick={() => handleCardClick()}
              className="snap-center shrink-0 w-[90%] bg-gradient-to-r from-teal-50/95 via-amber-50 to-orange-50 rounded-2xl p-4 border border-teal-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-amber-500 text-white font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                    8月守護星兒 免費課程
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-800 leading-tight tracking-tight">
                  從<span className="text-orange-600">手部力量</span>到<span className="text-orange-600">書寫準備</span>
                </h3>
                <p className="text-base font-black text-slate-800 mt-1">
                  陪孩子練出能力
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1 text-[9px] text-slate-500 font-bold">
                  <span className="bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80">握筆容易累</span>
                  <span className="bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80">扣扣子卡關</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
                >
                  免費課程
                </button>
              </div>
            </div>

            {/* Banner 2: 722 血壓量測原則與健康指南 */}
            <div
              onClick={() => handleCardClick()}
              className="snap-center shrink-0 w-[90%] bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl overflow-hidden shadow-md relative group/card hover:shadow-lg transition-all min-h-[160px]"
            >
              <div className="relative aspect-21/9 w-full overflow-hidden bg-slate-900 h-full">
                <img
                  src={bpActivityCardImage}
                  alt="722血壓量測原則"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="text-[10px] bg-orange-600 text-white font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    衛教主題 ❤️
                  </span>
                  <span className="text-[10px] bg-slate-800 text-white font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                    心血管健康
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h3 className="text-base font-black tracking-tight text-amber-200 drop-shadow-xs">
                    722 血壓量測健康原則
                  </h3>
                  <p className="text-[11px] text-slate-200 font-medium line-clamp-1">
                    連續7天量測、早晚各2次、每次量2遍取平均值，守護心臟健康！
                  </p>
                </div>
              </div>
            </div>

            {/* Banner 3: 全銀運動 線上體能鍛鍊 */}
            <div
              onClick={() => handleCardClick()}
              className="snap-center shrink-0 w-[90%] bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 rounded-2xl p-4 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-sky-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                    全銀運動 特訓營
                  </span>
                  <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                    銀髮防跌專題
                  </span>
                </div>
                <h3 className="text-lg font-black text-amber-200 leading-tight tracking-tight">
                  銀髮肌力與核心平衡訓練
                </h3>
                <p className="text-xs font-medium text-slate-100 mt-1">
                  每週線上開課，物理治療師專業指導
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-sky-200 font-bold">1,200+ 人已報名參與</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="bg-white/90 text-indigo-900 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md hover:bg-sky-50 transition-all cursor-pointer"
                >
                  全銀運動
                </button>
              </div>
            </div>

            {/* Banner 4: 腦健康與失智照護 專家講座 */}
            <div
              onClick={() => handleCardClick()}
              className="snap-center shrink-0 w-[90%] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-4 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-teal-300 text-teal-950 font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                    失智照護 專家對談
                  </span>
                </div>
                <h3 className="text-lg font-black text-emerald-100 leading-tight tracking-tight">
                  理解腦健康，陪家人走過記憶之旅
                </h3>
                <p className="text-xs font-medium text-teal-100 mt-1">
                  線上免費提問，神經內科醫師親自解答
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-teal-200 font-bold">每週三 晚上 20:00 直播</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="bg-amber-400 text-teal-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md hover:bg-amber-300 transition-all cursor-pointer"
                >
                  專家講座
                </button>
              </div>
            </div>

          </div>

          {/* Carousel Pagination Indicator Dots */}
          <div className="flex items-center justify-center gap-2 mt-2.5">
            {Array.from({ length: bannersCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 cursor-pointer rounded-full ${
                  activeIndex === idx
                    ? 'w-6 h-1.5 bg-orange-500'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Section 1: 專業頻道 */}
        <div className="px-4">
          <h2 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
            專業頻道
          </h2>
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-white rounded-2xl p-2 text-center shadow-xs border border-slate-100 flex flex-col items-center justify-center min-h-[80px] cursor-pointer hover:border-slate-300 transition-colors">
              <span className="text-sm font-black text-slate-900 leading-tight">失智<br />照護</span>
            </div>
            <div className="bg-white rounded-2xl p-2 text-center shadow-xs border border-slate-100 flex flex-col items-center justify-center min-h-[80px] cursor-pointer hover:border-slate-300 transition-colors">
              <span className="text-sm font-black text-slate-900 leading-tight">全銀<br />運動</span>
            </div>
            <div className="bg-white rounded-2xl p-2 text-center shadow-xs border border-slate-100 flex flex-col items-center justify-center min-h-[80px] cursor-pointer hover:border-slate-300 transition-colors">
              <span className="text-sm font-black text-slate-900 leading-tight">長照<br />積分</span>
            </div>
            <div className="bg-white rounded-2xl p-2 text-center shadow-xs border border-slate-100 flex flex-col items-center justify-center min-h-[80px] cursor-pointer hover:border-slate-300 transition-colors">
              <span className="text-sm font-black text-slate-900 leading-tight">社區<br />據點</span>
            </div>
            <div
              onClick={() => onNavigate('MESSAGES')}
              className="bg-orange-500 hover:bg-orange-600 rounded-2xl p-2 text-center shadow-md shadow-orange-500/20 flex flex-col items-center justify-center min-h-[80px] cursor-pointer transition-colors"
            >
              <span className="text-sm font-black text-white leading-tight">AI<br />問答</span>
            </div>
          </div>
        </div>

        {/* Section 2: 健康紀錄 */}
        <div className="px-4">
          <button
            onClick={() => onNavigate('HEALTH-DATA')}
            className="w-full bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm font-black text-slate-900">健康數據紀錄</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Section 3: 熱門課程 */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              熱門課程
            </h2>
            <button className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer">
              <span>全部課程</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex overflow-x-auto snap-x scrollbar-none gap-3 pb-2 -mx-4 px-4">
            {/* Course Card 1: 走過生命旅程的每個選擇 */}
            <div className="snap-start shrink-0 w-[260px] bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-shadow group">
              <div className="relative aspect-16/10 bg-teal-50 p-3 flex flex-col justify-between border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded font-bold">
                    WaCare 失智照護
                  </span>
                  <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">
                    套組
                  </span>
                </div>
                <div className="text-center my-auto py-2">
                  <div className="text-sm font-black text-teal-950 leading-tight">
                    走過生命旅程的<br />每個選擇
                  </div>
                  <div className="text-[10px] text-teal-700 mt-1 font-medium">
                    理解未來，送給自己與失智家人自在的生活
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 text-center font-bold">
                  7位重量級專家 6個失智家庭必經的重要時刻
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-black text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                  走過生命旅程的每個選擇...
                </h3>
              </div>
            </div>

            {/* Course Card 2: 肝好、胃好 身體好 */}
            <div className="snap-start shrink-0 w-[260px] bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-shadow group">
              <div className="relative aspect-16/10 bg-indigo-50 p-3 flex flex-col justify-between border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded font-bold">
                    7月健康特輯
                  </span>
                </div>
                <div className="text-center my-auto py-2">
                  <div className="text-base font-black text-indigo-950">
                    肝好、胃好 身體好
                  </div>
                  <div className="text-[10px] text-indigo-700 mt-1 font-medium">
                    從消化、排毒一次學會
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 text-center font-bold">
                  每週上午10-11點 線上開課
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  肝好、胃好 身體好 系列課程
                </h3>
              </div>
            </div>

            {/* Course Card 3: 722 血壓量測衛教講座 */}
            <div
              onClick={() => handleCardClick()}
              className="snap-start shrink-0 w-[260px] bg-white rounded-2xl border border-orange-200 overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-shadow group"
            >
              <div className="relative aspect-16/10 bg-orange-100 overflow-hidden">
                <img
                  src={bpActivityCardImage}
                  alt="722血壓量測"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                  衛教專題
                </span>
                <span className="absolute top-2 right-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                  線上學習
                </span>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-black text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                  722 血壓正確量測衛教講座
                </h3>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Shared Bottom Navigation Bar */}
      <BottomNavBar activeTab="course" onNavigate={onNavigate} />
    </div>
  );
};
