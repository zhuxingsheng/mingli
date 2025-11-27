// 天干
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 时辰对应表
export const SHICHEN_MAP = {
  23: 0, 0: 0,              // 子时 23:00-01:00  
  1: 1, 2: 1,               // 丑时 01:00-03:00
  3: 2, 4: 2, 5: 2,         // 寅时 03:00-05:00
  6: 3, 7: 3,               // 卯时 05:00-07:00
  8: 4, 9: 4,               // 辰时 07:00-09:00
  10: 5, 11: 5,             // 巳时 09:00-11:00
  12: 6, 13: 6,             // 午时 11:00-13:00
  14: 7, 15: 7,             // 未时 13:00-15:00
  16: 8, 17: 8,             // 申时 15:00-17:00
  18: 9, 19: 9,             // 酉时 17:00-19:00
  20: 10, 21: 10,           // 戌时 19:00-21:00
  22: 11                    // 亥时 21:00-23:00
};

// 计算年柱
function getYearPillar(year) {
  // 简化计算：以1984年甲子年为基准
  const baseYear = 1984;
  const offset = (year - baseYear) % 60;
  const tianganIndex = (offset + 0) % 10;
  const dizhiIndex = (offset + 0) % 12;
  
  return {
    tian: TIANGAN[tianganIndex < 0 ? tianganIndex + 10 : tianganIndex],
    di: DIZHI[dizhiIndex < 0 ? dizhiIndex + 12 : dizhiIndex]
  };
}

// 计算月柱
function getMonthPillar(year, month) {
  // 简化计算
  const yearTianganIndex = TIANGAN.indexOf(getYearPillar(year).tian);
  const monthTianganIndex = (yearTianganIndex * 2 + month - 1) % 10;
  const monthDizhiIndex = (month + 1) % 12;
  
  return {
    tian: TIANGAN[monthTianganIndex],
    di: DIZHI[monthDizhiIndex]
  };
}

// 计算日柱
function getDayPillar(year, month, day) {
  // 简化计算：使用公历日期计算
  const date = new Date(year, month - 1, day);
  const daysSince1900 = Math.floor((date.getTime() - new Date(1900, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
  const tianganIndex = (daysSince1900 + 10) % 10;
  const dizhiIndex = (daysSince1900 + 10) % 12;
  
  return {
    tian: TIANGAN[tianganIndex],
    di: DIZHI[dizhiIndex]
  };
}

// 计算时柱
function getHourPillar(hour, dayTiangan) {
  const shichenIndex = SHICHEN_MAP[hour] || 0;
  const dayTianganIndex = TIANGAN.indexOf(dayTiangan);
  const hourTianganIndex = (dayTianganIndex * 2 + shichenIndex) % 10;
  
  return {
    tian: TIANGAN[hourTianganIndex],
    di: DIZHI[shichenIndex]
  };
}

// 主要计算函数
export function calculateSizhu(year, month, day, hour, minute) {
  try {
    const yearPillar = getYearPillar(year);
    const monthPillar = getMonthPillar(year, month);
    const dayPillar = getDayPillar(year, month, day);
    const hourPillar = getHourPillar(hour, dayPillar.tian);
    
    return {
      year: yearPillar.tian + yearPillar.di,
      month: monthPillar.tian + monthPillar.di,
      day: dayPillar.tian + dayPillar.di,
      hour: hourPillar.tian + hourPillar.di,
      solarDate: `${year}年${month}月${day}日 ${hour}:${minute.toString().padStart(2, '0')}`,
      lunarDate: '公历计算'
    };
  } catch (error) {
    console.error('四柱计算错误:', error);
    return {
      year: '甲子',
      month: '乙丑',
      day: '丙寅',
      hour: '丁卯',
      solarDate: '计算错误',
      lunarDate: '计算错误'
    };
  }
}
