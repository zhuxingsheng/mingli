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
// 数组索引对应地支顺序：子(0)、丑(1)、寅(2)、卯(3)、辰(4)、巳(5)、午(6)、未(7)、申(8)、酉(9)、戌(10)、亥(11)
// 数组值对应十二长生状态索引：长生(0)、沐浴(1)、冠带(2)、临官(3)、帝旺(4)、衰(5)、病(6)、死(7)、墓(8)、绝(9)、胎(10)、养(11)
const SHENGWANG_TABLE: { [key: string]: number[] } = {
  // 甲木长生在亥，顺行：亥→子→丑→寅→卯→辰→巳→午→未→申→酉→戌
  // 亥(长生)→子(沐浴)→丑(冠带)→寅(临官)→卯(帝旺)→辰(衰)→巳(病)→午(死)→未(墓)→申(绝)→酉(胎)→戌(养)
  '甲': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0],

  // 乙木长生在午，逆行：午→巳→辰→卯→寅→丑→子→亥→戌→酉→申→未
  // 午(长生)→巳(沐浴)→辰(冠带)→卯(临官)→寅(帝旺)→丑(衰)→子(病)→亥(死)→戌(墓)→酉(绝)→申(胎)→未(养)
  '乙': [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7],

  // 丙火长生在寅，顺行：寅→卯→辰→巳→午→未→申→酉→戌→亥→子→丑
  // 寅(长生)→卯(沐浴)→辰(冠带)→巳(临官)→午(帝旺)→未(衰)→申(病)→酉(死)→戌(墓)→亥(绝)→子(胎)→丑(养)
  '丙': [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],

  // 丁火长生在酉，逆行：酉→申→未→午→巳→辰→卯→寅→丑→子→亥→戌
  // 酉(长生)→申(沐浴)→未(冠带)→午(临官)→巳(帝旺)→辰(衰)→卯(病)→寅(死)→丑(墓)→子(绝)→亥(胎)→戌(养)
  '丁': [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10],

  // 戊土长生在寅，顺行（同丙火）
  '戊': [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],

  // 己土长生在酉，逆行（同丁火）
  '己': [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10],

  // 庚金长生在巳，顺行：巳→午→未→申→酉→戌→亥→子→丑→寅→卯→辰
  // 巳(长生)→午(沐浴)→未(冠带)→申(临官)→酉(帝旺)→戌(衰)→亥(病)→子(死)→丑(墓)→寅(绝)→卯(胎)→辰(养)
  '庚': [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6],

  // 辛金长生在子，逆行：子→亥→戌→酉→申→未→午→巳→辰→卯→寅→丑
  // 子(长生)→亥(沐浴)→戌(冠带)→酉(临官)→申(帝旺)→未(衰)→午(病)→巳(死)→辰(墓)→卯(绝)→寅(胎)→丑(养)
  '辛': [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],

  // 壬水长生在申，顺行：申→酉→戌→亥→子→丑→寅→卯→辰→巳→午→未
  // 申(长生)→酉(沐浴)→戌(冠带)→亥(临官)→子(帝旺)→丑(衰)→寅(病)→卯(死)→辰(墓)→巳(绝)→午(胎)→未(养)
  '壬': [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3],

  // 癸水长生在卯，逆行：卯→寅→丑→子→亥→戌→酉→申→未→午→巳→辰
  // 卯(长生)→寅(沐浴)→丑(冠带)→子(临官)→亥(帝旺)→戌(衰)→酉(病)→申(死)→未(墓)→午(绝)→巳(胎)→辰(养)
  '癸': [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4]
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
