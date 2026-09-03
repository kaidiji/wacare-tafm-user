import React from 'react';
import { User, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  nickname: string;
  setNickname: (val: string) => void;
  onNavigateNext: () => void;
  onNavigateBack?: () => void;
}

export const Scr02Nickname: React.FC<Props> = ({
  nickname,
  setNickname,
  onNavigateNext,
  onNavigateBack,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) setNickname('健友');
    onNavigateNext();
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col justify-between p-6 relative select-none">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pt-2">
        {onNavigateBack ? (
          <button
            type="button"
            onClick={onNavigateBack}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}
        <span className="text-[10px] bg-slate-200 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">
          SCR-02
        </span>
      </div>

      <div className="w-full max-w-sm mx-auto my-auto">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-center text-slate-900 mb-1">請問該如何稱呼您？</h2>
          <p className="text-xs text-center text-slate-500 mb-6">設定專屬暱稱，讓衛教專家更好的稱呼您</p>

          <div className="mb-6 relative">
            <input
              type="text"
              value={nickname}
              maxLength={20}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="請輸入暱稱（例如：健友）"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <span className="absolute right-3 top-3.5 text-[10px] text-slate-400 font-mono">
              {nickname.length}/20
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>進入 App</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-400 py-2">
        您可以隨時在設定頁面修改暱稱
      </div>
    </div>
  );
};
