import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Share2,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  MoreVertical,
  Play,
  CheckCircle2,
  Search,
  BookOpen,
  Calendar,
  Users,
  Video,
  Sparkles,
  ChevronRight,
  X,
  Heart,
  Check
} from 'lucide-react';
import { VideoTask, ALL_CORE_VIDEO_TASKS } from './greenPrescriptionData';
import { ScreenId } from '../../types';
import { VideoDetailScreen } from './VideoDetailScreen';
import { DataAuthorizationScreen } from '../DataAuthorizationScreen';

interface Props {
  onBack: () => void;
  tasks: VideoTask[];
  onToggleComplete: (id: string) => void;
  assignedGoals?: string[];
  onNavigate?: (screen: ScreenId) => void;
}

export const GreenPrescriptionCoursesScreen: React.FC<Props> = ({
  onBack,
  tasks,
  onToggleComplete,
  assignedGoals = [],
  onNavigate,
}) => {
  // Tabs: LIVE 課程 / 影片課程 / 關於我 / 討論區 (Matching IMG_8642)
  const [activeTab, setActiveTab] = useState<'live' | 'videos' | 'about' | 'discussion'>('videos');
  
  // Category Pill filter (Matching IMG_8642: 全部、全銀數位社會處方、量六力、身體活動、自我健康管理...)
  const [selectedCategoryPill, setSelectedCategoryPill] = useState<string>('全部');
  
  // Follow state & Authorization
  const [isFollowed, setIsFollowed] = useState(true);
  const [isDataAuthorized, setIsDataAuthorized] = useState(false);
  const [showDataAuthScreen, setShowDataAuthScreen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Active Video Player Detail
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Ask Question Modal
  const [showAskModal, setShowAskModal] = useState(false);
  const [askQuestionText, setAskQuestionText] = useState('');
  const [askSuccessToast, setAskSuccessToast] = useState(false);

  // Share & Follow Toasts
  const [shareToast, setShareToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category Pills Horizontal Scroll Container Ref
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = categoryScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const effectiveTasks = tasks && tasks.length > 0 ? tasks : ALL_CORE_VIDEO_TASKS;
  const activeVideo = effectiveTasks.find((t) => t.id === activeVideoId) || null;

  // Filter Categories matching IMG_8642
  const SUB_CATEGORIES = [
    { id: '全部', label: '全部' },
    { id: '全銀數位社會處方', label: '全銀數位社會處方' },
    { id: '量六力', label: '量六力' },
    { id: '身體活動', label: '身體活動' },
    { id: '自我健康管理', label: '自我健康管理' },
    { id: '運動習慣', label: '運動習慣' },
    { id: '飲食習慣', label: '飲食習慣' },
    { id: '睡眠與減壓', label: '睡眠與減壓' },
  ];

  const filteredTasks = effectiveTasks.filter((task) => {
    if (selectedCategoryPill === '全部' || selectedCategoryPill === 'all') return true;
    if (selectedCategoryPill === '全銀數位社會處方') return true;
    if (selectedCategoryPill === '身體活動' || selectedCategoryPill === '運動習慣') {
      return task.category === '運動習慣' || task.title.includes('運動') || task.title.includes('肌力') || task.title.includes('步');
    }
    if (selectedCategoryPill === '飲食習慣') {
      return task.category === '飲食習慣' || task.title.includes('飲食') || task.title.includes('營養');
    }
    if (selectedCategoryPill === '睡眠與減壓') {
      return task.category === '睡眠品質' || task.category === '壓力管理';
    }
    return true;
  });

  const handleOpenVideo = (task: VideoTask) => {
    setActiveVideoId(task.id);
    if (!task.completed) {
      onToggleComplete(task.id);
    }
  };

  const handleSendQuestion = () => {
    if (!askQuestionText.trim()) return;
    setShowAskModal(false);
    setAskQuestionText('');
    setAskSuccessToast(true);
    setTimeout(() => setAskSuccessToast(false), 3000);
  };

  const handleShare = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  // Data authorization sub-screen
  if (showDataAuthScreen) {
    return (
      <DataAuthorizationScreen
        expertId="greenPrescription"
        onNavigate={(screen) => {
          if (screen === 'GREEN-PRESCRIPTION-TASKS') {
            setShowDataAuthScreen(false);
          } else if (onNavigate) {
            onNavigate(screen);
          }
        }}
        onAuthorizeSuccess={() => {
          setIsDataAuthorized(true);
          setShowDataAuthScreen(false);
          setToastMessage('已成功授權健康數據給「全銀運動」！');
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />
    );
  }

  // Video detail player
  if (activeVideo) {
    return (
      <VideoDetailScreen
        task={activeVideo}
        isFollowed={isFollowed}
        onFollow={() => setIsFollowed(true)}
        onBack={() => setActiveVideoId(null)}
        onToggleComplete={onToggleComplete}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-sans antialiased text-slate-900 select-none relative overflow-hidden">
      
      {/* 1. Header Bar matching IMG_8642 */}
      <header className="px-4 py-2.5 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between min-h-[3.25rem] z-20">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors cursor-pointer active:scale-95 border border-slate-200 shadow-2xs"
          aria-label="返回"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Center Title with Small Circular Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#392e66] text-white flex items-center justify-center font-black text-[9px] shadow-xs border border-purple-300/40 shrink-0">
            全銀
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-slate-900 tracking-tight">
              全銀運動
            </span>
            <span className="text-xs font-medium text-slate-500">
              健康服務
            </span>
          </div>
        </div>

        {/* Right Share Button (Circular border matching IMG_8642) */}
        <button
          type="button"
          onClick={handleShare}
          className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer active:scale-95 border border-slate-200 shadow-2xs"
          aria-label="分享"
        >
          <Share2 className="w-4.5 h-4.5" />
        </button>
      </header>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto pb-20">
        
        {/* 2. Hero Channel Profile Banner (Exact visual replica of IMG_8642) */}
        <div className="relative bg-gradient-to-b from-[#e89045] via-[#f7d6bc] to-white pt-5 pb-4 px-4 text-center">
          
          {/* Central Large Circular Avatar */}
          <div className="flex justify-center mb-3">
            <div className="w-32 h-32 rounded-full bg-[#392e66] text-white flex flex-col items-center justify-center shadow-lg border-4 border-white ring-2 ring-orange-200/60 relative overflow-hidden">
              {/* Starry background effect */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#5a4a9c_0%,#281e52_100%)]" />
              
              {/* Hand-drawn stick figure running */}
              <div className="relative z-10 flex flex-col items-center text-center px-1">
                <span className="text-xl font-black tracking-tight text-white drop-shadow-xs">
                  全銀
                </span>
                <span className="text-xl font-black tracking-tight text-white -mt-1 drop-shadow-xs">
                  運動
                </span>
                
                {/* WaCare smiling logo */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="text-[#f37021] text-xs font-black">🧡 WaCare</span>
                </div>
              </div>
            </div>
          </div>

          {/* Title & Stats */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                全銀運動
              </h2>
              <span className="text-sm font-semibold text-slate-600">
                健康服務
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              <span>26,235 位追蹤者</span>
              <span className="mx-1.5 text-slate-400">•</span>
              <span className="text-[#f37021] font-bold">27,900 篇發問數</span>
            </p>
          </div>

          {/* Action Pills: 訊息 / 發問 / 數據授權 / ··· (Exact style from IMG_8642) */}
          <div className="flex items-center justify-center gap-2 mt-4 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('MESSAGES')}
              className="flex-1 py-1.5 px-3 rounded-full border border-orange-400 text-orange-600 bg-white hover:bg-orange-50 active:scale-95 font-bold text-xs transition-all shadow-2xs cursor-pointer"
            >
              訊息
            </button>

            <button
              type="button"
              onClick={() => setShowAskModal(true)}
              className="flex-1 py-1.5 px-3 rounded-full border border-orange-400 text-orange-600 bg-white hover:bg-orange-50 active:scale-95 font-bold text-xs transition-all shadow-2xs cursor-pointer"
            >
              發問
            </button>

            <button
              type="button"
              onClick={() => setShowDataAuthScreen(true)}
              className="flex-1 py-1.5 px-3 rounded-full border border-orange-400 text-orange-600 bg-white hover:bg-orange-50 active:scale-95 font-bold text-xs transition-all shadow-2xs cursor-pointer"
            >
              {isDataAuthorized ? '已授權' : '數據授權'}
            </button>

            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-8 h-8 rounded-full border border-orange-400 text-orange-600 bg-white hover:bg-orange-50 active:scale-95 flex items-center justify-center font-bold text-xs transition-all shadow-2xs cursor-pointer shrink-0"
              aria-label="更多操作"
            >
              ···
            </button>
          </div>

          {/* More dropdown */}
          {showMoreMenu && (
            <div className="absolute right-6 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 text-left min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setIsFollowed(!isFollowed);
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                {isFollowed ? '已追蹤全銀運動' : '追蹤全銀運動'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  handleShare();
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                分享全銀運動
              </button>
            </div>
          )}
        </div>

        {/* 3. Navigation Tabs Bar (IMG_8642 style: LIVE 課程 / 影片課程 / 關於我 / 討論區) */}
        <div className="bg-white border-b border-slate-200 px-2 flex justify-around text-sm font-extrabold sticky top-0 z-10">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`py-3 px-3 transition-colors relative cursor-pointer ${
              activeTab === 'live'
                ? 'text-orange-600 border-b-2 border-orange-600 font-black'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            LIVE 課程
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`py-3 px-3 transition-colors relative cursor-pointer ${
              activeTab === 'videos'
                ? 'text-orange-600 border-b-2 border-orange-600 font-black'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            影片課程
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3 transition-colors relative cursor-pointer ${
              activeTab === 'about'
                ? 'text-orange-600 border-b-2 border-orange-600 font-black'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            關於我
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discussion')}
            className={`py-3 px-3 transition-colors relative cursor-pointer ${
              activeTab === 'discussion'
                ? 'text-orange-600 border-b-2 border-orange-600 font-black'
                : 'text-slate-700 hover:text-slate-900 font-bold'
            }`}
          >
            討論區
          </button>
        </div>

        {/* 4. Sub-Categories Horizontal Pills Bar (Matching IMG_8642) */}
        {activeTab === 'videos' && (
          <div
            ref={categoryScrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="bg-white py-2.5 px-3 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar select-none cursor-grab active:cursor-grabbing"
          >
            {SUB_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryPill === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryPill(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 5. TAB CONTENT: 影片課程 (VIDEOS) */}
        {activeTab === 'videos' && (
          <div className="p-4 space-y-4">
            
            {/* FEATURED BANNER (Exact reproduction of IMG_8642 bottom banner) */}
            <div className="bg-gradient-to-r from-[#eef2ff] via-[#faf5ff] to-[#fff7ed] rounded-3xl p-4 border border-indigo-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-[11px] font-black text-indigo-900">
                  <span>全銀運動</span>
                  <span>×</span>
                  <span className="text-orange-600">WaCare</span>
                </div>
                <span className="bg-[#3b2d6a] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  7月 健康特輯
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                  肝好、胃好，身體自然好
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  從消化、排便到肝臟保養 · 享受銀髮健康生活的關鍵方法
                </p>
              </div>

              {/* Graphic Row & Action Button */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-2xl">
                  <span>👴👵</span>
                  <span>🫁</span>
                  <span>🥗</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAskModal(true)}
                  className="px-5 py-1.5 bg-[#f37021] hover:bg-[#e05e10] text-white text-xs font-black rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  發問
                </button>
              </div>
            </div>

            {/* Video Course List (全銀數位社會處方核心課程) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-slate-900">
                  {selectedCategoryPill === '全部' ? '全銀數位社會處方 · 精選影音' : `${selectedCategoryPill} 影音指導`}
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  共 {filteredTasks.length} 支影片
                </span>
              </div>

              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleOpenVideo(task)}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer flex gap-3 group"
                >
                  {/* Video Thumbnail */}
                  <div className="w-28 h-20 rounded-xl bg-slate-900 relative overflow-hidden shrink-0 group-hover:scale-[1.02] transition-transform">
                    <img
                      src={task.thumbnailUrl}
                      alt={task.title}
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-md">
                        <Play className="w-4 h-4 fill-orange-600 ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {task.duration}
                    </span>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                          {task.category}
                        </span>
                        {task.completed && (
                          <span className="text-[10px] font-black text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3]" /> 已達成
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1">
                      <span>{task.instructor || '全銀專業教練'}</span>
                      <span className="text-orange-600 font-bold group-hover:underline">觀看影片 &gt;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 6. TAB CONTENT: LIVE 課程 */}
        {activeTab === 'live' && (
          <div className="p-4 space-y-3.5">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-xs text-orange-950 space-y-2">
              <span className="font-black text-orange-900 text-sm flex items-center gap-1.5">
                <Video className="w-4 h-4 text-orange-600" />
                每週全銀運動 LIVE 互動直播課程
              </span>
              <p className="leading-relaxed">
                由專業體適能教練與職能治療師線上帶動，即時指導正確防跌姿勢與核心伸展！
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>每週二、四 上午 10:00</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  開放報名中
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                銀髮強肌健骨 · 下肢肌力與平衡訓練
              </h4>
              <p className="text-xs text-slate-600">
                主講教練：全銀運動資深教練團隊 · 課程時長 45 分鐘
              </p>
              <button
                type="button"
                onClick={() => {
                  setToastMessage('已成功預約全銀運動 LIVE 直播提醒！');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="w-full py-2.5 bg-orange-600 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-orange-700 transition-colors"
              >
                免費預約參加
              </button>
            </div>
          </div>
        )}

        {/* 7. TAB CONTENT: 關於我 */}
        {activeTab === 'about' && (
          <div className="p-4 space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
              <h3 className="text-sm font-black text-slate-900">全銀運動 健康服務簡介</h3>
              <p>
                「全銀運動」為 WaCare 旗下專屬銀髮長者與家庭照顧者的數位社會處方推廣品牌。結合生活型態醫學指引、量六力檢測與非藥物生活介入，協助長者維持活動力、預防失能、建立活躍自信生活。
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-500">
                <span>服務機構：WaCare 遠距健康</span>
                <span>核心認證：台灣家庭醫學醫學會指引</span>
              </div>
            </div>
          </div>
        )}

        {/* 8. TAB CONTENT: 討論區 */}
        {activeTab === 'discussion' && (
          <div className="p-4 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>陳奶奶 · 2小時前</span>
                <span className="text-orange-600 font-extrabold">已獲教練回覆</span>
              </div>
              <p className="text-xs font-bold text-slate-900">
                「做完椅子深蹲與彈力帶運動後，膝蓋感覺很輕鬆，每天跟著影片做很有動力！」
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600">
                👨‍🏫 教練回覆：持之以恆非常棒！記得運動前後喝水，並保持腹部收緊喔！
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAskModal(true)}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black cursor-pointer hover:bg-slate-800"
            >
              我要在討論區發問
            </button>
          </div>
        )}

      </div>

      {/* Modal: 發問彈窗 */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-5 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-5 h-5 text-orange-600" />
                向「全銀運動」專家教練發問
              </h3>
              <button
                onClick={() => setShowAskModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={askQuestionText}
              onChange={(e) => setAskQuestionText(e.target.value)}
              placeholder="請輸入您想向全銀運動教練諮詢的運動或生活型態問題..."
              className="w-full h-28 p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAskModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSendQuestion}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
              >
                送出提問
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Messages */}
      {shareToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          已複製「全銀運動 健康服務」分享連結！
        </div>
      )}

      {askSuccessToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          提問已送出！全銀運動教練團隊將盡快回覆您。
        </div>
      )}

      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

    </div>
  );
};
