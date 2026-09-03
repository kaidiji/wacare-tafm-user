import React from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';

interface Props {
  onLoginRegister: () => void;
  onSkipToHome: () => void;
}

export const Scr00Landing: React.FC<Props> = ({ onLoginRegister, onSkipToHome }) => {
  return (
    <div className="min-h-full bg-slate-900/60 backdrop-blur-xs flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Home Preview */}
      <div className="flex-1 overflow-y-auto bg-slate-100 opacity-40 pointer-events-none p-4 space-y-4">
        {/* Banner carousel placeholder */}
        <div className="h-36 bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl flex items-center justify-between p-4 text-white">
          <div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">WaCare 照護網</span>
            <h3 className="text-lg font-black mt-1">關注你的血壓專家</h3>
            <p className="text-xs text-orange-100">日日抽百元禮券，再抽萬元健康手環</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            🩺
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-xl shadow-2xs h-24"></div>
          <div className="bg-white p-3 rounded-xl shadow-2xs h-24"></div>
        </div>
      </div>

      {/* Foreground Modal Dialog Overlay */}
      <div className="absolute inset-0 z-30 flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-slate-100 text-center relative animate-in zoom-in-95 duration-200">
          {/* Close / Skip button */}
          <button
            onClick={onSkipToHome}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pt-2 pb-1">
            <h2 className="text-2xl font-black text-orange-500 tracking-tight leading-tight mb-2">
              1,600 位專家<br />
              開設1,000+ 堂<br />
              <span className="text-amber-500">免費健康課！</span>
            </h2>

            <p className="text-sm font-bold text-slate-600 mt-3 mb-6">
              Wa 串連你的照護網路
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onLoginRegister}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>登入 / 註冊</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={onSkipToHome}
              className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              略過 先逛逛
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
