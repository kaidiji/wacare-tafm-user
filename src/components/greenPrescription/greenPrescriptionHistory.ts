import { DoctorPrescriptionSection } from './doctorPrescriptionsData';
import { DEFAULT_WEEKLY_VIDEO_TARGET, VideoTask } from './greenPrescriptionData';

// 執行紀錄規則（2026/09 調整）：
// 1. 專家第一次派發處方後才開始記錄週期。
// 2. 每個週期為 30 天；到期或專家派發新處方時，結算目前週期並保留累積進度。

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
export const PRESCRIPTION_PERIOD_DAYS = 30;

export function getPeriodEnd(date: Date): Date {
  const periodEnd = new Date(date);
  periodEnd.setDate(periodEnd.getDate() + PRESCRIPTION_PERIOD_DAYS - 1);
  return periodEnd;
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
  const periodStart = new Date().toISOString();
  try {
    localStorage.setItem(PERIOD_START_STORAGE_KEY, periodStart);
  } catch {
    /* ignore persistence failure */
  }
  return periodStart;
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
  const dueAt = new Date(start);
  dueAt.setDate(dueAt.getDate() + PRESCRIPTION_PERIOD_DAYS);
  return now.getTime() >= dueAt.getTime();
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
  // 課程進度沿用既有目標（DEFAULT_WEEKLY_VIDEO_TARGET）為分母，
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
