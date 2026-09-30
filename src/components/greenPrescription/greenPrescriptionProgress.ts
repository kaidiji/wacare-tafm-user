import { VideoTask } from './greenPrescriptionData';
import { DoctorPrescriptionSection } from './doctorPrescriptionsData';

export interface GreenPrescriptionProgress {
  prescriptionTotal: number;
  prescriptionCompleted: number;
  videoTotal: number;
  videoCompleted: number;
  total: number;
  completed: number;
  percentage: number;
}

export function calculateProgressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  const safeCompleted = Math.max(0, Math.min(completed, total));
  if (safeCompleted === total) return 100;
  return Math.min(99, Math.max(0, Math.round((safeCompleted / total) * 100)));
}

export function calculateGreenPrescriptionProgress({
  isPrescriptionDispatched,
  doctorPrescriptions,
  videoTasks,
}: {
  isPrescriptionDispatched: boolean;
  doctorPrescriptions: Record<string, DoctorPrescriptionSection>;
  videoTasks: VideoTask[];
}): GreenPrescriptionProgress {
  const hasAssignedPrescription = isPrescriptionDispatched && Object.keys(doctorPrescriptions).length > 0;
  const prescriptionItems = hasAssignedPrescription
    ? Array.from(new Map(Object.values(doctorPrescriptions).flatMap((section) => section.items).map((item) => [item.id, item])).values())
    : [];
  const prescriptionTotal = prescriptionItems.length;
  const prescriptionCompleted = Math.min(prescriptionTotal, prescriptionItems.filter((item) => item.completed).length);
  const activeVideoTasks = Array.from(new Map(videoTasks.map((task) => [task.id, task])).values());
  const videoTotal = activeVideoTasks.length;
  const videoCompleted = activeVideoTasks.filter((task) => task.completed).length;
  // 影片僅保留觀看紀錄，不列入生活型態處方完成率。
  const total = prescriptionTotal;
  const completed = prescriptionCompleted;
  return {
    prescriptionTotal,
    prescriptionCompleted,
    videoTotal,
    videoCompleted,
    total,
    completed,
    percentage: calculateProgressPercent(completed, total),
  };
}
