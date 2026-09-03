import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, AlertCircle, ArrowLeft, X } from 'lucide-react';

interface Props {
  onNavigateNext: () => void;
  onNavigateBack: () => void;
}

export const Scr01Onboarding: React.FC<Props> = ({ onNavigateNext, onNavigateBack }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [agreed, setAgreed] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMsg('請勾選同意服務條款與隱私權政策');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('09')) {
      setErrorMsg('請輸入正確的 10 位數手機號碼 (例如: 0912345678)');
      return;
    }
    setErrorMsg('');
    setStep('OTP');
    setCountdown(60);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setErrorMsg('請輸入完整的簡訊驗證碼');
      return;
    }
    setErrorMsg('');
    onNavigateNext();
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col justify-between p-6 relative select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={step === 'OTP' ? () => setStep('PHONE') : onNavigateBack}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[10px] bg-slate-200 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">
          SCR-01
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-sm mx-auto my-auto pt-4">
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Phone className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-slate-900 text-center mb-1">
            {step === 'PHONE' ? '手機號碼快速登入' : '輸入簡訊驗證碼'}
          </h2>
          <p className="text-xs text-slate-500 text-center mb-6">
            {step === 'PHONE'
              ? '驗證後即可免費訂閱健康課程與記錄血壓數據'
              : `驗證碼已發送至 ${phone.slice(0, 4)}****${phone.slice(8)}`}
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  手機號碼
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400">
                    +886
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    maxLength={10}
                    className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="agree" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                  我已閱讀並同意{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-orange-600 underline font-semibold hover:text-orange-700 cursor-pointer"
                  >
                    WaCare 服務條款
                  </button>{' '}
                  與{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-orange-600 underline font-semibold hover:text-orange-700 cursor-pointer"
                  >
                    隱私權政策
                  </button>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                獲取驗證碼
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  6 位數驗證碼
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="請輸入 6 位數字"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-mono font-bold text-slate-800 tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>未收到驗證碼？</span>
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => setCountdown(60)}
                  className={`font-semibold ${
                    countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-orange-600 hover:underline cursor-pointer'
                  }`}
                >
                  {countdown > 0 ? `${countdown}s 後重新發送` : '重新發送'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                完成驗證並登入
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Security Note Footer */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 py-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>個人資料經高規格加密，絕不對外洩漏</span>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-3">服務條款與隱私權保護政策</h3>
            <div className="text-xs text-slate-600 space-y-2 max-h-60 overflow-y-auto pr-1">
              <p>歡迎使用 WaCare 照護網健康管理平台。</p>
              <p>1. 本服務蒐集之手機號碼僅用於登入帳號識別與健康數據同步備份。</p>
              <p>2. 您的血壓與生理量測記錄將全程採用 SSL 加密傳輸保護。</p>
              <p>3. 您可隨時於個人設定內刪除帳號與生理歷史記錄。</p>
            </div>

            <button
              onClick={() => {
                setAgreed(true);
                setShowTermsModal(false);
              }}
              className="mt-5 w-full py-2.5 bg-orange-500 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-orange-600"
            >
              已閱讀並同意
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
