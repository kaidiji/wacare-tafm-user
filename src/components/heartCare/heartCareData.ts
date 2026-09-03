export interface HeartSymptomOption {
  id: string;
  name: string;
  severity: 'yellow' | 'red';
  guidelineNote: string;
  educationText: string;
  emergencyWarning: string;
  actionAdvice: string;
  options?: string[];
  hasPillowCount?: boolean;
  hasNightWakeDetails?: boolean;
  hasEdemaDetails?: boolean;
  hasCoughTypeDetails?: boolean;
}

export interface ReportedSymptom {
  id: string;
  name: string;
  severity: 'yellow' | 'red';
  hours: number;
  minutes: number;
  educationText: string;
  emergencyWarning: string;
  reportTime: string;
  guidelineNote?: string;
  selectedOption?: string;
  pillowCount?: number;
  nightWakeTime?: string;
  nightWakeCount?: number;
  edemaSide?: string;
  edemaPitting?: boolean;
  coughType?: string;
  details?: string[];
}

export interface VitalsData {
  sysBP: number;            // SBP 收縮壓 (mmHg)
  diaBP: number;            // DBP 舒張壓 (mmHg)
  heartRate: number;        // HR 心率 (次/分)
  spO2: number;             // SpO2 血氧 (%)
  respRate: number;         // RR 呼吸頻率 (次/分)
  bodyTemp: number;         // BT 體溫 (°C)
  weight: number;           // 體重 (kg)
  weightChange2Days: number;// 2天體重變化 (kg)
  ecgStatus: string;        // 心電圖判讀狀況
}

export interface VitalStatus {
  key: string;
  name: string;
  valueDisplay: string;
  level: 'normal' | 'yellow' | 'red';
  educationText: string;
  emergencyWarning: string;
}

export interface HeartCareState {
  vitals: VitalsData;
  reportedSymptoms: ReportedSymptom[];
  lastReportTime?: string;
  feelingsText?: string;
  otherNote?: string;
}

// 7 生理數據門檻評估函數
export const evaluateVitalSigns = (vitals: VitalsData): VitalStatus[] => {
  const list: VitalStatus[] = [];

  // 1. 血壓 SBP / DBP
  let bpLevel: 'normal' | 'yellow' | 'red' = 'normal';
  if (vitals.sysBP < 90 || vitals.sysBP >= 180 || vitals.diaBP >= 110) {
    bpLevel = 'red';
  } else if ((vitals.sysBP >= 90 && vitals.sysBP <= 99) || (vitals.sysBP >= 140 && vitals.sysBP <= 159) || (vitals.diaBP >= 90 && vitals.diaBP <= 99)) {
    bpLevel = 'yellow';
  }
  list.push({
    key: 'bp',
    name: '血壓 (SBP / DBP)',
    valueDisplay: `${vitals.sysBP} / ${vitals.diaBP} mmHg`,
    level: bpLevel,
    educationText: '請先休息 5 ~ 10 分鐘後重新量測一次；若數值仍異常，請先回報系統；若有不適請減少活動並持續觀察。',
    emergencyWarning: '若同時合併頭暈、胸悶、胸痛、明顯喘、意識不清、快昏倒、神智改變，請就近就醫。',
  });

  // 2. 血氧 SpO2
  let spO2Level: 'normal' | 'yellow' | 'red' = 'normal';
  if (vitals.spO2 < 90) {
    spO2Level = 'red';
  } else if (vitals.spO2 >= 92 && vitals.spO2 <= 94) {
    spO2Level = 'yellow';
  }
  list.push({
    key: 'spO2',
    name: '血氧 (SpO₂)',
    valueDisplay: `${vitals.spO2}%`,
    level: spO2Level,
    educationText: '請先坐下休息、保持呼吸順暢後重新量測；若數值仍偏低，請先回報系統。',
    emergencyWarning: '若同時出現休息時喘、說話困難、嘴唇發紫、胸痛、意識不清，請立即就近就醫。',
  });

  // 3. 心率 HR
  let hrLevel: 'normal' | 'yellow' | 'red' = 'normal';
  if (vitals.heartRate > 120 || vitals.heartRate < 40) {
    hrLevel = 'red';
  } else if ((vitals.heartRate >= 101 && vitals.heartRate <= 120) || (vitals.heartRate >= 40 && vitals.heartRate <= 49)) {
    hrLevel = 'yellow';
  }
  list.push({
    key: 'hr',
    name: '心率 (HR)',
    valueDisplay: `${vitals.heartRate} 次/分`,
    level: hrLevel,
    educationText: '請安靜休息後再量一次；若心跳仍過快、過慢或不規則，請先回報系統。',
    emergencyWarning: '若同時合併胸悶、胸痛、頭暈、快昏倒、喘、冒冷汗，請就近就醫。',
  });

  // 4. 呼吸頻率 RR
  let rrLevel: 'normal' | 'yellow' | 'red' = 'normal';
  if (vitals.respRate > 24 || vitals.respRate < 10) {
    rrLevel = 'red';
  } else if (vitals.respRate >= 21 && vitals.respRate <= 24) {
    rrLevel = 'yellow';
  }
  list.push({
    key: 'rr',
    name: '呼吸頻率 (RR)',
    valueDisplay: `${vitals.respRate} 次/分`,
    level: rrLevel,
    educationText: '請先坐起休息，避免平躺，觀察呼吸是否持續急促；若仍異常，請先回報系統。',
    emergencyWarning: '若同時出現休息時喘、胸痛、無法完整說話、嘴唇發紫、意識變差，請立即就近就醫。',
  });

  // 5. 體溫 BT
  let btLevel: 'normal' | 'yellow' | 'red' = 'normal';
  if (vitals.bodyTemp >= 38.0 || vitals.bodyTemp < 35.0) {
    btLevel = 'red';
  } else if (vitals.bodyTemp >= 37.6 && vitals.bodyTemp <= 37.9) {
    btLevel = 'yellow';
  }
  list.push({
    key: 'bt',
    name: '體溫 (BT)',
    valueDisplay: `${vitals.bodyTemp} °C`,
    level: btLevel,
    educationText: '若體溫異常，請注意休息、補充水分並觀察症狀；若仍異常，請先回報系統。',
    emergencyWarning: '若同時出現喘加劇、精神變差、食慾明顯下降、血壓偏低、心跳很快或明顯虛弱，請就近就醫。',
  });

  // 6. 體重 Weight
  let weightLevel: 'normal' | 'yellow' | 'red' = 'normal';
  if (vitals.weightChange2Days >= 1.5) {
    weightLevel = 'red';
  } else if (vitals.weightChange2Days >= 1.0) {
    weightLevel = 'yellow';
  }
  list.push({
    key: 'weight',
    name: '體重 (Weight 2天變化)',
    valueDisplay: `${vitals.weight} kg (2天增加 +${vitals.weightChange2Days} kg)`,
    level: weightLevel,
    educationText: '請每日固定時間量體重，建議早晨起床後、排尿後、早餐前、穿著相近衣物量測；若短期快速上升，請先回報系統。',
    emergencyWarning: '若體重短期上升同時合併喘加重、下肢水腫、腹脹、夜間喘醒、平躺喘，請儘快就近就醫。',
  });

  // 7. 心電圖 ECG
  let ecgLevel: 'normal' | 'yellow' | 'red' = 'normal';
  if (vitals.ecgStatus.includes('RVR') || vitals.ecgStatus.includes('VT') || vitals.ecgStatus.includes('ST-T')) {
    ecgLevel = 'red';
  } else if (vitals.ecgStatus.includes('疑似') || vitals.ecgStatus.includes('不規則') || vitals.ecgStatus.includes('期外收縮')) {
    ecgLevel = 'yellow';
  }
  list.push({
    key: 'ecg',
    name: '心電圖 (ECG)',
    valueDisplay: vitals.ecgStatus,
    level: ecgLevel,
    educationText: '若裝置提示異常，請先保持安靜並重新量測；若仍顯示異常，請先回報系統。',
    emergencyWarning: '若同時合併胸痛、胸悶、頭暈、快昏倒、喘、冒冷汗，請立即就近就醫。',
  });

  return list;
};

export const UNIFIED_EMERGENCY_NOTICE = `1. 本系統僅提供警示提醒、訊息推播與回報功能，不具備主動通報 119、代為叫救護車或自動安排就醫之功能。
2. 若病人同時出現下列任一情形，請勿僅在家觀察，應立即自行就近就醫；必要時由本人或家屬自行撥打 119：
   • 胸痛或胸悶，合併喘、冒冷汗、噁心、頭暈、手臂／下巴／上背不適。
   • 休息時喘、平躺喘、夜間喘醒，合併血氧下降、說話困難、嘴唇發紫。
   • 心悸或心跳很快／很慢，合併頭暈、快昏倒、胸悶、胸痛、喘。
   • 體重短期快速上升，合併下肢水腫、腹脹、喘加重、夜間喘醒。
   • 意識不清、無法完整說話、快昏倒、昏倒、明顯虛弱。
以上情形可能代表心衰惡化、心律不整、急性冠心症或其他急症。`;

export const MANDATORY_HEART_SYMPTOMS: HeartSymptomOption[] = [
  {
    id: 'symptom_1_dyspnea',
    name: '喘',
    severity: 'yellow',
    guidelineNote: '指引: 建議保留嚴重度與持續時間欄位。',
    educationText: '請先停止活動、坐起休息並觀察；若比平常更喘，請先回報系統。',
    emergencyWarning: '若喘明顯加重，或同時出現胸痛、嘴唇發紫、說話困難、冒冷汗，請就近就醫。',
    actionAdvice: '請先停止活動、坐起休息並觀察；若比平常更喘，請先回報系統。',
    options: ['新出現或較平常加重', '合併休息喘、平躺喘、夜間喘醒時升級'],
  },
  {
    id: 'symptom_2_exertional_dyspnea',
    name: '活動後喘',
    severity: 'yellow',
    guidelineNote: '指引: 應記錄開始時間、持續時間、嚴重度。',
    educationText: '請暫時避免勉強活動，記錄在何種活動下出現；若較平常更容易喘，請先回報系統。',
    emergencyWarning: '若已進展到輕微活動就喘，或合併胸悶、胸痛、頭暈，請儘快就近就醫評估。',
    actionAdvice: '請暫時避免勉強活動，記錄在何種活動下出現；若較平常更容易喘，請先回報系統。',
    options: ['新出現或較平常加重', '輕微活動即喘，或較前明顯惡化'],
  },
  {
    id: 'symptom_3_resting_dyspnea',
    name: '休息時喘',
    severity: 'red',
    guidelineNote: '指引: 屬高風險症狀。',
    educationText: '休息時也會喘屬高風險警訊；請立即停止活動、坐起休息，並先回報系統。',
    emergencyWarning: '若合併胸痛、說話困難、意識不清、發紫，請立即就近就醫。',
    actionAdvice: '休息時也會喘屬高風險警訊；請立即停止活動、坐起休息，並先回報系統。',
  },
  {
    id: 'symptom_4_orthopnea',
    name: '平躺喘',
    severity: 'red',
    guidelineNote: '指引: 建議加「需墊幾顆枕頭」欄位。',
    educationText: '若一平躺就喘，請先墊高枕頭或坐起，並先回報系統。',
    emergencyWarning: '若近期新出現或明顯加重，尤其同時合併夜間喘醒、下肢水腫、體重上升，請儘快就近就醫。',
    actionAdvice: '若一平躺就喘，請先墊高枕頭或坐起，並先回報系統。',
    hasPillowCount: true,
  },
  {
    id: 'symptom_5_pnd',
    name: '夜間喘醒',
    severity: 'red',
    guidelineNote: '指引: 屬心衰鬱血重要症狀。',
    educationText: '若半夜因喘醒，請記錄發生時間與次數，並先回報系統。',
    emergencyWarning: '若反覆發生，或同時有平躺喘、體重增加、水腫、咳嗽加劇，請儘快就近就醫。',
    actionAdvice: '若半夜因喘醒，請記錄發生時間與次數，並先回報系統。',
    hasNightWakeDetails: true,
  },
  {
    id: 'symptom_6_chest_tightness',
    name: '胸悶',
    severity: 'yellow',
    guidelineNote: '指引: 建議與胸痛分開記錄。',
    educationText: '若胸悶新出現或變頻繁，請先休息並觀察，並先回報系統。',
    emergencyWarning: '若胸悶持續不退，或同時合併喘、胸痛、冒冷汗、頭暈、噁心，請立即就近就醫。',
    actionAdvice: '若胸悶新出現或變頻繁，請先休息並觀察，並先回報系統。',
    options: ['新出現或變頻繁', '持續性或合併喘、冒冷汗'],
  },
  {
    id: 'symptom_7_chest_pain',
    name: '胸痛',
    severity: 'red',
    guidelineNote: '指引: 紅燈應優先處理。',
    educationText: '胸痛不可輕忽；即使短暫也應先回報系統並避免活動。',
    emergencyWarning: '若胸痛持續、加劇、反覆，或同時合併喘、冒冷汗、噁心、頭暈、上背/下巴/手臂不適，請立即就近就醫。',
    actionAdvice: '胸痛不可輕忽；即使短暫也應先回報系統並避免活動。',
    options: ['輕微、短暫、可自行緩解', '明顯、持續、反覆或合併不適'],
  },
  {
    id: 'symptom_8_palpitations',
    name: '心悸',
    severity: 'yellow',
    guidelineNote: '指引: 可與 ECG 異常聯動。',
    educationText: '請先休息並記錄發作時間與持續多久；若反覆發生，請先回報系統。',
    emergencyWarning: '若同時出現頭暈、胸悶、胸痛、快昏倒、喘，請立即就近就醫。',
    actionAdvice: '請先休息並記錄發作時間與持續多久；若反覆發生，請先回報系統。',
    options: ['新出現或較平常頻繁', '合併頭暈、胸悶、血壓低'],
  },
  {
    id: 'symptom_9_edema',
    name: '下肢水腫',
    severity: 'yellow',
    guidelineNote: '指引: 建議加「單側/雙側、壓痕性」欄位。',
    educationText: '請注意鞋襪是否變緊、腳踝是否腫脹；若加重，請先回報系統。',
    emergencyWarning: '若水腫快速加重，且同時合併體重短期上升、喘加重、腹脹、夜間喘醒，請儘快就近就醫。',
    actionAdvice: '請注意鞋襪是否變緊、腳踝是否腫脹；若加重，請先回報系統。',
    options: ['新出現或較平常加重', '快速加重或合併體重上升、喘'],
    hasEdemaDetails: true,
  },
  {
    id: 'symptom_10_abdominal_distension',
    name: '腹脹',
    severity: 'yellow',
    guidelineNote: '指引: 可作為右心衰或鬱血線索。',
    educationText: '若腹脹持續、胃口變差，請先回報系統。',
    emergencyWarning: '若同時出現體重上升、下肢水腫、喘加重、食慾明顯下降，請儘快就近就醫。',
    actionAdvice: '若腹脹持續、胃口變差，請先回報系統。',
    options: ['新出現或加重', '合併食慾差、體重上升、喘惡化'],
  },
  {
    id: 'symptom_11_cough',
    name: '咳嗽',
    severity: 'yellow',
    guidelineNote: '指引: 建議記錄乾咳/有痰。',
    educationText: '請記錄乾咳或有痰、日夜情形；若明顯加重，請先回報系統。',
    emergencyWarning: '若咳嗽合併休息時喘、夜間喘醒、血氧下降、胸痛，請就近就醫。',
    actionAdvice: '請記錄乾咳或有痰、日夜情形；若明顯加重，請先回報系統。',
    options: ['新出現或加重', '合併休息喘、夜間喘醒'],
    hasCoughTypeDetails: true,
  },
  {
    id: 'symptom_12_fatigue',
    name: '疲倦／無力',
    severity: 'yellow',
    guidelineNote: '指引: 單獨特異性較低，但仍有追蹤價值。',
    educationText: '若近期明顯比平常疲倦，請同時注意體重、食慾、血壓與喘，並先回報系統。',
    emergencyWarning: '若同時出現低血壓、頭暈、喘加重、胸悶、精神變差，請儘快就近就醫。',
    actionAdvice: '若近期明顯比平常疲倦，請同時注意體重、食慾、血壓與喘，並先回報系統。',
    options: ['新出現或較平常明顯', '合併低血壓、喘、頭暈'],
  },
  {
    id: 'symptom_13_dizziness',
    name: '頭暈',
    severity: 'red',
    guidelineNote: '指引: 紅燈應優先處理。',
    educationText: '請先坐下或躺下避免跌倒；若反覆發生，請先回報系統。',
    emergencyWarning: '若快昏倒、反覆發作，或同時合併心悸、胸悶、胸痛、血壓過低、喘，請立即就近就醫。',
    actionAdvice: '請先坐下或躺下避免跌倒；若反覆發生，請先回報系統。',
    options: ['偶發、短暫', '反覆、近昏厥、合併低血壓或心悸'],
  },
  {
    id: 'symptom_14_appetite_loss',
    name: '食慾下降',
    severity: 'yellow',
    guidelineNote: '指引: 可反映鬱血或整體狀態惡化。',
    educationText: '若連續數天食慾差，請注意體重、腹脹與精神狀況，並先回報系統。',
    emergencyWarning: '若同時合併腹脹、體重增加、水腫、喘、精神變差，請儘快就近就醫。',
    actionAdvice: '若連續數天食慾差，請注意體重、腹脹與精神狀況，並先回報系統。',
    options: ['有', '合併腹脹、體重變化、倦怠時升級'],
  },
  {
    id: 'symptom_15_short_term_weight_gain',
    name: '體重短期增加',
    severity: 'red',
    guidelineNote: '指引: 建議系統自動計算。',
    educationText: '短期體重上升可能代表體液滯留，請持續每日量體重並注意是否合併水腫、喘、腹脹；並先回報系統。',
    emergencyWarning: '若快速上升同時合併下肢水腫、腹脹、喘加重、夜間喘醒、平躺喘，請儘快就近就醫。',
    actionAdvice: '短期體重上升可能代表體液滯留，請持續每日量體重並注意是否合併水腫、喘、腹脹；並先回報系統。',
    options: ['2 天增加 1 ~ 1.5 kg', '2 天增加 ≥1.5 ~ 2 kg，或 3 天 >2 kg'],
  },
];

export const INITIAL_HEART_CARE_STATE: HeartCareState = {
  vitals: {
    sysBP: 135,
    diaBP: 85,
    heartRate: 72,
    spO2: 96,
    respRate: 16,
    bodyTemp: 36.8,
    weight: 65.5,
    weightChange2Days: 1.8,
    ecgStatus: '正常竇性心律，節律規則',
  },
  reportedSymptoms: [],
};
