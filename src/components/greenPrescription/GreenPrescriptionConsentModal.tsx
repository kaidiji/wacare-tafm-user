import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle2, ChevronDown, ShieldCheck } from 'lucide-react';
import { FamilyMedicineLogo, WaCareLogo } from './PartnerLogos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConsentComplete: () => void;
}

export const GreenPrescriptionConsentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConsentComplete,
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setIsAgreed(false);
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Check if scrolled near the bottom (within 15px)
    if (scrollHeight - scrollTop - clientHeight <= 15) {
      setHasScrolledToBottom(true);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleComplete = () => {
    if (isAgreed && hasScrolledToBottom) {
      onConsentComplete();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        
        {/* Header with Logos */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white p-3.5 px-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/15 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 block">
                  綠色家庭醫學推動計畫
                </span>
                <h3 className="text-sm font-black text-white leading-tight">
                  個人資料利用暨授權同意書
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Partner identification bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FamilyMedicineLogo className="w-6 h-6 shrink-0" />
            <span className="text-[11px] font-bold text-slate-700">台灣家庭醫學醫學會</span>
          </div>
          <span className="text-slate-300 font-black text-xs">✕</span>
          <div className="flex items-center gap-1.5">
            <WaCareLogo className="h-4.5 w-auto shrink-0" />
          </div>
        </div>

        {/* Scrollable Terms Text Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-700 leading-relaxed font-normal flex-1 border-b border-slate-100 divide-y divide-slate-100"
        >
          <div className="text-center font-black text-sm text-slate-900 pb-1">
            個人資料利用暨授權同意書
          </div>

          <p className="pt-2">
            感謝您使用「WaCare」。吉樂健康資訊科技股份有限公司（以下簡稱「吉樂健康」）參與台灣家庭醫學醫學會（以下簡稱「家醫學會」）所執行之「健康台灣深耕計畫—綠色家庭醫學推動計畫—結合智慧科技健康促進處方訓練，由家庭醫師實踐 ESG 導向永續健康創新照護模式」（以下簡稱「本計畫」）。「WaCare」之隱私權政策，同樣適用於本計畫，並無變更；惟若您選擇參與本計畫，尚需另行同意以下關於資料去識別化後提供予家醫學會之利用方式。
          </p>

          <p className="pt-2">
            您同意吉樂健康就與健康管理相關之資料進行去識別化處理，該等資料包含但不限於健康量測數據（如體重、血壓、血糖、身高、運動紀錄等）、生活型態資料（如飲水、飲食、步數等）與健康促進相關之行為或生活型態資料，以及綠色處方資料等。
          </p>

          <p className="pt-2">
            前述資料經吉樂健康完成去識別化後，將提供給家醫學會用於提供健康促進相關服務（包含但不限於生活型態建議與健康管理）、進行資料分析與統計、作為本計畫執行與成效評估之依據，並供研究及政策規劃參考使用。
          </p>

          <p className="pt-2">
            您並同意吉樂健康將前述經去識別化之資料提供予家醫學會使用。家醫學會僅接收並利用無法識別特定個人身分之去識別化資料，作為統計分析、研究及計畫成效評估之用；該等資料不致識別特定個人身分，且無法回復識別。前述資料之利用期間為本計畫執行期間（含展延期間）。
          </p>

          <p className="pt-2">
            當您勾選「我已閱讀並同意」並簽署時，表示您已詳細閱讀本同意書，瞭解並同意吉樂健康依據本同意書之內容，對您的個人資料進行去識別化處理及相關利用，並提供予家醫學會使用。您得自由選擇是否提供個人資料，惟若拒絕提供或同意，您將無法參與本計畫所提供之智慧科技健康促進處方及相關健康管理服務。
          </p>
        </div>

        {/* Scroll Helper Notice (if not yet reached bottom) */}
        {!hasScrolledToBottom && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 flex items-center justify-between text-amber-800 text-[11px] font-bold shrink-0">
            <span className="flex items-center gap-1">
              <span>⚠️ 請滑動至最下方以閱讀完整條款</span>
            </span>
            <button
              onClick={scrollToBottom}
              className="text-[10px] bg-amber-200/80 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded flex items-center gap-0.5 cursor-pointer font-black"
            >
              <span>移至底端</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Bottom Agree Action Section */}
        <div className="p-3.5 bg-slate-50 shrink-0 space-y-3">
          {/* Checkbox Section */}
          <label
            className={`flex items-center gap-2.5 p-2 rounded-xl border transition-colors ${
              !hasScrolledToBottom
                ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-100'
                : 'cursor-pointer border-teal-200 bg-teal-50/50 hover:bg-teal-50'
            }`}
          >
            <input
              type="checkbox"
              disabled={!hasScrolledToBottom}
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer disabled:cursor-not-allowed"
            />
            <span
              className={`text-xs font-bold ${
                isAgreed ? 'text-teal-900' : 'text-slate-700'
              }`}
            >
              我已閱讀並接受上述同意書內容
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200/60 rounded-xl font-bold transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!isAgreed || !hasScrolledToBottom}
              onClick={handleComplete}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 ${
                isAgreed && hasScrolledToBottom
                  ? 'bg-teal-700 hover:bg-teal-800 text-white active:scale-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>完成</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
