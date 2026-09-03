import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Home,
  Share2,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  ChevronLeft,
  Users,
  MessageSquare
} from 'lucide-react';
import { VideoTask } from './greenPrescriptionData';
import { ScreenId } from '../../types';

interface Props {
  task: VideoTask;
  isFollowed?: boolean;
  onFollow?: () => void;
  onBack: () => void;
  onToggleComplete: (id: string) => void;
  onNavigate?: (screen: ScreenId) => void;
}

export const VideoDetailScreen: React.FC<Props> = ({
  task,
  isFollowed = false,
  onFollow,
  onBack,
  onToggleComplete,
  onNavigate,
}) => {
  const [followedState, setFollowedState] = useState(isFollowed);
  const [isPlaying, setIsPlaying] = useState(isFollowed);
  const [currentTime, setCurrentTime] = useState(125); // 02:05 in seconds
  const [totalSeconds, setTotalSeconds] = useState(() => {
    const parts = task.duration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 3277; // ~54:37
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'reviews'>('content');
  const [showShareToast, setShowShareToast] = useState(false);
  const [showFollowToast, setShowFollowToast] = useState(false);
  const [showLineToast, setShowLineToast] = useState(false);
  const [showCompletedToast, setShowCompletedToast] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showControls, setShowControls] = useState(true);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync prop changes
  useEffect(() => {
    setFollowedState(isFollowed);
  }, [isFollowed]);

  // Handle follow expert action
  const handleFollowExpert = () => {
    setFollowedState(true);
    if (onFollow) {
      onFollow();
    }
    setIsPlaying(true);
    setShowFollowToast(true);
    setTimeout(() => setShowFollowToast(false), 3000);
  };

  // Auto-complete task when video plays
  useEffect(() => {
    if (isPlaying && followedState && !task.completed) {
      onToggleComplete(task.id);
      setShowCompletedToast(true);
      setTimeout(() => setShowCompletedToast(false), 3000);
    }
  }, [isPlaying, followedState, task.completed, task.id, onToggleComplete]);

  // Timer simulation for playback
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && followedState) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, followedState, totalSeconds, playbackSpeed]);

  // Auto-hide controls in fullscreen after 3.5 seconds of inactivity
  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && followedState) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? (currentTime / totalSeconds) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!followedState) return;
    const newPercent = parseFloat(e.target.value);
    setCurrentTime(Math.floor((newPercent / 100) * totalSeconds));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: task.title,
        text: `推薦您觀看專業綠色處方衛教影片：${task.title}`,
        url: window.location.href,
      }).catch(() => {
        setShowShareToast(true);
      });
    } else {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] font-sans antialiased text-slate-900 select-none overflow-hidden relative">
      
      {/* 1. Top Navigation Bar (matching IMG_8948.PNG header) */}
      <header className="px-4 py-2.5 bg-white border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between min-h-[3.25rem] shadow-2xs">
        <div className="flex items-center gap-2.5">
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors cursor-pointer active:scale-95"
            aria-label="返回上一頁"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Logo box */}
          <div className="h-6 px-2.5 bg-slate-200 text-slate-600 rounded flex items-center text-xs font-black tracking-tight border border-slate-300/60">
            WaCare
          </div>

          {/* Home icon */}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('SCR-03') : onBack()}
            className="p-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="回首頁"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

        {/* Right Circular Outline Share button */}
        <button
          type="button"
          onClick={handleShare}
          className="w-8 h-8 rounded-full border border-slate-300 text-slate-700 hover:text-orange-600 hover:border-orange-500 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          aria-label="分享課程"
        >
          <Share2 className="w-4 h-4 text-orange-500" />
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* 2. Video Player Component with Follow Lock State (IMG_8948.PNG) */}
        <div
          ref={playerContainerRef}
          onMouseMove={handleUserActivity}
          onClick={handleUserActivity}
          className={`relative bg-slate-950 transition-all duration-300 ${
            isFullscreen
              ? 'fixed inset-0 z-100 w-screen h-screen flex flex-col justify-between'
              : 'w-full aspect-16/9 overflow-hidden'
          }`}
        >
          {/* Background Video Stage / Thumbnail Mock */}
          <div className={`absolute inset-0 bg-gradient-to-br ${task.thumbnailColor || 'from-sky-800 via-teal-800 to-indigo-900'} flex flex-col justify-between p-4 overflow-hidden`}>
            
            {/* Top organization brand in video banner */}
            <div className="flex items-center justify-between z-10 text-[10px] font-bold text-white/90">
              <div className="flex items-center gap-1.5 opacity-90 drop-shadow">
                <span>全銀運動</span>
                <span className="text-amber-300 font-black">WaCare</span>
                <span>社團法人數位人道協會</span>
              </div>
              <span className="text-[10px] font-bold text-white/80 bg-black/40 px-1.5 py-0.5 rounded">
                1080P
              </span>
            </div>

            {/* Video Headline on Left, Speaker photo on Right */}
            <div className="my-auto z-10 flex items-center justify-between text-white">
              <div className="space-y-1 max-w-[65%]">
                <h2 className="text-base sm:text-xl font-black tracking-tight drop-shadow-md leading-snug">
                  {task.title.replace(/【.*?】/, '')}
                </h2>
                <p className="text-xs text-white/90 font-medium drop-shadow-sm line-clamp-2">
                  主講：{task.instructor}｜{task.instructorTitle}
                </p>
              </div>

              {/* Speaker graphic avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden flex items-center justify-center text-3xl shadow-lg backdrop-blur-xs shrink-0">
                👨‍🏫
              </div>
            </div>

            {/* Mascot Bear / Bunny in bottom right */}
            <div className="absolute right-3 bottom-10 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/80 text-white shadow-md text-xs border border-white/60">
              🐻
            </div>
          </div>

          {/* ======================================================== */}
          {/* 🔒 LOCKED OVERLAY STATE (IMG_8948.PNG: 未追蹤時的鎖定樣式) */}
          {/* ======================================================== */}
          {!followedState ? (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[1.5px] z-30 flex flex-col items-center justify-center text-center p-6 space-y-3.5 animate-in fade-in duration-200 select-none">
              {/* Lock icon */}
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/25 flex items-center justify-center text-white shadow-inner">
                <Lock className="w-6 h-6 stroke-[2]" />
              </div>

              {/* Notice text */}
              <div className="text-white font-black text-sm tracking-wide drop-shadow-md">
                請先追蹤專家以觀看課程
              </div>

              {/* [ 追蹤專家 ] Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowExpert();
                }}
                className="px-6 py-1.5 rounded-lg border border-white/90 text-white hover:bg-white/15 active:scale-95 text-xs font-extrabold transition-all shadow-md cursor-pointer tracking-wider"
              >
                追蹤專家
              </button>

              {/* Bottom locked bar indicators */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white/70 text-[11px] pointer-events-none">
                <div className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-white/70 text-white/70" />
                  <span className="font-bold">{task.duration || '54:37'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          ) : (
            /* NORMAL UNLOCKED PLAYING CONTROLS */
            <>
              {/* Center Play/Pause button */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                {(!isPlaying || showControls) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextPlaying = !isPlaying;
                      setIsPlaying(nextPlaying);
                      if (nextPlaying && !task.completed) {
                        onToggleComplete(task.id);
                      }
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs border-2 border-white/80 flex items-center justify-center text-white cursor-pointer pointer-events-auto hover:scale-105 active:scale-95 transition-all shadow-xl"
                    aria-label={isPlaying ? '暫停' : '播放'}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-white" />
                    ) : (
                      <Play className="w-7 h-7 fill-white translate-x-0.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Player Bottom Control Bar Overlay */}
              <div
                className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 py-2 space-y-1.5 transition-opacity duration-200 ${
                  showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Scrubber Progress Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-white min-w-[36px]">
                    {formatTime(currentTime)}
                  </span>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progressPercent}
                    onChange={handleSeek}
                    className="flex-1 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400"
                  />

                  <span className="text-[11px] font-bold text-white/80 min-w-[36px]">
                    {formatTime(totalSeconds)}
                  </span>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1 hover:text-orange-400 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentTime((t) => Math.max(0, t - 10))}
                      className="p-1 hover:text-orange-400 cursor-pointer"
                      title="倒退 10 秒"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentTime((t) => Math.min(totalSeconds, t + 10))}
                      className="p-1 hover:text-orange-400 cursor-pointer"
                      title="快轉 10 秒"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 hover:text-orange-400 cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const speeds = [1.0, 1.25, 1.5, 2.0];
                        const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                        setPlaybackSpeed(speeds[nextIndex]);
                      }}
                      className="px-1.5 py-0.5 bg-white/20 hover:bg-white/30 rounded text-[10px] font-bold cursor-pointer"
                    >
                      {playbackSpeed}x
                    </button>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-1.5 bg-white/20 hover:bg-orange-500 hover:text-white rounded-md text-white transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
                      aria-label={isFullscreen ? '退出全螢幕' : '全螢幕播放'}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Fullscreen top close bar */}
          {isFullscreen && (
            <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 bg-black/60 backdrop-blur-xs rounded-full hover:bg-black/80 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <span className="text-sm font-black drop-shadow truncate max-w-xs">{task.title}</span>
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 bg-black/60 backdrop-blur-xs rounded-full hover:bg-black/80 cursor-pointer"
              >
                <Minimize2 className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* 3. Course Info Section (matching IMG_8948.PNG) */}
        <div className="p-4 bg-white space-y-2.5">
          
          {/* Title */}
          <h1 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
            {task.title.replace(/【.*?】/, '')}
          </h1>

          {/* Tags row: 適合個人 | 免費 (IMG_8948.PNG) */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#F5F4F0] text-slate-700">
              適合個人
            </span>
            <span className="px-1.5 py-0.2 rounded text-xs font-bold border border-red-500 text-red-500">
              免費
            </span>
          </div>

          {/* Price & Rating Row (IMG_8948.PNG) */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <div className="text-2xl font-black text-[#F97316] tracking-tight leading-none">
                免費
              </div>
              <div className="text-xs font-medium text-slate-500">
                學習人數 <span className="text-[#F97316] font-bold">420</span>
              </div>
            </div>

            {/* Stars rating */}
            <div className="flex items-center gap-1 text-xs text-slate-600 font-bold">
              <span className="text-slate-800 font-bold text-sm">5.0</span>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-slate-500 font-medium">(64)</span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-slate-100 my-2" />

          {/* 4. Expert Profile & 關於專家 Button (IMG_8948.PNG) */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Circular Galaxy Avatar: 全銀運動 WaCare */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white flex flex-col items-center justify-center text-[9px] font-black shadow-xs shrink-0 border border-purple-300/40 leading-tight text-center p-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent" />
                <span className="text-amber-300 font-extrabold text-[10px]">全銀</span>
                <span className="text-white font-extrabold text-[9px]">運動</span>
                <span className="text-[7px] text-amber-400 font-bold">WaCare</span>
              </div>

              <div>
                <span className="text-xs font-black text-[#F97316] block">
                  健康服務
                </span>
                <span className="text-sm font-black text-slate-900 block">
                  全銀運動
                </span>
              </div>
            </div>

            {/* Full-width 關於專家 Pill Button (IMG_8948.PNG) */}
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('SCR-04') : null}
              className="w-full py-2 rounded-full border border-orange-400 text-orange-500 hover:bg-orange-50 active:scale-98 text-xs font-bold transition-colors cursor-pointer text-center"
            >
              關於專家
            </button>
          </div>
        </div>

        {/* 5. Tabs Header: 內容 | 評價 (IMG_8948.PNG) */}
        <div className="mt-1.5 bg-white border-b border-slate-200 flex">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-3 text-sm font-black text-center cursor-pointer transition-colors relative ${
              activeTab === 'content'
                ? 'text-[#F97316]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            內容
            {activeTab === 'content' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 text-sm font-bold text-center cursor-pointer transition-colors relative ${
              activeTab === 'reviews'
                ? 'text-[#F97316]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            評價
            {activeTab === 'reviews' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316]" />
            )}
          </button>
        </div>

        {/* Tab 1: 內容 (Content - matching IMG_8948.PNG) */}
        {activeTab === 'content' && (
          <div className="p-4 space-y-4">
            
            {/* 6. LINE Community Banner (IMG_8948.PNG) */}
            <div className="rounded-2xl overflow-hidden border border-orange-200/80 shadow-xs relative bg-gradient-to-r from-orange-50/90 via-amber-50 to-orange-100/80 p-4 flex items-center justify-between">
              <div className="space-y-2 z-10 max-w-[65%]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base font-black text-indigo-950 tracking-tight">
                    樂齡朋友一起加入
                  </span>
                  <span className="bg-[#06C755] text-white text-[11px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    LINE
                  </span>
                  <span className="text-base font-black text-slate-800">
                    社群
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-bold leading-tight">
                  獲得最新課程資訊 增加樂齡互動 學習健康新知
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLineToast(true);
                      setTimeout(() => setShowLineToast(false), 2500);
                    }}
                    className="px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs shadow-xs hover:brightness-105 active:scale-95 cursor-pointer flex items-center gap-1 border border-orange-600/40"
                  >
                    <span>點擊加入</span>
                    <span>👆</span>
                  </button>
                </div>
              </div>

              {/* Seniors illustration */}
              <div className="text-4xl shrink-0 z-10 drop-shadow-sm pr-1">
                👵👴🌿
              </div>
            </div>

            {/* Educational Highlights */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2">
              <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-600" />
                綠色處方衛教核心重點
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {task.description}
              </p>
            </div>

            {/* Course Chapters Outline */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
              <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                <span>課程章節與影音進度</span>
                <span className="text-[11px] text-slate-500 font-normal">共 3 節課</span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 border border-orange-100">
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-orange-600 fill-orange-600 shrink-0" />
                    <span className="font-extrabold text-slate-900">01. 基礎原理與生活應用</span>
                  </div>
                  <span className="text-[11px] font-bold text-orange-700">
                    {followedState ? '進行中' : '鎖定中'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">02. 專家示範技巧與常見盲點</span>
                  </div>
                  <span className="text-[11px] text-slate-400">12:30</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">03. 日常生活實踐與目標追蹤</span>
                  </div>
                  <span className="text-[11px] text-slate-400">15:40</span>
                </div>
              </div>
            </div>

            {/* Task Completion Status Card */}
            {followedState && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    綠色處方任務完成狀態
                  </span>
                  <span className="text-[11px] text-slate-500">
                    進入觀看並播放即已自動計入學習儀表板成果
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 fill-orange-100" />
                  <span>已完成任務</span>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: 評價 (Reviews) */}
        {activeTab === 'reviews' && (
          <div className="p-4 space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="text-2xl font-black text-slate-900">5.0</div>
                  <div className="flex text-amber-400 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  共 64 則學員真實評價
                </div>
              </div>

              {/* Review items */}
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>林大姐（台中）</span>
                    <span className="text-slate-400 font-normal">2 天前</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    老師講得很清楚，跟著飲食與運動比例實踐後，精神明顯變好，飯後也不會昏昏欲睡了！
                  </p>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>陳大哥（新北）</span>
                    <span className="text-slate-400 font-normal">5 天前</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    綠色處方的影片非常實用，配合每天量血壓與健走，身體狀況掌握得更清楚。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Bottom Fixed Action Bar (IMG_8948.PNG with Big "分享" Button) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-20 shadow-lg">
        <button
          type="button"
          onClick={handleShare}
          className="w-full py-3 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 active:scale-98 text-base font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Share2 className="w-5 h-5 stroke-[2.5]" />
          <span>分享</span>
        </button>
      </div>

      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xs text-white px-4 py-2 rounded-full text-xs font-extrabold z-50 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          已複製課程連結，歡迎分享給親友！🔗
        </div>
      )}

      {/* Follow Toast Notification */}
      {showFollowToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-black z-50 shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          已成功追蹤專家！現在可以開始觀看課程囉 🎉
        </div>
      )}

      {/* LINE Community Toast */}
      {showLineToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#06C755] text-white px-4 py-2 rounded-full text-xs font-black z-50 shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          已為您複製 LINE 社群加入邀請連結！💬
        </div>
      )}

      {/* Completed Toast Notification */}
      {showCompletedToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-black z-50 shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          綠色處方任務已順利完成！🌿
        </div>
      )}

    </div>
  );
};

