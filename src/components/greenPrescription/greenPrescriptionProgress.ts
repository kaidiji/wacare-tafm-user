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
    ? Object.values(doctorPrescriptions).flatMap((section) => section.items)
    : [];
  const prescriptionTotal = prescriptionItems.length;
  const prescriptionCompleted = prescriptionItems.filter((item) => item.completed).length;
  const videoTotal = videoTasks.length;
  const videoCompleted = videoTasks.filter((task) => task.completed).length;
  const total = prescriptionTotal + videoTotal;
  const completed = prescriptionCompleted + videoCompleted;
  return {
    prescriptionTotal,
    prescriptionCompleted,
    videoTotal,
    videoCompleted,
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
