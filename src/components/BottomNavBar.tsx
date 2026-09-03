import React from 'react';
import { BookOpen, Activity, Stethoscope, MessageSquare, Users } from 'lucide-react';
import { ScreenId } from '../types';

interface Props {
  activeTab: 'course' | 'data' | 'expert' | 'message' | 'community';
  onNavigate: (screen: ScreenId) => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<Props> = ({ activeTab, onNavigate, unreadCount = 1 }) => {
  return (
    <div className="bg-white border-t border-slate-200 sticky bottom-0 z-20 px-1 py-1 flex items-center justify-around shadow-xs shrink-0 w-full select-none">
      {/* 1. 課程 */}
      <button
        onClick={() => onNavigate('SCR-03')}
        className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 px-2 rounded-xl transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          activeTab === 'course'
            ? 'text-orange-600 bg-orange-50 font-black'
            : 'text-slate-600 hover:text-slate-900 font-bold'
        }`}
      >
        <BookOpen className="w-[1.25rem] h-[1.25rem]" />
        <span className="text-[0.6875rem] leading-none">課程</span>
      </button>

      {/* 2. 健康數據 */}
      <button
        onClick={() => onNavigate('HEALTH-DATA')}
        className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 px-2 rounded-xl transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          activeTab === 'data'
            ? 'text-orange-600 bg-orange-50 font-black'
            : 'text-slate-600 hover:text-slate-900 font-bold'
        }`}
      >
        <Activity className="w-[1.25rem] h-[1.25rem]" />
        <span className="text-[0.6875rem] leading-none">健康數據</span>
      </button>

      {/* 3. 找專家 */}
      <button
        onClick={() => onNavigate('SCR-04')}
        className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 px-2 rounded-xl transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          activeTab === 'expert'
            ? 'text-orange-600 bg-orange-50 font-black'
            : 'text-slate-600 hover:text-slate-900 font-bold'
        }`}
      >
        <Stethoscope className="w-[1.25rem] h-[1.25rem]" />
        <span className="text-[0.6875rem] leading-none">找專家</span>
      </button>

      {/* 4. 訊息 */}
      <button
        onClick={() => onNavigate('MESSAGES')}
        className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 px-2 rounded-xl transition-all relative cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          activeTab === 'message'
            ? 'text-orange-600 bg-orange-50 font-black'
            : 'text-slate-600 hover:text-slate-900 font-bold'
        }`}
      >
        <div className="relative">
          <MessageSquare className="w-[1.25rem] h-[1.25rem]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[0.625rem] font-black px-1 min-w-[16px] h-[16px] rounded-full flex items-center justify-center border border-white">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[0.6875rem] leading-none">訊息</span>
      </button>

      {/* 5. 討論區 */}
      <button
        disabled
        className="min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 px-2 rounded-xl text-slate-300 opacity-60 cursor-not-allowed"
        title="暫未開放"
      >
        <Users className="w-[1.25rem] h-[1.25rem]" />
        <span className="text-[0.6875rem] leading-none">討論區</span>
      </button>
    </div>
  );
};
