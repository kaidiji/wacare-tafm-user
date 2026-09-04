export interface VideoTask {
  id: string;
  title: string;
  category: string;
  type: 'live' | 'video';
  duration: string; // e.g. "29:58"
  durationMinutes: number;
  instructor: string;
  instructorTitle: string;
  description: string;
  completed: boolean;
  assignedDate: string;
  thumbnailColor: string;
  tag: string;
  // Screenshot format specific properties:
  channelName?: string;
  rating?: number;
  reviewCount?: number;
  learnersCount?: number;
  isFree?: boolean;
  posterBadge?: string;
  posterHeadline?: string;
  posterSubtext?: string;
  doctorBadge?: string;
  themeStyle?: 'lavender' | 'mint' | 'amber' | 'teal' | 'warm' | 'sky' | 'rose';
  hasHpaBadge?: boolean;
  avatarEmoji?: string;
}

export const DEFAULT_WEEKLY_VIDEO_TARGET = 3;

export interface GreenPrescriptionWeekStats {
  weekLabel: string;
  startDate: string;
  endDate: string;
  totalExecutions: number;
  categoryStats: {
    category: string;
    liveCount: number;
    videoCount: number;
  }[];
}

// 核心課程影片清單 (預設 15 部生活型態醫學核心影片)
export const ALL_CORE_VIDEO_TASKS: VideoTask[] = [
  // 1. 運動習慣 (3部)
  {
    id: 'vid-sport-1',
    title: '運動訓練下肢肌力，晚年行動健步如飛 (台語)',
    category: '運動習慣',
    type: 'video',
    duration: '47:31',
    durationMinutes: 48,
    instructor: '何宏胤 運動專家',
    instructorTitle: '銀髮體適能指導員與肌力訓練總監',
    description: '親切台語教學，強化長輩大腿與核心肌群，防跌倒、增強平衡感，行路更有力。',
    completed: false,
    assignedDate: '2026-08-20',
    thumbnailColor: 'from-teal-100 via-emerald-100 to-green-200 text-teal-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 5.0,
    reviewCount: 110,
    learnersCount: 392,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '運動訓練下肢肌力，晚年行動健步如飛 (台語)',
    posterSubtext: '椅子體操與防跌核心肌力訓練',
    doctorBadge: '何宏胤 運動專家',
    themeStyle: 'teal',
    hasHpaBadge: true,
    avatarEmoji: '🏃‍♂️',
  },
  {
    id: 'vid-sport-2',
    title: '椅子彈力帶全身肌力雕塑，防跌強核心',
    category: '運動習慣',
    type: 'video',
    duration: '32:15',
    durationMinutes: 32,
    instructor: '林士凱 體能教練',
    instructorTitle: '高齡運動指導教練與功能性訓練講師',
    description: '使用安全彈力帶與椅子，在家輕鬆鍛鍊全身肌群，強化關節穩定度與活動力。',
    completed: false,
    assignedDate: '2026-08-20',
    thumbnailColor: 'from-cyan-100 via-teal-100 to-blue-200 text-cyan-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 4.9,
    reviewCount: 84,
    learnersCount: 420,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '椅子彈力帶全身肌力雕塑，防跌強核心',
    posterSubtext: '安全彈力帶居家肌耐力訓練',
    doctorBadge: '林士凱 體能教練',
    themeStyle: 'teal',
    hasHpaBadge: true,
    avatarEmoji: '🏋️‍♂️',
  },
  {
    id: 'vid-sport-3',
    title: '五行健康操：早晨15分鐘活絡筋骨全家動',
    category: '運動習慣',
    type: 'video',
    duration: '15:40',
    durationMinutes: 16,
    instructor: '陳雅玲 體適能講師',
    instructorTitle: '中華樂齡健康促進協會講師',
    description: '輕快拍打與伸展穴位，早晨快速喚醒身體代謝機能，提升循環與精神活力。',
    completed: false,
    assignedDate: '2026-08-20',
    thumbnailColor: 'from-emerald-100 via-green-100 to-lime-200 text-emerald-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 5.0,
    reviewCount: 135,
    learnersCount: 680,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '五行健康操：早晨15分鐘活絡筋骨全家動',
    posterSubtext: '經絡伸展與全身血液循環促進',
    doctorBadge: '陳雅玲 講師',
    themeStyle: 'mint',
    hasHpaBadge: true,
    avatarEmoji: '🧘‍♀️',
  },

  // 2. 飲食習慣 (3部)
  {
    id: 'vid-diet-1',
    title: '體重.體脂好難消，教你吃出飽足身體輕盈',
    category: '飲食習慣',
    type: 'video',
    duration: '28:01',
    durationMinutes: 28,
    instructor: '簡鈺樺 營養師',
    instructorTitle: '臨床營養師與代謝管理衛教專家',
    description: '破解減重飲食盲點，運用低升糖與高纖飽足技巧，輕鬆調整體脂與代謝健康。',
    completed: false,
    assignedDate: '2026-08-18',
    thumbnailColor: 'from-emerald-100 via-teal-100 to-cyan-200 text-emerald-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 4.9,
    reviewCount: 68,
    learnersCount: 319,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '體重.體脂好難消，教你吃出飽足身體輕盈',
    posterSubtext: '掌握低GI與健康蛋白質配比',
    doctorBadge: '簡鈺樺 營養師',
    themeStyle: 'mint',
    hasHpaBadge: true,
    avatarEmoji: '🥗',
  },
  {
    id: 'vid-diet-2',
    title: '魚油.B群吃對了嗎？健腦必吃營養素防失智！',
    category: '飲食習慣',
    type: 'video',
    duration: '38:35',
    durationMinutes: 39,
    instructor: '高子晴 營養師',
    instructorTitle: '大腦神經營養與保健品諮詢專家',
    description: '解析常見保健品迷思，教您精準挑選 Omega-3、活性 B 群與抗氧化食材，保護大腦細胞。',
    completed: false,
    assignedDate: '2026-08-20',
    thumbnailColor: 'from-amber-100 via-orange-100 to-red-200 text-amber-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 5.0,
    reviewCount: 142,
    learnersCount: 576,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '魚油.B群吃對了嗎？健腦必吃營養素防失智！',
    posterSubtext: '掌握Omega-3與健腦維生素吃法',
    doctorBadge: '高子晴 營養師',
    themeStyle: 'warm',
    hasHpaBadge: true,
    avatarEmoji: '🥑',
  },
  {
    id: 'vid-diet-3',
    title: '地中海飲食在地化：長輩三餐控糖降血壓實戰',
    category: '飲食習慣',
    type: 'video',
    duration: '25:18',
    durationMinutes: 25,
    instructor: '張馨云 臨床營養師',
    instructorTitle: '醫學中心心血管與代謝營養專家',
    description: '將地中海健康飲食法則結合台灣在地當季蔬果、優質好油與魚類，吃出心血管好體質。',
    completed: false,
    assignedDate: '2026-08-20',
    thumbnailColor: 'from-lime-100 via-emerald-100 to-teal-200 text-lime-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 5.0,
    reviewCount: 96,
    learnersCount: 412,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '地中海飲食在地化：長輩三餐控糖降血壓實戰',
    posterSubtext: '在地當季食材心血管飲食指南',
    doctorBadge: '張馨云 營養師',
    themeStyle: 'mint',
    hasHpaBadge: true,
    avatarEmoji: '🥦',
  },

  // 3. 睡眠品質 (2部)
  {
    id: 'vid-sleep-1',
    title: '頻尿、夜尿睡不好？護理師教你因應.改善',
    category: '睡眠品質',
    type: 'video',
    duration: '26:20',
    durationMinutes: 26,
    instructor: '周珈汶 護理師',
    instructorTitle: '泌尿健康照護與舒眠管理專家',
    description: '改善夜間頻尿與中斷睡眠問題，調整飲水節奏與骨盆底肌訓練，找回深層好眠。',
    completed: false,
    assignedDate: '2026-08-19',
    thumbnailColor: 'from-blue-100 via-sky-100 to-indigo-200 text-blue-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 5.0,
    reviewCount: 88,
    learnersCount: 313,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '頻尿、夜尿睡不好？護理師教你因應.改善',
    posterSubtext: '掌握夜間好眠與膀胱保健對策',
    doctorBadge: '周珈汶 護理師',
    themeStyle: 'sky',
    hasHpaBadge: true,
    avatarEmoji: '🌙',
  },
  {
    id: 'vid-sleep-2',
    title: '睡前腹式呼吸與放鬆冥想，告別失眠淺眠',
    category: '睡眠品質',
    type: 'video',
    duration: '20:45',
    durationMinutes: 21,
    instructor: '黃意淳 臨床心理師',
    instructorTitle: '睡眠心理學與生理回饋治療師',
    description: '睡前透過 4-7-8 深度橫膈呼吸與肌肉放鬆掃描，平穩自律神經，有效縮短入睡時間。',
    completed: false,
    assignedDate: '2026-08-20',
    thumbnailColor: 'from-indigo-100 via-sky-100 to-slate-200 text-indigo-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 4.9,
    reviewCount: 104,
    learnersCount: 520,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '睡前腹式呼吸與放鬆冥想，告別失眠淺眠',
    posterSubtext: '自律神經調和與深度睡眠引導',
    doctorBadge: '黃意淳 心理師',
    themeStyle: 'lavender',
    hasHpaBadge: true,
    avatarEmoji: '🌌',
  },

  // 4. 壓力管理 (3部)
  {
    id: 'vid-stress-1',
    title: '懷舊遊戲防失智，信心提升遠離憂鬱',
    category: '壓力管理',
    type: 'video',
    duration: '34:50',
    durationMinutes: 35,
    instructor: '許庭榕 職能治療師',
    instructorTitle: '資深職能治療師與樂齡活動引導專家',
    description: '藉由經典懷舊童玩與遊戲互動，激發長輩正面情緒，增進自我效能與心理韌性。',
    completed: false,
    assignedDate: '2026-08-19',
    thumbnailColor: 'from-orange-100 via-amber-100 to-rose-200 text-orange-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 5.0,
    reviewCount: 75,
    learnersCount: 338,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '懷舊遊戲防失智，信心提升遠離憂鬱',
    posterSubtext: '樂齡情緒調適與懷舊認知賦能',
    doctorBadge: '許庭榕 職能治療師',
    themeStyle: 'warm',
    hasHpaBadge: true,
    avatarEmoji: '🎲',
  },
  {
    id: 'vid-stress-2',
    title: '醫療大富翁：玩遊戲學預立醫療決定',
    category: '壓力管理',
    type: 'video',
    duration: '30:48',
    durationMinutes: 31,
    instructor: '葉北辰 心理師',
    instructorTitle: '安寧緩和諮商心理師與溝通導師',
    description: '用輕鬆的遊戲方式認識自主醫療決定，促進家庭親密對話，減輕未來照護焦慮。',
    completed: false,
    assignedDate: '2026-08-19',
    thumbnailColor: 'from-indigo-100 via-purple-100 to-pink-200 text-indigo-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 4.9,
    reviewCount: 54,
    learnersCount: 306,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '醫療大富翁：玩遊戲學預立醫療決定',
    posterSubtext: '自主醫療決策與安心生命對話',
    doctorBadge: '葉北辰 心理師',
    themeStyle: 'lavender',
    hasHpaBadge: true,
    avatarEmoji: '♟️',
  },
  {
    id: 'vid-stress-3',
    title: '正念減壓與肌肉漸進放鬆練習',
    category: '壓力管理',
    type: 'video',
    duration: '22:30',
    durationMinutes: 23,
    instructor: '蘇益賢 臨床心理師',
    instructorTitle: '正念減壓(MBSR)師資與情緒調節講師',
    description: '學習覺察身心緊繃訊號，藉由漸進式肌肉緊繃放鬆練習，釋放日常累積的慢性壓力。',
    completed: false,
    assignedDate: '2026-08-20',
    thumbnailColor: 'from-rose-100 via-pink-100 to-amber-100 text-rose-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 5.0,
    reviewCount: 82,
    learnersCount: 390,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '正念減壓與肌肉漸進放鬆練習',
    posterSubtext: '身心覺察與深層壓力釋放',
    doctorBadge: '蘇益賢 心理師',
    themeStyle: 'warm',
    hasHpaBadge: true,
    avatarEmoji: '🌸',
  },

  // 5. 戒菸／戒酒／戒檳榔 (2部)
  {
    id: 'vid-addict-1',
    title: '成癮渴求破解法：深呼吸與生活替代對策',
    category: '戒菸／戒酒／戒檳榔',
    type: 'video',
    duration: '17:15',
    durationMinutes: 17,
    instructor: '社區衛教藥師團隊',
    instructorTitle: '戒菸諮詢專科藥師',
    description: '教您應對成癮渴求浮現的「延遲 5 分鐘法則」與健康咀嚼物替代策略，成功跨越戒斷期。',
    completed: false,
    assignedDate: '2026-08-20',
    thumbnailColor: 'from-rose-100 via-orange-100 to-amber-200 text-rose-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 5.0,
    reviewCount: 15,
    learnersCount: 96,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '成癮渴求破解法：深呼吸與生活替代',
    posterSubtext: '延遲5分鐘法則與健康飲食替代',
    doctorBadge: '社區藥師 團隊',
    themeStyle: 'rose',
    hasHpaBadge: true,
    avatarEmoji: '🚭',
  },
  {
    id: 'vid-addict-2',
    title: '戒酒與口腔健康：遠離酒精與檳榔的自主管理指南',
    category: '戒菸／戒酒／戒檳榔',
    type: 'video',
    duration: '21:10',
    durationMinutes: 21,
    instructor: '李政翰 衛教醫師',
    instructorTitle: '家庭醫學科與預防醫學專科醫師',
    description: '認識酒精代謝負擔與檳榔黏膜病變早期徵兆，透過生活習慣替換，重建清新健康口腔與肝臟機能。',
    completed: false,
    assignedDate: '2026-08-20',
    thumbnailColor: 'from-amber-100 via-rose-100 to-orange-200 text-amber-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 4.9,
    reviewCount: 38,
    learnersCount: 185,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '戒酒與口腔健康：遠離酒精與檳榔',
    posterSubtext: '黏膜保護與生活自律管理',
    doctorBadge: '李政翰 醫師',
    themeStyle: 'warm',
    hasHpaBadge: true,
    avatarEmoji: '🩺',
  },

  // 6. 增加人際互動 (2部)
  {
    id: 'vid-social-1',
    title: '線上環遊世界，提升認知防失智',
    category: '增加人際互動',
    type: 'video',
    duration: '29:58',
    durationMinutes: 30,
    instructor: '董懿萱 職能治療師',
    instructorTitle: '臨床職能治療與高齡認知訓練專家',
    description: '透過沉浸式線上走訪世界景點與互動問答，刺激大腦記憶網絡，預防認知退化。',
    completed: false,
    assignedDate: '2026-08-18',
    thumbnailColor: 'from-amber-100 via-orange-100 to-yellow-200 text-amber-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 5.0,
    reviewCount: 92,
    learnersCount: 455,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '線上環遊世界，提升認知防失智',
    posterSubtext: '沉浸式旅遊記憶喚起法',
    doctorBadge: '董懿萱 職能治療師',
    themeStyle: 'amber',
    hasHpaBadge: true,
    avatarEmoji: '👩‍⚕️',
  },
  {
    id: 'vid-social-2',
    title: '社區樂齡桌遊同樂會：促進人際連結與情感交流',
    category: '增加人際互動',
    type: 'video',
    duration: '27:40',
    durationMinutes: 28,
    instructor: '郭佩芬 社工師',
    instructorTitle: '長照社區互助與高齡人際溝通導師',
    description: '帶領長輩參與益智桌遊與團體分享，打破孤獨感，建立溫暖支持的鄰里社交朋友圈。',
    completed: false,
    assignedDate: '2026-08-20',
    thumbnailColor: 'from-teal-100 via-sky-100 to-emerald-200 text-teal-950',
    tag: '核心課程',
    channelName: '健康服務 綠色處方',
    rating: 5.0,
    reviewCount: 78,
    learnersCount: 360,
    isFree: true,
    posterBadge: '衛生福利部國民健康署',
    posterHeadline: '社區樂齡桌遊同樂會：促進人際連結',
    posterSubtext: '打破孤獨感與建立社交朋友圈',
    doctorBadge: '郭佩芬 社工師',
    themeStyle: 'teal',
    hasHpaBadge: true,
    avatarEmoji: '🤝',
  },
];

export const ALL_CATEGORY_VIDEO_TASKS: Record<string, VideoTask[]> = {
  '運動習慣': ALL_CORE_VIDEO_TASKS.filter((t) => t.category === '運動習慣'),
  '飲食習慣': ALL_CORE_VIDEO_TASKS.filter((t) => t.category === '飲食習慣'),
  '睡眠品質': ALL_CORE_VIDEO_TASKS.filter((t) => t.category === '睡眠品質'),
  '壓力管理': ALL_CORE_VIDEO_TASKS.filter((t) => t.category === '壓力管理'),
  '戒菸／戒酒／戒檳榔': ALL_CORE_VIDEO_TASKS.filter((t) => t.category === '戒菸／戒酒／戒檳榔'),
  '增加人際互動': ALL_CORE_VIDEO_TASKS.filter((t) => t.category === '增加人際互動'),
};

// 根據勾選的類別取得對應指派影片；未指定類別時才回傳全部核心課程影片
export function getTasksForCategories(categories?: string[]): VideoTask[] {
  if (!categories || categories.length === 0) {
    return [...ALL_CORE_VIDEO_TASKS];
  }

  const assignedSet = new Set<string>();
  const assigned: VideoTask[] = [];

  categories.forEach((cat) => {
    if (ALL_CATEGORY_VIDEO_TASKS[cat]) {
      ALL_CATEGORY_VIDEO_TASKS[cat].forEach((task) => {
        if (!assignedSet.has(task.id)) {
          assignedSet.add(task.id);
          assigned.push(task);
        }
      });
    }
  });

  return assigned;
}

// 預設一開始就加載完整的核心課程影片清單，無需先填問卷
export const INITIAL_VIDEO_TASKS: VideoTask[] = [...ALL_CORE_VIDEO_TASKS];

export const CATEGORIES_LIST = [
  '運動習慣',
  '飲食習慣',
  '睡眠品質',
  '壓力管理',
  '戒菸／戒酒／戒檳榔',
  '增加人際互動',
];
