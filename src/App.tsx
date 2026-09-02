import React, { useState, useEffect } from 'react';
import { DataAuthorizationScreen } from './components/DataAuthorizationScreen';
import { ScreenId, UserProfile, Activity722State, ChatMessage } from './types';
import { Scr00Landing } from './components/Scr00Landing';
import { Scr01Onboarding } from './components/Scr01Onboarding';
import { Scr02Nickname } from './components/Scr02Nickname';
import { Scr03Home } from './components/Scr03Home';
import { Scr04ExpertList } from './components/Scr04ExpertList';
import { ExpertProfile } from './components/ExpertProfile';
import { WaCareMessages } from './components/WaCareMessages';
import { RealNameVerification } from './components/RealNameVerification';
import { Scr08BloodPressure } from './components/Scr08BloodPressure';
import { HealthDataScreen } from './components/HealthDataScreen';
import { GreenPrescriptionDashboard } from './components/greenPrescription/GreenPrescriptionDashboard';
import { GreenPrescriptionCoursesScreen } from './components/greenPrescription/GreenPrescriptionCoursesScreen';
import { GreenPrescriptionEventScreen } from './components/greenPrescription/GreenPrescriptionEventScreen';
import {
  VideoTask,
  ALL_CORE_VIDEO_TASKS,
  getTasksForCategories,
} from './components/greenPrescription/greenPrescriptionData';
import {
  INITIAL_DOCTOR_PRESCRIPTIONS,
  DoctorPrescriptionSection,
  normalizePillarKey,
  getDoctorPrescriptionSection,
} from './components/greenPrescription/doctorPrescriptionsData';

import { QuestionnaireScreen } from './components/QuestionnaireScreen';

export function App() {
  // 預設登入狀態並直接進入 Home 主頁 ('SCR-03')
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('SCR-03');
  const [selectedExpertId, setSelectedExpertId] = useState<'aimee' | 'bliss' | 'family-medicine'>('family-medicine');
  const [showBPModal, setShowBPModal] = useState(false);
  const [activeChatChannel, setActiveChatChannel] = useState<string | null>(null);

  // User Profile State (預設已有登入帳號資料)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    nickname: '陳小明',
    realName: '陳小明',
    birthday: '1985-06-15',
    gender: '男',
    idNumber: 'A123456789',
    phone: '0912345678',
    email: 'chen.xiaoming@example.com',
    height: '175',
    weight: '70',
    bloodType: 'O',
  });

  // Followed experts state (預設追蹤 Wa 邦尼人工智慧 與 生活型態醫學專家)
  const [followedExperts, setFollowedExperts] = useState<string[]>(['wa-bunny', 'family-medicine']);

  // 同意書簽署狀態（步驟一）
  const [isConsentCompleted, setIsConsentCompleted] = useState<boolean>(false);

  // 生活型態目標與處方影片狀態（預設一開始尚未填寫問卷，等填寫完畢由後台專家派送）
  const [isQuestionnaireSubmitted, setIsQuestionnaireSubmitted] = useState<boolean>(false);
  const [isPrescriptionDispatched, setIsPrescriptionDispatched] = useState<boolean>(false);
  const [submittedGoals, setSubmittedGoals] = useState<string[]>([]);
  const [assignedGoals, setAssignedGoals] = useState<string[]>([]);
  const [videoTasks, setVideoTasks] = useState<VideoTask[]>(ALL_CORE_VIDEO_TASKS);

  // 生活型態處方行動打卡狀態 (初始預設)
  const [doctorPrescriptions, setDoctorPrescriptions] = useState<
    Record<string, DoctorPrescriptionSection>
  >(INITIAL_DOCTOR_PRESCRIPTIONS);

  const handleTogglePrescriptionItem = (pillarKey: string, itemId: string) => {
    setDoctorPrescriptions((prev) => {
      const normalized = normalizePillarKey(pillarKey);
      const section =
        prev[pillarKey] ||
        prev[normalized] ||
        getDoctorPrescriptionSection(pillarKey, prev);
      if (!section) return prev;

      const updatedSection: DoctorPrescriptionSection = {
        ...section,
        items: section.items.map((it) =>
          it.id === itemId ? { ...it, completed: !it.completed } : it
        ),
      };

      const next = {
        ...prev,
        [pillarKey]: updatedSection,
        [normalized]: updatedSection,
        [section.pillarKey]: updatedSection,
      };

      try {
        localStorage.setItem('wacare_doctor_prescriptions', JSON.stringify(next));
      } catch (e) {
        // ignore
      }

      return next;
    });
  };

  // Persistent Messages Map
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({
    'family-medicine': [
      {
        id: 'fm-1',
        sender: 'expert',
        text: '親愛的會員您好！歡迎來到【生活型態醫學專家】線上健康諮詢頻道 🌿\n\n本頻道支援「綠色處方燈」服務。我們致力於透過非藥物的健康生活型態（運動、營養、舒眠、減壓）引導您改善健康。請填寫下方生活型態問卷告訴我們您最在意的生活面向，專家團隊將為您分析並開立專屬綠色處方！',
        time: '09:00',
      },
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

  // 當使用者填寫完問卷提交後：只記錄病人需求並在聊天室發送病人的需求訊息，不直接派送處方 (核心需求)
  const handleSubmitQuestionnaire = (goals: string[]) => {
    setSubmittedGoals(goals);
    setIsQuestionnaireSubmitted(true);
    setIsPrescriptionDispatched(false);
    setAssignedGoals([]); // 尚未經專家派送，處方尚未啟用

    const userSummaryText = `您好！我已填寫完成生活型態問卷，目前最想改善的面向為：\n${goals.map((opt) => `• ${opt}`).join('\n')}`;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userSummaryText,
      time: '剛剛',
    };

    setMessagesMap((prev) => {
      const existing = prev['family-medicine'] || [];
      return {
        ...prev,
        'family-medicine': [...existing, userMsg],
      };
    });
  };

  // 模擬專家診所從後台派送處方與訊息 (使用者明確要求：按此按鍵才派送訊息跟處方)
  const handleDispatchPrescription = (customGoals?: string[]) => {
    const targetGoals =
      customGoals && customGoals.length > 0
        ? customGoals
        : submittedGoals.length > 0
        ? submittedGoals
        : ['運動習慣', '飲食習慣'];

    setSubmittedGoals(targetGoals);
    setIsQuestionnaireSubmitted(true);
    setIsPrescriptionDispatched(true);
    setAssignedGoals(targetGoals);
    setVideoTasks(getTasksForCategories(targetGoals));

    const goalsString = targetGoals.join('、');
    const shortUrl = `https://wacare.app/green-rx?focus=${encodeURIComponent(targetGoals[0] || 'health')}`;

    const expertReplyMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'expert',
      type: 'clinic_reply_with_link',
      text: `👨‍⚕️ 專家診所團隊回覆：\n\n親愛的會員您好，我們已從後台審閱您所關注的生活面向【${goalsString}】，並為您正式開立專屬生活型態綠色處方！\n\n依據生活型態醫學指引，請前往「綠色處方燈」觀看您在意的生活領域相關衛教影音與每日落實任務，陪伴您一步步達成健康目標。`,
      time: '剛剛',
      selectedGoals: targetGoals,
      actionLink: {
        title: '綠色處方燈 · 核心衛教影音與生活處方',
        screen: 'GREEN-PRESCRIPTION',
        subtext: shortUrl,
        badge: '短網址',
      },
    };

    setMessagesMap((prev) => {
      const existing = prev['family-medicine'] || [];
      return {
        ...prev,
        'family-medicine': [...existing, expertReplyMsg],
      };
    });
  };

  const handleToggleVideoTask = (id: string) => {
    setVideoTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Activity State
  const [activityState, setActivityState] = useState<Activity722State>({
    step1Authorized: false,
    authorizedExpert: null,
    step2RealNameCompleted: true,
    step3Eligible: true,
    step4RecordedToday: false,
    records: [],
  });

  const handleAuthorizeSuccess = (expId: string) => {
    setActivityState((prev) => ({
      ...prev,
      step1Authorized: true,
      authorizedExpert: (expId === 'bliss' ? 'bliss' : 'aimee') as any,
    }));
    setFollowedExperts((prev) => (prev.includes(expId) ? prev : [...prev, expId]));
  };

  const handleToggleFollow = (expertId: string) => {
    setFollowedExperts((prev) =>
      prev.includes(expertId) ? prev.filter((id) => id !== expertId) : [...prev, expertId]
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 overflow-hidden font-sans antialiased text-slate-800 select-none">
      {/* 🏥 外部：專家診所後台管理與模擬派送控制列 (Outside the mobile frame) */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 shrink-0 z-40 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-base shadow-sm font-black shrink-0">
            🌿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white">
                生活型態醫學專家診所 · 後台管理系統
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                後台模擬控制台
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>個案病人：<strong className="text-slate-200">{userProfile.nickname}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                處方派發狀態：
                {isPrescriptionDispatched ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    處方已正式派送給個案
                  </span>
                ) : isQuestionnaireSubmitted ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
                    已收到問卷需求【{submittedGoals.join('、')}】待審核派送
                  </span>
                ) : (
                  <span className="text-slate-400">尚未收到個案生活型態問卷</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 外部後台操作按鍵 */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 派送處方按鈕 */}
          <button
            type="button"
            onClick={() => handleDispatchPrescription()}
            disabled={isPrescriptionDispatched}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isPrescriptionDispatched
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : isQuestionnaireSubmitted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white ring-2 ring-emerald-400/50 shadow-emerald-900/30 animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            }`}
            title="從專家診所後台將處方任務與訊息派送給使用者"
          >
            <span className="text-sm">👨‍⚕️</span>
            <span>
              {isPrescriptionDispatched
                ? '處方已派送完成'
                : isQuestionnaireSubmitted
                ? '立即從後台派送處方'
                : '模擬後台派送處方'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Mobile App Frame Stage */}
      <div className="flex-1 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
        <div className="w-full h-full max-w-md bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative sm:border sm:border-slate-800/80">
          
          {/* SCREEN ROUTING */}

          {currentScreen === 'SCR-00' && (
            <Scr00Landing
              onLoginRegister={() => setCurrentScreen('SCR-01')}
              onSkipToHome={() => setCurrentScreen('SCR-03')}
            />
          )}

          {currentScreen === 'SCR-01' && (
            <Scr01Onboarding
              onNavigateNext={() => setCurrentScreen('SCR-02')}
              onNavigateBack={() => setCurrentScreen('SCR-00')}
            />
          )}

          {currentScreen === 'SCR-02' && (
            <Scr02Nickname
              nickname={userProfile.nickname}
              setNickname={(val) => setUserProfile((prev) => ({ ...prev, nickname: val }))}
              onNavigateNext={() => setCurrentScreen('SCR-03')}
              onNavigateBack={() => setCurrentScreen('SCR-01')}
            />
          )}

          {currentScreen === 'SCR-03' && (
            <Scr03Home
              nickname={userProfile.nickname}
              onNavigate={setCurrentScreen}
              onOpenBloodPressure={() => setShowBPModal(true)}
              onOpenExperts={() => setCurrentScreen('SCR-04')}
            />
          )}

          {currentScreen === 'SCR-04' && (
            <Scr04ExpertList
              onNavigate={setCurrentScreen}
              onSelectExpert={(expId) => {
                setSelectedExpertId(expId as any);
                setCurrentScreen('EXPERT-DETAIL');
              }}
              step1Authorized={activityState.step1Authorized}
              authorizedExpert={activityState.authorizedExpert}
              followedExperts={followedExperts}
              onToggleFollow={handleToggleFollow}
            />
          )}

          {currentScreen === 'EXPERT-DETAIL' && (
            <ExpertProfile
              expertId={selectedExpertId}
              onNavigate={setCurrentScreen}
              activityState={activityState}
              onAuthorizeSuccess={handleAuthorizeSuccess}
            />
          )}

          {currentScreen === 'MESSAGES' && (
            <WaCareMessages
              onNavigate={setCurrentScreen}
              followedExperts={followedExperts}
              step1Authorized={activityState.step1Authorized}
              authorizedExpert={activityState.authorizedExpert}
              assignedGoals={assignedGoals}
              messagesMap={messagesMap}
              onUpdateMessagesMap={setMessagesMap}
              isQuestionnaireSubmitted={isQuestionnaireSubmitted}
              isPrescriptionDispatched={isPrescriptionDispatched}
              onDispatchPrescription={handleDispatchPrescription}
              submittedGoals={submittedGoals}
              onSubmitQuestionnaire={handleSubmitQuestionnaire}
              initialChatId={activeChatChannel}
            />
          )}

          {currentScreen === 'GREEN-PRESCRIPTION-EVENT' && (
            <GreenPrescriptionEventScreen
              onBack={() => {
                setActiveChatChannel('family-medicine');
                setCurrentScreen('MESSAGES');
              }}
              isConsentCompleted={isConsentCompleted}
              onSetConsentCompleted={setIsConsentCompleted}
              isQuestionnaireSubmitted={isQuestionnaireSubmitted}
              submittedGoals={submittedGoals}
              onDispatchPrescription={handleDispatchPrescription}
              onCompleteAndReturnToChat={(goals) => {
                handleSubmitQuestionnaire(goals);
                setActiveChatChannel('family-medicine');
                setCurrentScreen('MESSAGES');
              }}
            />
          )}

          {currentScreen === 'DATA-AUTHORIZATION' && (
            <DataAuthorizationScreen
              expertId={selectedExpertId as any}
              onNavigate={setCurrentScreen}
              onAuthorizeSuccess={handleAuthorizeSuccess}
            />
          )}

          {currentScreen === 'REAL-NAME' && (
            <RealNameVerification
              profile={userProfile}
              onUpdateProfile={(updated) => setUserProfile(updated)}
              onNavigateBack={() => setCurrentScreen('SCR-03')}
            />
          )}

          {currentScreen === 'HEALTH-DATA' && (
            <HealthDataScreen
              onNavigate={setCurrentScreen}
              nickname={userProfile.nickname}
              videoTasks={videoTasks}
              onToggleVideoTask={handleToggleVideoTask}
              assignedGoals={assignedGoals}
              isQuestionnaireSubmitted={isQuestionnaireSubmitted}
              onSubmitLifestyleQuestionnaire={handleSubmitQuestionnaire}
              prescriptionData={doctorPrescriptions}
              onTogglePrescriptionItem={handleTogglePrescriptionItem}
            />
          )}

          {currentScreen === 'QUESTIONNAIRE' && (
            <QuestionnaireScreen
              onBack={() => setCurrentScreen('HEALTH-DATA')}
              onNavigate={setCurrentScreen}
              isLifestyleSubmitted={isQuestionnaireSubmitted}
              submittedGoals={submittedGoals}
              onSubmitLifestyleQuestionnaire={handleSubmitQuestionnaire}
            />
          )}

          {currentScreen === 'GREEN-PRESCRIPTION' && (
            <GreenPrescriptionDashboard
              onBack={() => setCurrentScreen('HEALTH-DATA')}
              onNavigateToTasks={() => setCurrentScreen('GREEN-PRESCRIPTION-TASKS')}
              tasks={videoTasks}
              assignedGoals={assignedGoals}
              submittedGoals={submittedGoals}
              isQuestionnaireSubmitted={isQuestionnaireSubmitted}
              isPrescriptionDispatched={isPrescriptionDispatched}
              onDispatchPrescription={handleDispatchPrescription}
              onNavigateToQuestionnaire={() => {
                setActiveChatChannel('family-medicine');
                setCurrentScreen('MESSAGES');
              }}
              onNavigate={setCurrentScreen}
              prescriptionData={doctorPrescriptions}
              onTogglePrescriptionItem={handleTogglePrescriptionItem}
            />
          )}

          {currentScreen === 'GREEN-PRESCRIPTION-TASKS' && (
            <GreenPrescriptionCoursesScreen
              onBack={() => setCurrentScreen('GREEN-PRESCRIPTION')}
              tasks={videoTasks}
              onToggleComplete={handleToggleVideoTask}
              assignedGoals={assignedGoals}
              onNavigate={setCurrentScreen}
            />
          )}

          {/* Blood Pressure Input Keypad Modal (SCR-08) */}
          {(showBPModal || currentScreen === 'SCR-08') && (
            <Scr08BloodPressure
              onCancel={() => {
                setShowBPModal(false);
                if (currentScreen === 'SCR-08') setCurrentScreen('SCR-03');
              }}
              onComplete={(data) => {
                setActivityState((prev) => ({
                  ...prev,
                  step4RecordedToday: true,
                  records: [data, ...prev.records],
                }));
                setShowBPModal(false);
                if (currentScreen === 'SCR-08') setCurrentScreen('SCR-03');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
