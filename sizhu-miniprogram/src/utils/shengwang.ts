/**
 * 十二生旺状态计算工具
 * 计算天干在月支的生旺死绝状态
 */

// 天干
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 十二生旺状态
export const SHENGWANG_STATES = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'
];

// 天干十二生旺表
// 每个天干在十二地支中的生旺状态
const SHENGWANG_TABLE: { [key: string]: number[] } = {
  // 甲木长生在亥，顺行
  '甲': [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 亥子丑寅卯辰巳午未申酉戌
  // 乙木长生在午，逆行
  '乙': [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7], // 午巳辰卯寅丑子亥戌酉申未
  // 丙火长生在寅，顺行
  '丙': [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8], // 寅卯辰巳午未申酉戌亥子丑
  // 丁火长生在酉，逆行
  '丁': [2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3], // 酉申未午巳辰卯寅丑子亥戌
  // 戊土长生在寅，顺行
  '戊': [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8], // 寅卯辰巳午未申酉戌亥子丑
  // 己土长生在酉，逆行
  '己': [2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3], // 酉申未午巳辰卯寅丑子亥戌
  // 庚金长生在巳，顺行
  '庚': [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5], // 巳午未申酉戌亥子丑寅卯辰
  // 辛金长生在子，逆行
  '辛': [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0], // 子亥戌酉申未午巳辰卯寅丑
  // 壬水长生在申，顺行
  '壬': [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2], // 申酉戌亥子丑寅卯辰巳午未
  // 癸水长生在卯，逆行
  '癸': [8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10, 9]  // 卯寅丑子亥戌酉申未午巳辰
};

/**
 * 获取天干在地支的十二生旺状态
 */
export function getShengwangState(tiangan: string, dizhi: string): string {
  const tianganIndex = TIANGAN.indexOf(tiangan);
  const dizhiIndex = DIZHI.indexOf(dizhi);
  
  if (tianganIndex === -1 || dizhiIndex === -1) {
    return '未知';
  }
  
  const stateTable = SHENGWANG_TABLE[tiangan];
  if (!stateTable) {
    return '未知';
  }
  
  const stateIndex = stateTable[dizhiIndex];
  return SHENGWANG_STATES[stateIndex] || '未知';
}

/**
 * 获取天干在月支的生旺状态
 */
export function getTianganStateInMonth(tiangan: string, monthDizhi: string): string {
  return getShengwangState(tiangan, monthDizhi);
}

/**
 * 获取生旺状态的详细信息
 */
export interface ShengwangInfo {
  state: string;
  description: string;
  strength: number; // 强度等级 1-10
}

/**
 * 获取生旺状态的详细信息
 */
export function getShengwangInfo(state: string): ShengwangInfo {
  const descriptions: { [key: string]: { desc: string; strength: number } } = {
    '长生': { desc: '如人初生，充满生机', strength: 8 },
    '沐浴': { desc: '如人沐浴，易受外界影响', strength: 3 },
    '冠带': { desc: '如人成年，开始担当', strength: 6 },
    '临官': { desc: '如人壮年，能力强盛', strength: 9 },
    '帝旺': { desc: '如人鼎盛，达到巅峰', strength: 10 },
    '衰': { desc: '如人衰老，力量减弱', strength: 4 },
    '病': { desc: '如人患病，虚弱无力', strength: 2 },
    '死': { desc: '如人死亡，毫无生机', strength: 1 },
    '墓': { desc: '如人入墓，潜藏不显', strength: 3 },
    '绝': { desc: '如人断绝，生机全无', strength: 1 },
    '胎': { desc: '如人受胎，孕育新生', strength: 5 },
    '养': { desc: '如人养育，逐渐成长', strength: 7 }
  };
  
  const info = descriptions[state] || { desc: '状态未知', strength: 5 };
  
  return {
    state,
    description: info.desc,
    strength: info.strength
  };
}

/**
 * 判断生旺状态的吉凶
 */
export function getShengwangLevel(state: string): 'strong' | 'medium' | 'weak' {
  const strongStates = ['长生', '临官', '帝旺', '养'];
  const mediumStates = ['冠带', '胎', '衰'];
  const weakStates = ['沐浴', '病', '死', '墓', '绝'];
  
  if (strongStates.includes(state)) return 'strong';
  if (mediumStates.includes(state)) return 'medium';
  return 'weak';
}

/**
 * 获取四柱中所有天干在月支的生旺状态
 */
export interface SizhuShengwang {
  year: { state: string; level: 'strong' | 'medium' | 'weak' };
  month: { state: string; level: 'strong' | 'medium' | 'weak' };
  day: { state: string; level: 'strong' | 'medium' | 'weak' };
  hour: { state: string; level: 'strong' | 'medium' | 'weak' };
}

export function calculateSizhuShengwang(
  yearTian: string,
  monthTian: string,
  dayTian: string,
  hourTian: string,
  monthDi: string
): SizhuShengwang {
  const yearState = getTianganStateInMonth(yearTian, monthDi);
  const monthState = getTianganStateInMonth(monthTian, monthDi);
  const dayState = getTianganStateInMonth(dayTian, monthDi);
  const hourState = getTianganStateInMonth(hourTian, monthDi);
  
  return {
    year: { state: yearState, level: getShengwangLevel(yearState) },
    month: { state: monthState, level: getShengwangLevel(monthState) },
    day: { state: dayState, level: getShengwangLevel(dayState) },
    hour: { state: hourState, level: getShengwangLevel(hourState) }
  };
}
