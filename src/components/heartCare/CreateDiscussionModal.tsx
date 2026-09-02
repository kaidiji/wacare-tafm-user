import React, { useState, useRef } from 'react';
import { X, ChevronDown, Image as ImageIcon, Keyboard, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface CreateDiscussionModalProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    board: string;
    isAnonymous: boolean;
    image?: string | null;
  }) => void;
  defaultBoard?: string;
}

const BOARDS = [
  '#症狀日常討論',
  '#心衰用藥與飲食控水',
  '#722血壓與心率追蹤',
  '#運動復健與心肺訓練',
  '#心照護專家諮詢',
  '#健康生活分享',
];

export const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({
  onClose,
  onSubmit,
  defaultBoard = '#症狀日常討論',
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [board, setBoard] = useState(defaultBoard);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    if (!content.trim()) return;
    setStep(2);
  };

  const handlePublish = () => {
    const finalTitle = title.trim() || (content.length > 20 ? `${content.substring(0, 20)}...` : content);
    onSubmit({
      title: finalTitle,
      content,
      board,
      isAnonymous,
      image,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
              } else {
                onClose();
              }
            }}
            className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-full transition-colors cursor-pointer"
            aria-label="關閉/返回"
          >
            {step === 2 ? <ArrowLeft className="w-5 h-5 text-slate-700" /> : <X className="w-5 h-5 text-slate-700" />}
          </button>

          <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
            {step === 1 ? '新增' : '發佈討論確認'}
          </h2>

          {step === 1 ? (
            <button
              onClick={handleNextStep}
              disabled={!content.trim()}
              className={`font-bold text-sm sm:text-base px-2 py-1 transition-colors cursor-pointer ${
                content.trim() ? 'text-[#ee7326] hover:text-[#d8621b]' : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handlePublish}
              className="font-black text-sm sm:text-base px-3 py-1 bg-[#ee7326] text-white rounded-xl hover:bg-[#d8621b] transition-colors cursor-pointer"
            >
              發佈
            </button>
          )}
        </div>

        {/* Step Indicator Banner Strip */}
        <div className="bg-slate-50 py-2 px-4 flex items-center gap-2 border-b border-slate-100 shrink-0">
          <div
            className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
              step === 1
                ? 'bg-[#ee7326] text-white shadow-xs'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {step === 1 ? '1' : <Check className="w-3.5 h-3.5" />}
          </div>
          <div
            className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${
              step === 2
                ? 'bg-[#ee7326] text-white border-[#ee7326] shadow-xs'
                : 'bg-white text-slate-400 border-slate-300'
            }`}
          >
            2
          </div>
          <span className="text-xs text-slate-500 font-bold ml-1">
            {step === 1 ? '選擇專頁與填寫內容' : '輸入標題並確認預覽'}
          </span>
        </div>

        {/* Modal Body Content */}
        {step === 1 ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* 1. 發佈專頁 * */}
            <div className="p-4 space-y-2">
              <label className="text-slate-900 font-black text-sm sm:text-base flex items-center">
                發佈專頁
                <span className="text-red-500 font-bold ml-1">*</span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBoardDropdown(!showBoardDropdown)}
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-left transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ee7326]/20 cursor-pointer"
                >
                  <span className={board ? 'font-bold text-slate-900 text-sm' : 'text-slate-400 font-medium text-sm'}>
                    {board || '請選擇...'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showBoardDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options Menu */}
                {showBoardDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in-50 duration-100">
                    {BOARDS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setBoard(b);
                          setShowBoardDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-bold flex items-center justify-between hover:bg-orange-50 cursor-pointer ${
                          board === b ? 'text-[#ee7326] bg-orange-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>{b}</span>
                        {board === b && <Check className="w-4 h-4 text-[#ee7326]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Gray Section Divider */}
            <div className="h-2.5 bg-slate-100/70 border-y border-slate-100 shrink-0" />

            {/* 2. 輸入內容 * */}
            <div className="p-4 space-y-2 flex-1 flex flex-col">
              <label className="text-slate-900 font-black text-sm sm:text-base flex items-center">
                輸入內容
                <span className="text-red-500 font-bold ml-1">*</span>
              </label>

              <div className="relative flex-1 flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="輸入文章內容..."
                  className="w-full flex-1 min-h-[200px] sm:min-h-[240px] p-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#ee7326] focus:ring-2 focus:ring-[#ee7326]/10 resize-none leading-relaxed"
                />

                {/* Selected Image Thumbnail preview if any */}
                {image && (
                  <div className="mt-2 relative inline-block">
                    <img src={image} alt="Upload preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-xs" />
                    <button
                      onClick={() => setImage(null)}
                      className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: Title input & preview */
          <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
            <div>
              <label className="text-slate-900 font-black text-sm sm:text-base block mb-1">
                發佈標題 <span className="text-slate-400 font-normal text-xs">（選填）</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="請輸入標題，例如：平躺喘與睡眠姿勢請教..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#ee7326] font-bold"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-400 block">貼文預覽</span>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-orange-100 text-[#ee7326] font-extrabold text-xs rounded-full">
                  {board}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {isAnonymous ? '🔒 匿名病友' : '👤 心衰病友 (我)'}
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-sm">
                {title || (content.length > 25 ? `${content.substring(0, 25)}...` : content)}
              </h4>

              <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-4 leading-relaxed">
                {content}
              </p>

              {image && (
                <img src={image} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
              )}
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2 text-xs text-orange-800">
              <Sparkles className="w-4 h-4 text-[#ee7326] shrink-0 mt-0.5" />
              <span>發佈後，WaCare 個管照護團隊與社區病友將能收到通知並為您解答或交流分享。</span>
            </div>
          </div>
        )}

        {/* Bottom Toolbar Footer */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Image upload button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 text-slate-500 hover:text-[#ee7326] transition-colors cursor-pointer flex items-center gap-1"
              title="上傳圖片"
            >
              <ImageIcon className="w-6 h-6" />
            </button>

            {/* Checkbox: 匿名 */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#ee7326] focus:ring-[#ee7326] accent-[#ee7326]"
              />
              <span className="text-sm font-bold text-slate-700">匿名</span>
            </label>
          </div>

          {/* Right keyboard icon */}
          <button
            type="button"
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
            }}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="關閉鍵盤"
          >
            <Keyboard className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
