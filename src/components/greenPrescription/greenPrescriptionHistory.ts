import { DoctorPrescriptionSection } from './doctorPrescriptionsData';
import { DEFAULT_WEEKLY_VIDEO_TARGET, VideoTask } from './greenPrescriptionData';

// 執行紀錄規則（2026/09 調整）：
// 1. 放棄即時記錄，改為週期性結算 —— 純影片觀看週期以「週」為單位（週一至週日）結算一次；
//    醫師派發新處方時則立即結算目前週期。
// 2. 每當醫師根據新問卷派發一次新處方，系統即「重新整理」：
//    將此前累積的活動（觀看影片、舊處方執行進度）結算成一筆歷史紀錄，並開始新的記錄週期。

export interface HistorySnapshotTaskItem {
  id: string;
  category: string;
  title: string;
  completed: boolean;
}

export interface HistoricalSnapshot {
  snapshotVersion: number;
  id: string;
  startDate: string;
  endDate: string;
  videoCompleted: number;
  videoTotal: number;
  prescriptionTaskSnapshot: HistorySnapshotTaskItem[];
  expertName?: string;
}

const HISTORY_SNAPSHOT_VERSION = 3;
const HISTORY_STORAGE_KEY = 'wacare_green_prescription_history';
const PERIOD_START_STORAGE_KEY = 'wacare_green_prescription_period_start';

// 週期以「週一至週日」為一個結算週，而非指派後固定 7 天倒數；達成率、結算日期
// 一律以該週的週日為終點計算，而非以系統實際檢查到期的當下時間為準。
export function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay(); // 0 = 週日 ... 6 = 週六
  const diffToMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - diffToMonday);
  return weekStart;
}

export function getWeekEnd(date: Date): Date {
  const weekEnd = getWeekStart(date);
  weekEnd.setDate(weekEnd.getDate() + 6); // 週日
  return weekEnd;
}

const DEMO_HISTORY_TASK_DEFINITIONS = [
  ['diet', '每日攝取至少3份蔬菜、2份水果'], ['diet', '減少高油、高鹽食物'], ['diet', '減少精緻澱粉及含糖飲料'],
  ['activity', '每週累積至少150分鐘中等強度活動'], ['activity', '每日安排伸展活動'], ['activity', '維持規律運動習慣'],
  ['sleep', '建立規律作息及固定睡眠時間'], ['sleep', '睡前減少使用3C產品'], ['sleep', '維持適當睡眠時數'],
  ['stress', '每週安排個人放鬆時間'], ['stress', '練習適合自己的壓力調適方法'],
  ['social', '維持與家人、朋友或他人的正向互動'], ['social', '建立適合自己的社會支持網絡'],
  ['substance', '避免或減少菸草、酒精及檳榔'], ['substance', '減少環境毒素暴露'],
] as const;

const DEMO_HISTORY_TASK_SNAPSHOT: HistorySnapshotTaskItem[] = DEMO_HISTORY_TASK_DEFINITIONS.map(([category, title], index) => ({
  id: `history-2026-08-03-${category}-${String(index + 1).padStart(2, '0')}`,
  category,
  title,
  completed: index < 8,
}));

const SEEDED_HISTORY: HistoricalSnapshot = {
  snapshotVersion: HISTORY_SNAPSHOT_VERSION,
  id: 'green-prescription-history-2026-08-03',
  startDate: '2026/08/03',
  endDate: '2026/08/09',
  videoCompleted: 2,
  videoTotal: 3,
  prescriptionTaskSnapshot: DEMO_HISTORY_TASK_SNAPSHOT,
  expertName: '示範診所',
};

export function loadHistoricalSnapshots(): HistoricalSnapshot[] {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    if (Array.isArray(stored) && stored.length > 0 && stored.every((entry) => entry?.snapshotVersion === HISTORY_SNAPSHOT_VERSION)) {
      return stored;
    }
  } catch {
    /* fall through to seeded default */
  }
  const seeded = [SEEDED_HISTORY];
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    /* ignore persistence failure */
  }
  return seeded;
}

export function saveHistoricalSnapshots(snapshots: HistoricalSnapshot[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(snapshots));
  } catch {
    /* ignore persistence failure */
  }
}

export function loadPeriodStart(): string {
  try {
    const stored = localStorage.getItem(PERIOD_START_STORAGE_KEY);
    if (stored) return stored;
  } catch {
    /* ignore and fall through */
  }
  const weekStart = getWeekStart(new Date()).toISOString();
  try {
    localStorage.setItem(PERIOD_START_STORAGE_KEY, weekStart);
  } catch {
    /* ignore persistence failure */
  }
  return weekStart;
}

export function savePeriodStart(iso: string): void {
  try {
    localStorage.setItem(PERIOD_START_STORAGE_KEY, iso);
  } catch {
    /* ignore persistence failure */
  }
}

export function isPeriodDue(periodStartIso: string, now: Date = new Date()): boolean {
  const start = new Date(periodStartIso);
  if (Number.isNaN(start.getTime())) return false;
  return getWeekStart(now).getTime() > getWeekStart(start).getTime();
}

function formatHistoryDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

export function buildPrescriptionTaskSnapshot(
  doctorPrescriptions: Record<string, DoctorPrescriptionSection>
): HistorySnapshotTaskItem[] {
  return Object.values(doctorPrescriptions).flatMap((section) =>
    section.items.map((item) => ({
      id: item.id,
      category: section.categoryTitle,
      title: item.title,
      completed: item.completed,
    }))
  );
}

// 一筆紀錄只在「確實有活動可結算」時才產生 —— 完全沒有觀看影片、也沒有處方進度的
// 空週期（例如首次派送前根本還沒開始使用）不需要多留一筆紀錄。
export function hasSettleableActivity(params: {
  videoTasks: VideoTask[];
  doctorPrescriptions: Record<string, DoctorPrescriptionSection>;
}): boolean {
  const videoCompleted = new Set(params.videoTasks.filter((task) => task.completed).map((task) => task.id)).size;
  return videoCompleted > 0 || Object.keys(params.doctorPrescriptions).length > 0;
}

export function buildSettlementSnapshot(params: {
  periodStartIso: string;
  now?: Date;
  videoTasks: VideoTask[];
  doctorPrescriptions: Record<string, DoctorPrescriptionSection>;
  expertName?: string;
}): HistoricalSnapshot {
  const now = params.now ?? new Date();
  // 課程進度以每週目標（DEFAULT_WEEKLY_VIDEO_TARGET）為分母，與畫面上「課程（每週目標）」
  // 的算法一致，而不是取當週可選影片池的總數。
  const videoTotal = DEFAULT_WEEKLY_VIDEO_TARGET;
  const videoCompletedRaw = new Set(params.videoTasks.filter((task) => task.completed).map((task) => task.id)).size;
  const videoCompleted = Math.min(videoTotal, videoCompletedRaw);
  const prescriptionTaskSnapshot = buildPrescriptionTaskSnapshot(params.doctorPrescriptions);
  return {
    snapshotVersion: HISTORY_SNAPSHOT_VERSION,
    id: `green-prescription-history-${now.getTime()}`,
    startDate: formatHistoryDate(new Date(params.periodStartIso)),
    endDate: formatHistoryDate(now),
    videoCompleted,
    videoTotal,
    prescriptionTaskSnapshot,
    expertName: prescriptionTaskSnapshot.length > 0 ? params.expertName : undefined,
  };
}
