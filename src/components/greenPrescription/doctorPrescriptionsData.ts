export type PrescriptionLevel = 'basic' | 'enhanced';
export interface PrescribedActionItem { id: string; category: string; title: string; completed: boolean; level?: PrescriptionLevel; }
export interface DoctorPrescriptionSection { id: string; pillarKey: string; categoryTitle: string; items: PrescribedActionItem[]; }
export interface PrescriptionCatalogItem { id: string; pillarKey: string; category: string; title: string; level: PrescriptionLevel; }

export function normalizePillarKey(rawKey: string): string {
  if (!rawKey) return rawKey;
  const clean = rawKey.trim();
  if (clean.includes('戒菸') || clean.includes('戒酒') || clean.includes('戒檳榔') || clean.includes('危害物質')) return '戒菸／戒酒／戒檳榔';
  if (clean.includes('人際') || clean.includes('社交')) return '增加人際互動';
  if (clean.includes('運動') || clean.includes('身體活動')) return '運動習慣';
  if (clean.includes('飲食')) return '飲食習慣';
  if (clean.includes('睡眠')) return '睡眠品質';
  if (clean.includes('壓力')) return '壓力管理';
  return clean;
}

const catalog = (pillarKey: string, category: string, basic: string[], enhanced: string[]): PrescriptionCatalogItem[] => [
  ...basic.map((title, index) => ({ id: `${pillarKey}-basic-${index + 1}`, pillarKey, category, title, level: 'basic' as const })),
  ...enhanced.map((title, index) => ({ id: `${pillarKey}-enhanced-${index + 1}`, pillarKey, category, title, level: 'enhanced' as const })),
];

export const PRESCRIPTION_CATALOG: PrescriptionCatalogItem[] = [
  ...catalog('飲食習慣', '飲食處方', ['每日攝取至少3份蔬菜、2份水果', '減少高油、高鹽食物', '減少精緻澱粉及含糖飲料', '減少紅肉及加工食品攝取'], ['以植物性為主，採均衡、多樣化飲食', '適量攝取植物性蛋白質、堅果及優質植物油', '減少外食頻率', '減少宵夜及不必要點心', '控制甜食攝取', '體重管理飲食調整', '轉介營養師諮詢']),
  ...catalog('運動習慣', '身體活動處方', ['每週累積至少150分鐘中等強度有氧運動', '依個人體能及健康狀況逐步增加活動量'], ['有氧運動（如快走、慢跑、游泳、球類運動）', '重量訓練', '伸展運動（如瑜珈、皮拉提斯）', '氣功、太極']),
  ...catalog('睡眠品質', '睡眠處方', ['建立規律作息及固定睡眠時間', '維持適當睡眠時數', '建立良好睡眠環境', '睡前進行放鬆活動（伸展、冥想、閱讀等）'], ['固定起床時間', '睡前減少使用3C產品', '避免睡前攝取咖啡因', '轉介睡眠／減重專業門診']),
  ...catalog('壓力管理', '壓力管理處方', ['每週安排個人放鬆時間', '練習適合自己的壓力調適方法', '建立規律的休息與放鬆習慣'], ['腹式呼吸訓練', '正念／冥想練習', '肌肉放鬆法', '參與紓壓或壓力管理課程', '心理諮商或相關專業轉介']),
  ...catalog('增加人際互動', '正向社會連結處方', ['維持與家人、朋友或他人的正向互動', '每週至少安排一次社交、社區或興趣活動', '建立適合自己的社會支持網絡'], ['參與社區運動團體', '參與社區關懷據點活動', '參與興趣或學習團體', '參與志工服務', '參與藝文活動']),
  ...catalog('戒菸／戒酒／戒檳榔', '避免危害物質使用處方', ['避免或減少菸草、過量酒精及檳榔等危害健康物質', '減少環境毒素暴露，如空氣污染及室內污染', '依個人使用情形設定減量或戒除目標'], ['訂定戒菸日期或減菸目標', '鼓勵戒菸並轉介戒菸服務', '轉介戒酒資源', '戒除檳榔', '提供成癮治療或相關專業轉介', '減少空污、二手菸及室內污染暴露']),
];

export function buildAssignedPrescription(goals: string[]): Record<string, DoctorPrescriptionSection> {
  const result: Record<string, DoctorPrescriptionSection> = {};
  [...new Set(goals.map(normalizePillarKey))].forEach((pillarKey) => {
    const items = PRESCRIPTION_CATALOG.filter((item) => item.pillarKey === pillarKey);
    if (!items.length) return;
    const basics = items.filter((item) => item.level === 'basic');
    const enhanced = items.filter((item) => item.level === 'enhanced');
    const selectedEnhanced = [...enhanced].sort(() => Math.random() - 0.5).slice(0, Math.min(2, enhanced.length));
    if (pillarKey === '運動習慣') {
      const frequencies = ['每週1至2天', '每週3至4天', '每週5至6天', '每天'];
      const durations = ['每次10至20分鐘', '每次20至30分鐘', '每次30至60分鐘'];
      selectedEnhanced.forEach((item, index) => {
        selectedEnhanced[index] = { ...item, title: `${item.title}，${frequencies[Math.floor(Math.random() * frequencies.length)]}，${durations[Math.floor(Math.random() * durations.length)]}` };
      });
    }
    const selected = [...basics, ...selectedEnhanced];
    result[pillarKey] = { id: `section-${pillarKey}`, pillarKey, categoryTitle: items[0].category, items: selected.map((item) => ({ ...item, completed: false })) };
  });
  return result;
}

export function getDoctorPrescriptionSection(key: string, data: Record<string, DoctorPrescriptionSection> = {}): DoctorPrescriptionSection | undefined {
  if (data[key]) return data[key];
  return data[normalizePillarKey(key)];
}

export const INITIAL_DOCTOR_PRESCRIPTIONS: Record<string, DoctorPrescriptionSection> = {};
