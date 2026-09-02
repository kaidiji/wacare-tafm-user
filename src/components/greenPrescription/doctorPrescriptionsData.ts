export interface PrescribedActionItem {
  id: string;
  category: string; // e.g. '運動處方', '飲食處方', '睡眠處方', etc.
  title: string; // e.g. '至少150分鐘中等強度運動'
  completed: boolean;
}

export interface DoctorPrescriptionSection {
  id: string;
  pillarKey: string; // '運動習慣', '飲食習慣', etc.
  categoryTitle: string; // '運動處方', '飲食處方', etc.
  items: PrescribedActionItem[];
}

/**
 * Normalizes pillar keys across different variants (fullwidth slashes, spaces, wording)
 */
export function normalizePillarKey(rawKey: string): string {
  if (!rawKey) return rawKey;
  const clean = rawKey.trim();
  if (
    clean.includes('戒菸') ||
    clean.includes('戒酒') ||
    clean.includes('戒檳榔') ||
    clean.includes('危害物質')
  ) {
    return '戒菸／戒酒／戒檳榔';
  }
  if (clean.includes('人際') || clean.includes('社交')) {
    return '增加人際互動';
  }
  if (clean.includes('運動')) return '運動習慣';
  if (clean.includes('飲食')) return '飲食習慣';
  if (clean.includes('睡眠')) return '睡眠品質';
  if (clean.includes('壓力')) return '壓力管理';
  return clean;
}

const SECTION_EXERCISE: DoctorPrescriptionSection = {
  id: 'section-exercise',
  pillarKey: '運動習慣',
  categoryTitle: '運動處方',
  items: [
    { id: 'ex-1', category: '運動處方', title: '至少150分鐘中等強度運動', completed: false },
    { id: 'ex-2', category: '運動處方', title: '肌力訓練', completed: false },
    { id: 'ex-3', category: '運動處方', title: '快走、騎車、彈力帶訓練', completed: false },
  ],
};

const SECTION_DIET: DoctorPrescriptionSection = {
  id: 'section-diet',
  pillarKey: '飲食習慣',
  categoryTitle: '飲食處方',
  items: [
    { id: 'diet-1', category: '飲食處方', title: '每日3份蔬菜2份水果', completed: false },
    { id: 'diet-2', category: '飲食處方', title: '減少高油、高鹽食物', completed: false },
    { id: 'diet-3', category: '飲食處方', title: '減少精緻澱粉及含糖飲料', completed: false },
    { id: 'diet-4', category: '飲食處方', title: '以植物性飲食為主', completed: false },
  ],
};

const SECTION_SLEEP: DoctorPrescriptionSection = {
  id: 'section-sleep',
  pillarKey: '睡眠品質',
  categoryTitle: '睡眠處方',
  items: [
    { id: 'sleep-1', category: '睡眠處方', title: '維持每日 7~8 小時規律作息', completed: false },
    { id: 'sleep-2', category: '睡眠處方', title: '睡前 1 小時遠離 3C 螢幕', completed: false },
    { id: 'sleep-3', category: '睡眠處方', title: '下午 2 點後避免咖啡因', completed: false },
  ],
};

const SECTION_STRESS: DoctorPrescriptionSection = {
  id: 'section-stress',
  pillarKey: '壓力管理',
  categoryTitle: '壓力管理處方',
  items: [
    { id: 'stress-1', category: '壓力管理處方', title: '每日 15 分鐘深呼吸冥想', completed: false },
    { id: 'stress-2', category: '壓力管理處方', title: '自律神經放鬆與戶外散步', completed: false },
  ],
};

const SECTION_ADDICTION: DoctorPrescriptionSection = {
  id: 'section-addiction',
  pillarKey: '戒菸／戒酒／戒檳榔',
  categoryTitle: '避免危害物質使用處方',
  items: [
    { id: 'add-1', category: '避免危害物質使用處方', title: '減少菸品、酒精及檳榔有害物質攝取', completed: false },
    { id: 'add-2', category: '避免危害物質使用處方', title: '遠離二手菸及成癮誘發環境', completed: false },
    { id: 'add-3', category: '避免危害物質使用處方', title: '尋求戒癮專線或專科衛教諮詢', completed: false },
  ],
};

const SECTION_SOCIAL: DoctorPrescriptionSection = {
  id: 'section-social',
  pillarKey: '增加人際互動',
  categoryTitle: '人際社交處方',
  items: [
    { id: 'soc-1', category: '人際社交處方', title: '每週至少 1~2 次社群親友互動', completed: false },
    { id: 'soc-2', category: '人際社交處方', title: '參與健康志工或銀髮班級', completed: false },
  ],
};

export const INITIAL_DOCTOR_PRESCRIPTIONS: Record<string, DoctorPrescriptionSection> = {
  '運動習慣': SECTION_EXERCISE,
  '飲食習慣': SECTION_DIET,
  '睡眠品質': SECTION_SLEEP,
  '壓力管理': SECTION_STRESS,
  '戒菸／戒酒／戒檳榔': SECTION_ADDICTION,
  '戒菸 / 戒酒 / 戒檳榔': SECTION_ADDICTION,
  '戒菸/戒酒/戒檳榔': SECTION_ADDICTION,
  '避免危害物質使用': SECTION_ADDICTION,
  '避免危害物質': SECTION_ADDICTION,
  '增加人際互動': SECTION_SOCIAL,
  '正向社交關係': SECTION_SOCIAL,
};

export function getDoctorPrescriptionSection(
  key: string,
  data: Record<string, DoctorPrescriptionSection> = INITIAL_DOCTOR_PRESCRIPTIONS
): DoctorPrescriptionSection | undefined {
  if (data[key]) return data[key];
  const normalized = normalizePillarKey(key);
  if (data[normalized]) return data[normalized];
  return INITIAL_DOCTOR_PRESCRIPTIONS[normalized] || INITIAL_DOCTOR_PRESCRIPTIONS[key];
}

