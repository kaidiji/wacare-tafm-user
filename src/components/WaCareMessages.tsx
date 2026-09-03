import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Send,
  MoreVertical,
  CheckSquare,
  Square,
  CheckCircle2,
  X,
  FileSpreadsheet,
  HelpCircle,
  Stethoscope,
  Clock,
  Check,
  ExternalLink,
  Flame,
  Leaf
} from 'lucide-react';
import { ScreenId, ChatMessage } from '../types';
import { BottomNavBar } from './BottomNavBar';

interface Props {
  onNavigate: (screen: ScreenId) => void;
  followedExperts?: string[];
  step1Authorized?: boolean;
  authorizedExpert?: 'aimee' | 'bliss' | null;
  assignedGoals?: string[];
  onAssignGoals?: (goals: string[]) => void;
  messagesMap?: Record<string, ChatMessage[]>;
  onUpdateMessagesMap?: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  isQuestionnaireSubmitted?: boolean;
  isTasksDispatched?: boolean;
  isPrescriptionDispatched?: boolean;
  onDispatchPrescription?: () => void;
  submittedGoals?: string[];
  onSubmitQuestionnaire?: (goals: string[]) => void;
  initialChatId?: string | null;
}

interface ChatChannel {
  id: string;
  name: string;
  clinicTag?: string;
  category: 'expert' | 'service' | 'friend';
  avatarBg: string;
  avatarText: string;
  avatarSubtext?: string;
  avatarType: 'clinic_expert' | 'badge_ai' | 'friend_user';
  preview: string;
  time: string;
  timeColor?: string;
  hasUnreadDot?: boolean;
}

export const WaCareMessages: React.FC<Props> = ({
  onNavigate,
  followedExperts = ['wa-bunny', 'family-medicine'],
  assignedGoals: propAssignedGoals = [],
  onAssignGoals,
  messagesMap: propMessagesMap,
  onUpdateMessagesMap,
  isQuestionnaireSubmitted = false,
  isPrescriptionDispatched = false,
  onDispatchPrescription,
  submittedGoals: propSubmittedGoals = [],
  onSubmitQuestionnaire,
  initialChatId = null,
}) => {
  // Start with initialChatId if provided, else null so user visits the Message Center list first
  const [selectedChat, setSelectedChat] = useState<string | null>(initialChatId);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'experts' | 'friends'>('all');
  const [chatInput, setChatInput] = useState('');

  // Sync selectedChat when initialChatId changes
  React.useEffect(() => {
    if (initialChatId) {
      setSelectedChat(initialChatId);
    }
  }, [initialChatId]);

  // 生活面向勾選 Modal 狀態（預設不帶入任何回答）
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    propSubmittedGoals.length > 0 ? propSubmittedGoals : []
  );
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(
    isQuestionnaireSubmitted || propSubmittedGoals.length > 0
  );

  React.useEffect(() => {
    if (propSubmittedGoals.length > 0) {
      setSelectedOptions(propSubmittedGoals);
      setHasCompletedQuestionnaire(true);
    } else if (isQuestionnaireSubmitted) {
      setHasCompletedQuestionnaire(true);
    } else {
      setHasCompletedQuestionnaire(false);
    }
  }, [propSubmittedGoals, isQuestionnaireSubmitted]);

  // 生活型態面向選項
  const QUESTIONNAIRE_OPTIONS = [
    { id: 'opt-1', label: '運動習慣', icon: '🏃‍♂️', desc: '提升肌力與心肺耐力、防跌與下肢訓練' },
    { id: 'opt-2', label: '飲食習慣', icon: '🥗', desc: '低GI健康飲食、體脂與健腦營養管理' },
    { id: 'opt-3', label: '睡眠品質', icon: '🌙', desc: '改善夜尿中斷、建立深度好眠規律' },
    { id: 'opt-4', label: '壓力管理', icon: '🧘', desc: '自律神經調節、懷舊遊戲與放鬆減壓' },
    { id: 'opt-5', label: '戒菸／戒酒／戒檳榔', icon: '🚭', desc: '成癮物質戒斷、健康生活替代策略' },
    { id: 'opt-6', label: '增加人際互動', icon: '👥', desc: '線上環遊世界、提升大腦認知防失智' },
  ];

  // 預設對話歷史記錄（初始只有活動連結卡片，等使用者前往活動頁填寫完成才由專家回覆並提供綠色處方超連結）
  const [internalMessagesMap, setInternalMessagesMap] = useState<Record<string, ChatMessage[]>>({
    'family-medicine': [
      {
        id: 'fm-2',
        sender: 'expert',
        type: 'questionnaire_card',
        time: '09:00',
      },
    ],
    wabunny: [
      {
        id: '1',
        sender: 'expert',
        text: '量血壓是個好習慣，請記得養成定期記錄血壓的規律生活喔！',
        time: '07/23 10:15',
      },
      {
        id: '2',
        sender: 'expert',
        text: '親愛的會員您好！我是 Wa 邦尼 AI 衛教助手，很高興為您服務！如您有任何健康照護、血壓趨勢或衛教問題，歡迎隨時在此發問諮詢。',
        time: '07/23 10:16',
      },
    ],
    friend_1: [
      {
        id: 'f1',
        sender: 'user',
        text: '嗨～今天早上的健康數據記錄了嗎？記得天天關注自己的身體變化喔！',
        time: '07/25',
      },
    ],
  });

  const messagesMap = propMessagesMap ?? internalMessagesMap;
  const setMessagesMap = onUpdateMessagesMap ?? setInternalMessagesMap;

  // 判斷專家是否為已追蹤專家
  const isExpertFollowed = (channelId: string) => {
    if (channelId === 'wabunny' || channelId === 'wa-bunny') return true;
    if (channelId === 'family-medicine' || channelId === 'family_medicine') return true;
    return followedExperts.includes(channelId);
  };

  // 對齊專家資料庫
  const familyMedMsgs = messagesMap['family-medicine'] || [];
  const lastFmMsg = familyMedMsgs[familyMedMsgs.length - 1];
  const familyMedPreview = lastFmMsg
    ? lastFmMsg.type === 'questionnaire_card'
      ? '📋 歡迎加入！請填寫生活型態前測問卷'
      : lastFmMsg.text.replace(/\n/g, ' ')
    : '📋 歡迎加入！請填寫生活型態前測問卷';

  const channelList: ChatChannel[] = [
    {
      id: 'family-medicine',
      name: '示範診所',
      clinicTag: '綠色處方燈',
      category: 'expert',
      avatarBg: 'bg-teal-700',
      avatarText: '示範診所',
      avatarSubtext: 'WaCare',
      avatarType: 'clinic_expert',
      preview: familyMedPreview,
      time: '剛剛',
      timeColor: 'text-slate-400',
      hasUnreadDot: !isPrescriptionDispatched && !isQuestionnaireSubmitted,
    },
    {
      id: 'wabunny',
      name: 'Wa 邦尼 人工智慧',
      category: 'expert',
      avatarBg: 'bg-sky-100',
      avatarText: 'Wa邦尼',
      avatarSubtext: '24hr服務',
      avatarType: 'badge_ai',
      preview: '量血壓是個好習慣，請記得在血壓...',
      time: '07/23',
      timeColor: 'text-slate-400',
      hasUnreadDot: false,
    },
    {
      id: 'friend_1',
      name: '林小華',
      category: 'friend',
      avatarBg: 'bg-teal-100',
      avatarText: '華',
      avatarType: 'friend_user',
      preview: '嗨～今天早上的健康數據記錄了嗎？...',
      time: '07/25',
      timeColor: 'text-slate-400',
      hasUnreadDot: false,
    },
  ];

  const handleToggleOption = (label: string) => {
    setSelectedOptions((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  // 當使用者在問卷中選取想改善的面向並提交時：
  // 專家診所正式收到病人在意什麼，立即回覆該問卷並附上綠色處方超連結
  const handleSubmitQuestionnaire = () => {
    if (selectedOptions.length === 0) return;

    setHasCompletedQuestionnaire(true);
    setShowQuestionnaireModal(false);

    if (onSubmitQuestionnaire) {
      onSubmitQuestionnaire(selectedOptions);
    } else {
      if (onAssignGoals) {
        onAssignGoals(selectedOptions);
      }

      const targetChat = 'family-medicine';
      const goalsString = selectedOptions.join('、');
      const userSummaryText = `您好！我已填寫完成生活型態問卷，目前最想改善的面向為：\n${selectedOptions.map((opt) => `• ${opt}`).join('\n')}`;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: userSummaryText,
        time: '剛剛',
      };

      setMessagesMap((prev) => ({
        ...prev,
        [targetChat]: [...(prev[targetChat] || []), userMsg],
      }));
    }
  };

  // 當使用者在輸入框中打字發問時：
  // 專家診所解析意圖並回覆，同時附上轉跳綠色處方燈的超連結
  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedChat) return;
    const inputText = chatInput;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      time: '剛剛',
    };

    const targetChat = selectedChat;
    setChatInput('');

    // 根據輸入內容判斷關鍵字
    let replyText = '感謝您的詢問！示範診所團隊已收到您的問題。';

    if (inputText.includes('吃') || inputText.includes('飲食') || inputText.includes('體重') || inputText.includes('魚油')) {
      replyText = `親愛的會員您好！了解您對「飲食與營養調配」非常重視。提醒您可以前往綠色處方燈觀看飲食與健腦抗發炎影音指引！`;
    } else if (inputText.includes('睡') || inputText.includes('夜尿') || inputText.includes('頻尿') || inputText.includes('失眠')) {
      replyText = `親愛的會員您好！了解您近期在意「睡眠與夜尿頻繁」的情況。提醒您可以前往綠色處方燈觀看夜間好眠與飲水調節指導影片！`;
    } else if (inputText.includes('動') || inputText.includes('運動') || inputText.includes('肌力') || inputText.includes('膝蓋') || inputText.includes('腳')) {
      replyText = `親愛的會員您好！很高興您重視「肌力與身體活動」。提醒您可以前往綠色處方燈觀看椅子下肢肌力與防跌體操影音！`;
    } else if (inputText.includes('壓力') || inputText.includes('心情') || inputText.includes('失智') || inputText.includes('憂鬱')) {
      replyText = `親愛的會員您好！放鬆身心與大腦賦能對健康至關重要。提醒您可以前往綠色處方燈觀看懷舊遊戲與大腦活化課程！`;
    } else {
      replyText = `親愛的會員您好！專家團隊已收到您的健康諮詢需求。提醒您可以配合「綠色處方燈」，從日常六大生活面向觀看核心影音課程！`;
    }

    const expertResponseMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'expert',
      type: 'clinic_reply_with_link',
      text: `👨‍⚕️ 專家團隊回覆：\n${replyText}`,
      time: '剛剛',
      actionLink: {
        title: '綠色處方燈 · 核心衛教影音',
        screen: 'GREEN-PRESCRIPTION',
        subtext: 'https://wacare.app/green-rx',
        badge: '短網址',
      },
    };

    setMessagesMap((prev) => ({
      ...prev,
      [targetChat]: [...(prev[targetChat] || []), newMsg, expertResponseMsg],
    }));
  };

  const renderAvatar = (channel: ChatChannel) => {
    return (
      <div className="relative shrink-0">
        {channel.avatarType === 'clinic_expert' && (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white flex flex-col items-center justify-center p-1 text-center shadow-xs border border-white/20">
            <span className="text-[10px] font-black leading-tight tracking-tight">
              專家
              <br />
              診所
            </span>
            <span className="text-[7px] text-amber-200 font-bold mt-0.5 scale-90">
              🌿 生活醫學
            </span>
          </div>
        )}

        {channel.avatarType === 'badge_ai' && (
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-sky-100 via-teal-50 to-orange-100 border border-sky-200 text-slate-800 flex flex-col items-center justify-center p-1 text-center shadow-xs">
            <span className="text-[8px] font-bold text-sky-700 leading-none">AI人工智慧</span>
            <span className="text-[10px] font-black text-orange-600 leading-tight">Wa邦尼</span>
            <span className="text-[7px] text-slate-500 leading-none">24hr服務</span>
          </div>
        )}

        {channel.avatarType === 'friend_user' && (
          <div className="w-12 h-12 rounded-full bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-base shadow-xs">
            {channel.avatarText}
          </div>
        )}

        {/* WaCare Smiley Badge Overlay */}
        {channel.avatarType !== 'friend_user' && (
          <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-orange-500 text-white border-2 border-white flex items-center justify-center shadow-xs">
            <span className="text-[10px] leading-none">😊</span>
          </div>
        )}
      </div>
    );
  };

  const followedExpertsChannels = channelList.filter(
    (channel) => (channel.category === 'expert' || channel.category === 'service') && isExpertFollowed(channel.id)
  );

  const displayedChannels = channelList.filter((channel) => {
    if (channel.category === 'expert' || channel.category === 'service') {
      if (!isExpertFollowed(channel.id)) return false;
    }
    if (activeSubTab === 'experts') return channel.category === 'expert' || channel.category === 'service';
    if (activeSubTab === 'friends') return channel.category === 'friend';
    return true;
  });

  const totalUnreadCount = displayedChannels.filter((c) => c.hasUnreadDot).length;
  const activeChannel = channelList.find((c) => c.id === selectedChat);
  const currentMessages = selectedChat ? messagesMap[selectedChat] || [] : [];

  return (
    <div className="h-full bg-white flex flex-col justify-between overflow-hidden relative">
      {/* 1. CHAT MESSAGE CENTER LIST VIEW */}
      {selectedChat === null && (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Header Bar */}
          <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
            <div className="w-6" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight text-center">
              聊天訊息
            </h1>
            <button
              disabled
              className="p-1 text-slate-400 cursor-not-allowed opacity-50"
              title="更多"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Tabs Bar (全部 / 專家 / 朋友) */}
          <div className="flex items-center border-b border-slate-200 text-sm font-medium bg-white">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer relative ${
                activeSubTab === 'all'
                  ? 'text-orange-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              全部
              {activeSubTab === 'all' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('experts')}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer relative ${
                activeSubTab === 'experts'
                  ? 'text-orange-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              專家 ({followedExpertsChannels.length})
              {activeSubTab === 'experts' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('friends')}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer relative ${
                activeSubTab === 'friends'
                  ? 'text-orange-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              朋友
              {activeSubTab === 'friends' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Channel Chat List */}
          <div className="flex-1 overflow-y-auto min-h-0 touch-pan-y divide-y divide-slate-100">
            {displayedChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => setSelectedChat(channel.id)}
                className="px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors active:bg-slate-100"
              >
                {renderAvatar(channel)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <h2 className="text-sm font-bold text-slate-900 truncate">
                        {channel.name}
                      </h2>
                      {channel.clinicTag && (
                        <span className="text-[9px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.2 rounded font-black shrink-0">
                          {channel.clinicTag}
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] shrink-0 ${channel.timeColor || 'text-slate-400'}`}>
                      {channel.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate leading-snug">
                    {channel.preview}
                  </p>
                </div>

                {channel.hasUnreadDot && (
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CHAT CONVERSATION DETAIL VIEW */}
      {selectedChat !== null && (
        <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
          {/* Chat Top Header */}
          <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                title="返回聊天訊息"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
                  {selectedChat === 'family-medicine' ? (
                    <Stethoscope className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-1">
                    {activeChannel?.name || '專家診所'}
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </h3>
                  <p className="text-[10px] text-teal-700 font-bold">🌿 生活型態醫學 · 綠色處方諮詢</p>
                </div>
              </div>
            </div>

            {/* Direct header shortcut to Green Prescription */}
            <button
              onClick={() => onNavigate('GREEN-PRESCRIPTION')}
              className="text-[11px] bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <Leaf className="w-3 h-3" />
              <span>綠色處方燈</span>
            </button>
          </div>

          {/* Chat Messages Thread Body */}
          <div className="flex-1 p-4 overflow-y-auto min-h-0 touch-pan-y space-y-3.5">
            {currentMessages.map((m) => {
              if (m.sender === 'user') {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="bg-orange-500 text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-[85%] shadow-xs font-medium whitespace-pre-line leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                );
              }

              // Interactive Questionnaire & Event Link Card in Chat
              if (m.type === 'questionnaire_card') {
                return (
                  <div key={m.id} className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                      🌿
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none p-3.5 max-w-[88%] shadow-xs border border-teal-200/90 space-y-3">
                      <p className="text-xs font-black text-slate-900">親愛的會員您好！歡迎來到【示範診所】線上健康諮詢頻道 🌿</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">本頻道支援「綠色處方燈」服務，透過運動、營養、舒眠與減壓等非藥物生活型態，引導您改善健康。您可以在綠色處方首頁查看執行進度、填寫問卷及執行衛教任務。</p>
                      <button type="button" onClick={() => onNavigate('GREEN-PRESCRIPTION')} className="text-left text-xs font-black text-sky-700 underline underline-offset-2 hover:text-sky-800 cursor-pointer">🌿 前往綠色處方燈</button>
                    </div>
                  </div>
                );
              }

              // Clinic Reply Message with Direct Hyperlink to Green Prescription
              if (m.type === 'clinic_reply_with_link') {
                return (
                  <div key={m.id} className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                      🌿
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none p-3.5 max-w-[88%] shadow-md border border-teal-200/80 space-y-3">
                      {/* Top Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-teal-600" />
                          專家診所回覆
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {m.time}
                        </span>
                      </div>

                      {/* Reply Text Body */}
                      <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                        {m.text}
                      </p>

                      {/* Selected Category Tags */}
                      {m.selectedGoals && m.selectedGoals.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-2 space-y-1 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 block">
                            📌 關注領域：
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.selectedGoals.map((goal) => (
                              <span
                                key={goal}
                                className="text-[10px] bg-teal-100 text-teal-800 font-extrabold px-2 py-0.5 rounded border border-teal-200"
                              >
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* DIRECT CLICKABLE SHORT URL HYPERLINK */}
                      {m.actionLink && (
                        <div className="pt-1 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 block mb-1">
                            🔗 點擊短網址前往查看：
                          </span>
                          <div
                            onClick={() => onNavigate(m.actionLink!.screen)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 underline underline-offset-2 break-all cursor-pointer transition-colors group"
                          >
                            <span>{m.actionLink.subtext || 'https://wacare.app/green-rx'}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-sky-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Normal Expert Text Message
              return (
                <div key={m.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {selectedChat === 'family-medicine' ? '🌿' : '🐰'}
                  </div>
                  <div className="bg-white text-slate-800 p-3 rounded-2xl rounded-tl-none text-xs max-w-[85%] shadow-2xs border border-slate-100 leading-relaxed font-medium whitespace-pre-line">
                    {m.text}
                  </div>
                </div>
              );
            })}


          </div>

          {/* Chat Input Bar */}
          <div className="bg-white p-3 border-t border-slate-200 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="輸入訊息（例如：我想改善睡眠、請教飲食建議）..."
              className="flex-1 bg-slate-100 border-none px-4 py-2.5 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            />
            <button
              onClick={handleSendMessage}
              className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. LIFESTYLE GOALS PICKER MODAL */}
      {showQuestionnaireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            {/* Top Accent Header */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white p-4 relative shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-teal-200">
                      生活型態醫學諮詢
                    </span>
                    <h3 className="text-base font-black text-white leading-tight">
                      您目前最想改善的是什麼？
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuestionnaireModal(false)}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
              <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-3 text-xs text-teal-950 leading-relaxed">
                <span className="font-bold">👨‍⚕️ 專家診所衛教團隊：</span>
                <br />
                請勾選您當前期望優先改善之生活面向，送出問卷後，診所將即時回覆並提供對應的綠色處方影音超連結！
              </div>

              {/* Question Box */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                      改善面向（可複選）
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      請至少勾選一項健康目標
                    </p>
                  </div>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                    已選 {selectedOptions.length} 項
                  </span>
                </div>

                {/* Checkbox List Options */}
                <div className="space-y-2">
                  {QUESTIONNAIRE_OPTIONS.map((item) => {
                    const isChecked = selectedOptions.includes(item.label);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleOption(item.label)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-teal-50/90 border-teal-600 text-teal-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1">
                              <span>{item.icon}</span>
                              <span>{item.label}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowQuestionnaireModal(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200/60 rounded-xl font-bold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={selectedOptions.length === 0}
                onClick={handleSubmitQuestionnaire}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                  selectedOptions.length > 0
                    ? 'bg-teal-700 hover:bg-teal-800 text-white active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>送出問卷</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Bottom Navigation Bar */}
      <BottomNavBar activeTab="message" onNavigate={onNavigate} unreadCount={totalUnreadCount} />
    </div>
  );
};
