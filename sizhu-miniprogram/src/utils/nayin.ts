/**
 * 纳音五行计算工具
 */

// 天干
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 纳音表 - 六十甲子纳音
const NAYIN_TABLE = [
  '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木', '路旁土', '路旁土', '剑锋金', '剑锋金',
  '山头火', '山头火', '涧下水', '涧下水', '城头土', '城头土', '白蜡金', '白蜡金', '杨柳木', '杨柳木',
  '泉中水', '泉中水', '屋上土', '屋上土', '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
  '沙中金', '沙中金', '山下火', '山下火', '平地木', '平地木', '壁上土', '壁上土', '金箔金', '金箔金',
  '覆灯火', '覆灯火', '天河水', '天河水', '大驿土', '大驿土', '钗钏金', '钗钏金', '桑柘木', '桑柘木',
  '大溪水', '大溪水', '沙中土', '沙中土', '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水'
];

/**
 * 根据天干地支获取纳音
 */
export function getNayin(tian: string, di: string): string {
  const tianIndex = TIANGAN.indexOf(tian);
  const diIndex = DIZHI.indexOf(di);
  
  if (tianIndex === -1 || diIndex === -1) {
    return '未知';
  }
  
  // 计算六十甲子的序号
  const ganZhiIndex = (tianIndex * 6 + diIndex) % 60;
  
  return NAYIN_TABLE[ganZhiIndex] || '未知';
}

/**
 * 根据天干地支组合直接获取纳音
 * 使用传统的纳音计算方法
 */
export function getNayinByGanZhi(ganZhi: string): string {
  if (ganZhi.length !== 2) {
    return '未知';
  }
  
  const tian = ganZhi.charAt(0);
  const di = ganZhi.charAt(1);
  
  return getNayin(tian, di);
}

/**
 * 获取纳音的五行属性
 */
export function getNayinWuxing(nayin: string): string {
  if (nayin.includes('金')) return '金';
  if (nayin.includes('木')) return '木';
  if (nayin.includes('水')) return '水';
  if (nayin.includes('火')) return '火';
  if (nayin.includes('土')) return '土';
  return '未知';
}

/**
 * 获取完整的纳音信息
 */
export interface NayinInfo {
  nayin: string;
  wuxing: string;
}

export function getNayinInfo(tian: string, di: string): NayinInfo {
  const nayin = getNayin(tian, di);
  const wuxing = getNayinWuxing(nayin);
  
  return {
    nayin,
    wuxing
  };
}
