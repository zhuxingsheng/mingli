/**
 * 神煞计算工具
 * 计算驿马、羊刃、禄、天乙贵人等神煞
 */

// 地支
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 驿马查询表
 * 以年支或日支为准，查其他地支是否为驿马
 * 寅午戌见申，申子辰见寅，亥卯未见巳，巳酉丑见亥
 */
const YIMA_TABLE: { [key: string]: string } = {
  '寅': '申', '午': '申', '戌': '申',
  '申': '寅', '子': '寅', '辰': '寅',
  '亥': '巳', '卯': '巳', '未': '巳',
  '巳': '亥', '酉': '亥', '丑': '亥'
};

/**
 * 羊刃查询表（以日干为准）
 * 甲刃在卯，乙刃在辰，丙戊刃在午，丁己刃在未，庚刃在酉，辛刃在戌，壬刃在子，癸刃在丑
 */
const YANGREN_TABLE: { [key: string]: string } = {
  '甲': '卯',
  '乙': '辰',
  '丙': '午',
  '丁': '未',
  '戊': '午',
  '己': '未',
  '庚': '酉',
  '辛': '戌',
  '壬': '子',
  '癸': '丑'
};

/**
 * 禄查询表（以日干为准）
 * 甲禄在寅，乙禄在卯，丙戊禄在巳，丁己禄在午，庚禄在申，辛禄在酉，壬禄在亥，癸禄在子
 */
const LU_TABLE: { [key: string]: string } = {
  '甲': '寅',
  '乙': '卯',
  '丙': '巳',
  '丁': '午',
  '戊': '巳',
  '己': '午',
  '庚': '申',
  '辛': '酉',
  '壬': '亥',
  '癸': '子'
};

/**
 * 天乙贵人查询表（以日干为准）
 * 甲戊庚牛羊（丑未），乙己鼠猴乡（子申），丙丁猪鸡位（亥酉），壬癸兔蛇藏（卯巳），六辛逢马虎（午寅）
 */
const TIANYI_TABLE: { [key: string]: string[] } = {
  '甲': ['丑', '未'],
  '戊': ['丑', '未'],
  '庚': ['丑', '未'],
  '乙': ['子', '申'],
  '己': ['子', '申'],
  '丙': ['亥', '酉'],
  '丁': ['亥', '酉'],
  '壬': ['卯', '巳'],
  '癸': ['卯', '巳'],
  '辛': ['午', '寅']
};

/**
 * 检查地支是否为驿马
 */
export function isYima(baseDizhi: string, targetDizhi: string): boolean {
  return YIMA_TABLE[baseDizhi] === targetDizhi;
}

/**
 * 检查地支是否为羊刃
 */
export function isYangren(dayTiangan: string, targetDizhi: string): boolean {
  return YANGREN_TABLE[dayTiangan] === targetDizhi;
}

/**
 * 检查地支是否为禄
 */
export function isLu(dayTiangan: string, targetDizhi: string): boolean {
  return LU_TABLE[dayTiangan] === targetDizhi;
}

/**
 * 检查地支是否为天乙贵人
 */
export function isTianyi(dayTiangan: string, targetDizhi: string): boolean {
  const guiren = TIANYI_TABLE[dayTiangan];
  return guiren ? guiren.includes(targetDizhi) : false;
}

/**
 * 获取地支的所有神煞
 */
export interface ShenshaResult {
  yima: boolean;      // 驿马
  yangren: boolean;   // 羊刃
  lu: boolean;        // 禄
  tianyi: boolean;    // 天乙贵人
  labels: string[];   // 神煞标签列表
}

export function getShenshaForDizhi(
  dayTiangan: string,    // 日干
  yearDizhi: string,     // 年支（用于驿马）
  targetDizhi: string    // 目标地支
): ShenshaResult {
  const yima = isYima(yearDizhi, targetDizhi);
  const yangren = isYangren(dayTiangan, targetDizhi);
  const lu = isLu(dayTiangan, targetDizhi);
  const tianyi = isTianyi(dayTiangan, targetDizhi);
  
  const labels: string[] = [];
  if (tianyi) labels.push('贵');
  if (lu) labels.push('禄');
  if (yima) labels.push('马');
  if (yangren) labels.push('刃');
  
  return { yima, yangren, lu, tianyi, labels };
}

/**
 * 获取神煞的CSS类名
 */
export function getShenshaClass(shensha: ShenshaResult): string {
  if (shensha.tianyi) return 'tianyi';
  if (shensha.lu) return 'lu';
  if (shensha.yima) return 'yima';
  if (shensha.yangren) return 'yangren';
  return '';
}

