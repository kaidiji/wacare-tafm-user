import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  Check,
  Video,
  Search,
  Filter,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { VideoTask, ALL_CORE_VIDEO_TASKS } from './greenPrescriptionData';
import { ScreenId } from '../../types';
import { VideoDetailScreen } from './VideoDetailScreen';

interface Props {
  onBack: () => void;
  tasks: VideoTask[];
  onToggleComplete: (id: string) => void;
  assignedGoals?: string[];
  onNavigate?: (screen: ScreenId) => void;
}

export const AssignedVideosScreen: React.FC<Props> = ({
  onBack,
  tasks,
  onToggleComplete,
  assignedGoals = [],
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [askQuestionText, setAskQuestionText] = useState('');
  const [askSuccessToast, setAskSuccessToast] = useState(false);

  // If tasks passed in is empty, fallback to full list of core courses
  const effectiveTasks = tasks && tasks.length > 0 ? tasks : ALL_CORE_VIDEO_TASKS;

  const activeVideo = effectiveTasks.find((t) => t.id === activeVideoId) || null;

  const completedCount = effectiveTasks.filter((t) => t.completed).length;

  const filteredTasks = effectiveTasks.filter((task) => {
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
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

  // Detailed player screen
  if (activeVideo) {
    return (
      <VideoDetailScreen
        task={activeVideo}
        onBack={() => setActiveVideoId(null)}
        onToggleComplete={onToggleComplete}
        onNavigate={onNavigate}
      />
    );
  }

  // List of distinct categories for filtering
  const categories = Array.from(new Set(effectiveTasks.map((t) => t.category)));

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-sans antialiased text-slate-900 select-none relative">
      {/* Top Header matching reference screenshot */}
      <header className="px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs flex items-center justify-between min-h-[3.25rem]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors cursor-pointer active:scale-95"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            核心課程影片
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200 shadow-2xs">
            綠色處方
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 pb-24">
        
        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            全部課程 ({effectiveTasks.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Assigned Lifestyle Goal Notice (if expert customized) */}
        {assignedGoals.length > 0 && (
          <div className="bg-orange-50/80 rounded-2xl p-2.5 border border-orange-200 flex items-center justify-between text-xs">
            <span className="text-orange-950 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              專家已為您優先推薦：{assignedGoals.join('、')}
            </span>
            <span className="text-[10px] bg-orange-200 text-orange-900 font-extrabold px-1.5 py-0.5 rounded">
              專家推薦
            </span>
          </div>
        )}

        {/* Video List - Exact layout matching uploaded screenshot */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleOpenVideo(task)}
              className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex items-stretch gap-3"
            >
              {/* Left Thumbnail Poster */}
              <div
                className={`relative w-36 sm:w-40 aspect-[16/10] shrink-0 rounded-xl overflow-hidden bg-gradient-to-br ${
                  task.thumbnailColor || 'from-amber-100 via-orange-100 to-yellow-200 text-amber-950'
                } border border-slate-200/60 shadow-2xs flex flex-col justify-between p-1.5`}
              >
                {/* Top-Left Government / HPA Badge */}
                <div className="flex items-center gap-1 z-10">
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-2xs px-1.5 py-0.5 rounded shadow-2xs border border-white/80 max-w-[95%]">
                    {/* Small circular logo */}
                    <div className="w-2.5 h-2.5 rounded-full bg-linear-to-tr from-sky-600 via-blue-500 to-rose-500 shrink-0 flex items-center justify-center text-[5px] text-white font-bold">
                      +
                    </div>
                    <span className="text-[8px] font-black text-slate-800 tracking-tighter truncate leading-none">
                      衛生福利部國民健康署
                    </span>
                  </div>
                </div>

                {/* Center visual: Instructor & Course Title art */}
                <div className="my-auto flex items-center justify-between px-1 z-10">
                  <div className="max-w-[70%]">
                    <span className="text-[9px] font-black text-slate-900 block leading-tight line-clamp-2 drop-shadow-2xs">
                      {task.posterHeadline || task.title}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/95 border border-white shadow-xs flex items-center justify-center text-base shrink-0">
                    {task.avatarEmoji || '👩‍⚕️'}
                  </div>
                </div>

                {/* Bottom Bar: Duration overlay (e.g. ▶ 29:58) */}
                <div className="flex items-center justify-between z-10">
                  <span className="text-[7.5px] font-black text-slate-800 bg-white/80 px-1 py-0.2 rounded truncate max-w-[55%]">
                    {task.doctorBadge || task.instructor}
                  </span>

                  <div className="bg-black/80 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-2xs leading-none">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>{task.duration}</span>
                  </div>
                </div>
              </div>

              {/* Right Content Details */}
              <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                {/* Title */}
                <div>
                  <h2 className="text-xs sm:text-[13px] font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {task.title}
                  </h2>

                  {/* Channel / Category Subtitle */}
                  <p className="text-[11px] font-bold text-orange-600 mt-1 flex items-center gap-1">
                    <span>{task.channelName || '健康服務 全銀運動'}</span>
                    {task.completed && (
                      <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded ml-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> 已觀看
                      </span>
                    )}
                  </p>
                </div>

                {/* Tags Row: [免費] [455 人學習] */}
                <div className="flex items-center gap-1.5 pt-1.5">
                  <span className="border border-red-500 text-red-600 font-extrabold text-[10px] px-1.5 py-0.5 rounded leading-none bg-red-50/50">
                    免費
                  </span>
                  <span className="border border-red-500 text-red-600 font-extrabold text-[10px] px-1.5 py-0.5 rounded leading-none bg-red-50/50">
                    {task.learnersCount || 350} 人學習
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200/80">
              <Video className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">此分類目前無相關影片</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating "發問" Button (matching reference screen design) */}
      <div className="sticky bottom-0 z-10 p-4 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent flex justify-center pointer-events-none">
        <button
          type="button"
          onClick={() => setShowAskModal(true)}
          className="pointer-events-auto px-8 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-sm rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-2 cursor-pointer transition-all border border-orange-400/50"
        >
          <HelpCircle className="w-4 h-4" />
          <span>發問</span>
        </button>
      </div>

      {/* Ask Question Popup Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">向健康專家發問</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAskModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              您對綠色處方核心課程影片有任何問題或健康疑惑嗎？歡迎留言，專家團隊將為您解答。
            </p>

            <textarea
              rows={3}
              value={askQuestionText}
              onChange={(e) => setAskQuestionText(e.target.value)}
              placeholder="請輸入您的問題（例如：這部影片適合飯前還是飯後練習？每天需做幾次？）"
              className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:outline-none transition-all resize-none"
            />

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAskModal(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSendQuestion}
                disabled={!askQuestionText.trim()}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer transition-all"
              >
                送出發問
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask Success Toast */}
      {askSuccessToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xs text-white px-4 py-2 rounded-full text-xs font-black z-50 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>發問已送出，專家團隊將於訊息頻道為您回覆！</span>
        </div>
      )}
    </div>
  );
};
