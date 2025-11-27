/**
 * 太岁十二神计算工具
 * 根据年支（太岁）计算各地支对应的神煞
 */

// 地支
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 太岁十二神名称（按顺序排列）
export const TAISUI_SHENSHEN = [
  '太岁', '太阳', '丧门', '太阴', '官符', '死符', 
  '岁破', '龙德', '白虎', '福德', '吊客', '病符'
];

// 太岁十二神吉凶分类
export const SHENSHEN_JIXIONG: { [key: string]: 'ji' | 'xiong' } = {
  '太岁': 'xiong',
  '太阳': 'ji',
  '丧门': 'xiong',
  '太阴': 'ji',
  '官符': 'xiong',
  '死符': 'xiong',
  '岁破': 'xiong',
  '龙德': 'ji',
  '白虎': 'xiong',
  '福德': 'ji',
  '吊客': 'xiong',
  '病符': 'xiong'
};

// 太岁十二神简要说明
export const SHENSHEN_DESC: { [key: string]: string } = {
  '太岁': '犯太岁，诸事小心',
  '太阳': '贵人星，光明显达',
  '丧门': '主丧事孝服',
  '太阴': '女贵人暗助',
  '官符': '主官非口舌',
  '死符': '主病灾小耗',
  '岁破': '主破财大耗',
  '龙德': '逢凶化吉',
  '白虎': '主血光意外',
  '福德': '福气临门',
  '吊客': '主吊丧悲伤',
  '病符': '主疾病健康'
};

/**
 * 根据年支（太岁）和目标地支，计算对应的神煞
 * @param yearDizhi 年支（太岁）
 * @param targetDizhi 目标地支
 * @returns 神煞名称
 */
export function getTaisuiShensha(yearDizhi: string, targetDizhi: string): string {
  const yearIndex = DIZHI.indexOf(yearDizhi);
  const targetIndex = DIZHI.indexOf(targetDizhi);
  
  if (yearIndex === -1 || targetIndex === -1) {
    return '未知';
  }
  
  // 计算神煞索引：目标地支相对于年支的位置
  const shenshaIndex = (targetIndex - yearIndex + 12) % 12;
  return TAISUI_SHENSHEN[shenshaIndex];
}

/**
 * 获取神煞的吉凶
 */
export function getShenshaJixiong(shensha: string): 'ji' | 'xiong' {
  return SHENSHEN_JIXIONG[shensha] || 'xiong';
}

/**
 * 获取神煞的说明
 */
export function getShenshaDesc(shensha: string): string {
  return SHENSHEN_DESC[shensha] || '';
}

/**
 * 计算四柱和三宫的太岁十二神
 */
export interface TaisuiShenshaResult {
  shensha: string;
  jixiong: 'ji' | 'xiong';
  desc: string;
}

export function calculateTaisuiShensha(
  yearDizhi: string,
  targetDizhi: string
): TaisuiShenshaResult {
  const shensha = getTaisuiShensha(yearDizhi, targetDizhi);
  return {
    shensha,
    jixiong: getShenshaJixiong(shensha),
    desc: getShenshaDesc(shensha)
  };
}

/**
 * 批量计算多个地支的太岁十二神
 */
export function calculateAllTaisuiShensha(
  yearDizhi: string,
  dizhiList: (string | undefined)[]
): TaisuiShenshaResult[] {
  return dizhiList.map(dz => {
    if (!dz) {
      return { shensha: '-', jixiong: 'xiong' as const, desc: '' };
    }
    return calculateTaisuiShensha(yearDizhi, dz);
  });
}

