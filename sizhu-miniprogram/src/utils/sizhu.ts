import { getNayin } from './nayin';
import { calculateSizhuShengwang } from './shengwang';

// 天干
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 时辰对应表
export const SHICHEN_MAP: { [key: number]: number } = {
  23: 0, 0: 0, 1: 0,    // 子时 23:00-01:00
  1: 1, 2: 1, 3: 1,     // 丑时 01:00-03:00
  3: 2, 4: 2, 5: 2,     // 寅时 03:00-05:00
  5: 3, 6: 3, 7: 3,     // 卯时 05:00-07:00
  7: 4, 8: 4, 9: 4,     // 辰时 07:00-09:00
  9: 5, 10: 5, 11: 5,   // 巳时 09:00-11:00
  11: 6, 12: 6, 13: 6,  // 午时 11:00-13:00
  13: 7, 14: 7, 15: 7,  // 未时 13:00-15:00
  15: 8, 16: 8, 17: 8,  // 申时 15:00-17:00
  17: 9, 18: 9, 19: 9,  // 酉时 17:00-19:00
  19: 10, 20: 10, 21: 10, // 戌时 19:00-21:00
  21: 11, 22: 11        // 亥时 21:00-23:00
};

// 月份地支对应表（农历）
export const MONTH_DIZHI = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 对应农历1-12月

export interface SizhuResult {
  year: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' };
  month: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' };
  day: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' };
  hour: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' };
  lunarInfo?: {
    year: number;
    month: number;
    day: number;
    isLeap: boolean;
    monthName: string;
    originalDate?: string;
  };
  jieqiInfo?: {
    previousJieqi: string;
    nextJieqi: string;
  };
}

/**
 * 计算某年的天干地支
 */
export function getYearGanZhi(year: number): { tian: string; di: string } {
  // 以1984年甲子年为基准
  const baseYear = 1984;
  const yearDiff = year - baseYear;
  
  const tianIndex = (yearDiff % 10 + 10) % 10;
  const diIndex = (yearDiff % 12 + 12) % 12;
  
  return {
    tian: TIANGAN[tianIndex],
    di: DIZHI[diIndex]
  };
}

/**
 * 计算某月的天干地支
 */
export function getMonthGanZhi(year: number, month: number): { tian: string; di: string } {
  // 月支固定，月干根据年干推算
  const diIndex = MONTH_DIZHI[month - 1];
  
  // 年干推月干的公式：甲己之年丙作首
  const yearTianIndex = getYearGanZhi(year).tian;
  const yearTianNum = TIANGAN.indexOf(yearTianIndex);
  
  let monthTianStart: number;
  switch (yearTianNum) {
    case 0: case 5: // 甲、己年
      monthTianStart = 2; // 丙
      break;
    case 1: case 6: // 乙、庚年
      monthTianStart = 4; // 戊
      break;
    case 2: case 7: // 丙、辛年
      monthTianStart = 6; // 庚
      break;
    case 3: case 8: // 丁、壬年
      monthTianStart = 8; // 壬
      break;
    case 4: case 9: // 戊、癸年
      monthTianStart = 0; // 甲
      break;
    default:
      monthTianStart = 0;
  }
  
  const tianIndex = (monthTianStart + month - 1) % 10;
  
  return {
    tian: TIANGAN[tianIndex],
    di: DIZHI[diIndex]
  };
}

/**
 * 计算某日的天干地支
 */
export function getDayGanZhi(date: Date): { tian: string; di: string } {
  // 以1900年1月1日为基准日（庚子日）
  const baseDate = new Date(1900, 0, 1);
  const daysDiff = Math.floor((date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
  
  // 1900年1月1日是庚子日，庚=6，子=0
  const tianIndex = (6 + daysDiff) % 10;
  const diIndex = (0 + daysDiff) % 12;
  
  return {
    tian: TIANGAN[(tianIndex + 10) % 10],
    di: DIZHI[(diIndex + 12) % 12]
  };
}

/**
 * 计算某时的天干地支
 */
export function getHourGanZhi(date: Date): { tian: string; di: string } {
  const hour = date.getHours();
  
  // 确定时支
  let diIndex = 0;
  for (let h = 0; h <= 23; h++) {
    if (SHICHEN_MAP[h] !== undefined && h <= hour) {
      diIndex = SHICHEN_MAP[h];
    }
  }
  
  // 时干根据日干推算：甲己还加甲
  const dayTian = getDayGanZhi(date).tian;
  const dayTianIndex = TIANGAN.indexOf(dayTian);
  
  let hourTianStart: number;
  switch (dayTianIndex) {
    case 0: case 5: // 甲、己日
      hourTianStart = 0; // 甲
      break;
    case 1: case 6: // 乙、庚日
      hourTianStart = 2; // 丙
      break;
    case 2: case 7: // 丙、辛日
      hourTianStart = 4; // 戊
      break;
    case 3: case 8: // 丁、壬日
      hourTianStart = 6; // 庚
      break;
    case 4: case 9: // 戊、癸日
      hourTianStart = 8; // 壬
      break;
    default:
      hourTianStart = 0;
  }
  
  const tianIndex = (hourTianStart + diIndex) % 10;
  
  return {
    tian: TIANGAN[tianIndex],
    di: DIZHI[diIndex]
  };
}

/**
 * 计算四柱（使用农历库的天干地支）
 */
export function calculateSizhuWithLunar(yearGanZhi: string, monthGanZhi: string, dayGanZhi: string, hourGanZhi: string, lunarInfo?: any): SizhuResult {
  // 解析天干地支字符串
  const parseGanZhi = (ganZhi: string) => {
    const tian = ganZhi.charAt(0);
    const di = ganZhi.charAt(1);
    const nayin = getNayin(tian, di);
    return { tian, di, nayin };
  };

  const yearParsed = parseGanZhi(yearGanZhi);
  const monthParsed = parseGanZhi(monthGanZhi);
  const dayParsed = parseGanZhi(dayGanZhi);
  const hourParsed = parseGanZhi(hourGanZhi);

  // 计算生旺状态（以月支为准）
  const shengwangStates = calculateSizhuShengwang(
    yearParsed.tian,
    monthParsed.tian,
    dayParsed.tian,
    hourParsed.tian,
    monthParsed.di
  );

  return {
    year: {
      ...yearParsed,
      shengwang: shengwangStates.year.state,
      shengwangLevel: shengwangStates.year.level
    },
    month: {
      ...monthParsed,
      shengwang: shengwangStates.month.state,
      shengwangLevel: shengwangStates.month.level
    },
    day: {
      ...dayParsed,
      shengwang: shengwangStates.day.state,
      shengwangLevel: shengwangStates.day.level
    },
    hour: {
      ...hourParsed,
      shengwang: shengwangStates.hour.state,
      shengwangLevel: shengwangStates.hour.level
    },
    lunarInfo
  };
}

/**
 * 计算四柱（基于公历日期，内部转换为农历）
 */
export function calculateSizhu(date: Date): SizhuResult {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript月份从0开始

  const yearGanZhi = getYearGanZhi(year);
  const monthGanZhi = getMonthGanZhi(year, month);
  const dayGanZhi = getDayGanZhi(date);
  const hourGanZhi = getHourGanZhi(date);

  // 计算生旺状态（以月支为准）
  const shengwangStates = calculateSizhuShengwang(
    yearGanZhi.tian,
    monthGanZhi.tian,
    dayGanZhi.tian,
    hourGanZhi.tian,
    monthGanZhi.di
  );

  return {
    year: {
      ...yearGanZhi,
      nayin: getNayin(yearGanZhi.tian, yearGanZhi.di),
      shengwang: shengwangStates.year.state,
      shengwangLevel: shengwangStates.year.level
    },
    month: {
      ...monthGanZhi,
      nayin: getNayin(monthGanZhi.tian, monthGanZhi.di),
      shengwang: shengwangStates.month.state,
      shengwangLevel: shengwangStates.month.level
    },
    day: {
      ...dayGanZhi,
      nayin: getNayin(dayGanZhi.tian, dayGanZhi.di),
      shengwang: shengwangStates.day.state,
      shengwangLevel: shengwangStates.day.level
    },
    hour: {
      ...hourGanZhi,
      nayin: getNayin(hourGanZhi.tian, hourGanZhi.di),
      shengwang: shengwangStates.hour.state,
      shengwangLevel: shengwangStates.hour.level
    }
  };
}
