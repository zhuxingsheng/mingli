import { getNayin } from './nayin';
import { calculateSizhuShengwang, getShengwangState, getShengwangLevel } from './shengwang';
import Lunar from 'lunar-javascript';
import { getPreviousJieqi, getNextJieqi } from './jieqi';

// 天干
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 时辰对应表
export const SHICHEN_MAP: { [key: number]: number } = {
  23: 0, 0: 0,             // 子时 23:00-01:00
  1: 1, 2: 1,              // 丑时 01:00-03:00
  3: 2, 4: 2, 5: 2,        // 寅时 03:00-05:00
  6: 3, 7: 3,              // 卯时 05:00-07:00
  8: 4, 9: 4,              // 辰时 07:00-09:00
  10: 5, 11: 5,            // 巳时 09:00-11:00
  12: 6, 13: 6,            // 午时 11:00-13:00
  14: 7, 15: 7,            // 未时 13:00-15:00
  16: 8, 17: 8,            // 申时 15:00-17:00
  18: 9, 19: 9,            // 酉时 17:00-19:00
  20: 10, 21: 10,          // 戌时 19:00-21:00
  22: 11                   // 亥时 21:00-23:00
};

// 月份地支对应表（农历）
export const MONTH_DIZHI = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 对应农历1-12月

export interface SizhuResult {
  birthYear: number; // 出生年份（阳历）
  year: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' };
  month: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' };
  day: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' };
  hour: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' };
  minggong?: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' }; // 命宫
  shengong?: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' }; // 身宫
  taigong?: { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' }; // 胎宫
  dayun?: DayunInfo[]; // 大运
  liunian?: LiunianInfo[]; // 流年
  qiyunInfo?: QiyunInfo; // 起运信息
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
 * 大运信息
 */
export interface DayunInfo {
  age: number; // 起运年龄
  ganzhi: string; // 干支
  tian: string; // 天干
  di: string; // 地支
  startAge: number; // 开始年龄
  endAge: number; // 结束年龄
}

/**
 * 起运时间信息
 */
export interface QiyunInfo {
  years: number; // 年
  months: number; // 月
  days: number; // 日
  totalDays: number; // 总天数
  isShunxing: boolean; // 是否顺行
  description: string; // 描述文字
}

/**
 * 流年信息
 */
export interface LiunianInfo {
  year: number; // 年份
  age: number; // 虚岁
  ganzhi: string; // 干支
  tian: string; // 天干
  di: string; // 地支
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
    birthYear: new Date().getFullYear(),
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
 * 计算四柱（使用 lunar-javascript 库精确计算）
 */
export function calculateSizhu(date: Date, gender: 'male' | 'female' = 'male'): SizhuResult {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  // 使用 lunar-javascript 库计算八字
  const { Solar } = Lunar;
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 获取四柱干支
  const yearGanZhi = {
    tian: eightChar.getYearGan(),
    di: eightChar.getYearZhi()
  };
  const monthGanZhi = {
    tian: eightChar.getMonthGan(),
    di: eightChar.getMonthZhi()
  };
  const dayGanZhi = {
    tian: eightChar.getDayGan(),
    di: eightChar.getDayZhi()
  };
  const hourGanZhi = {
    tian: eightChar.getTimeGan(),
    di: eightChar.getTimeZhi()
  };

  // 获取地支索引
  const monthDizhiIndex = DIZHI.indexOf(monthGanZhi.di);
  const dayDizhiIndex = DIZHI.indexOf(dayGanZhi.di);
  const hourDizhiIndex = DIZHI.indexOf(hourGanZhi.di);

  // 计算生旺状态（以月支为准）
  const shengwangStates = calculateSizhuShengwang(
    yearGanZhi.tian,
    monthGanZhi.tian,
    dayGanZhi.tian,
    hourGanZhi.tian,
    monthGanZhi.di
  );

  // 计算起运信息
  const qiyunInfo = calculateQiyunInfo(date, gender, yearGanZhi.tian);

  // 计算大运
  const dayun = calculateDayun(date, gender, monthGanZhi, yearGanZhi.tian);

  // 计算流年（从当前年份开始，计算10年）
  const currentYear = new Date().getFullYear();
  const liunian = calculateLiunian(year, currentYear, 10);

  return {
    birthYear: year,
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
    },
    // 计算命宫、身宫、胎宫
    minggong: calculateMinggong(monthDizhiIndex, hourDizhiIndex, monthGanZhi.di),
    shengong: calculateShengong(monthDizhiIndex, hourDizhiIndex, monthGanZhi.di),
    taigong: calculateTaigong(monthDizhiIndex, dayDizhiIndex, monthGanZhi.di),
    // 大运和流年
    dayun,
    liunian,
    // 起运信息
    qiyunInfo
  };
}

/**
 * 根据地支索引获取符合60甲子规则的天干
 * 60甲子规则：阳干配阳支，阴干配阴支
 * 阳支(偶数索引): 子(0), 寅(2), 辰(4), 午(6), 申(8), 戌(10) -> 配阳干: 甲丙戊庚壬
 * 阴支(奇数索引): 丑(1), 卯(3), 巳(5), 未(7), 酉(9), 亥(11) -> 配阴干: 乙丁己辛癸
 */
function getTianganForDizhi(dizhiIndex: number): string {
  // 阳支配阳干，阴支配阴干
  // 使用甲子为起点的60甲子循环
  // 60甲子中，天干索引 = (地支索引 * 5) % 10，但需要确保阴阳匹配

  // 对于地支索引，根据60甲子表推算天干
  // 子(0)->甲(0), 丑(1)->乙(1), 寅(2)->丙(2), 卯(3)->丁(3), 辰(4)->戊(4), 巳(5)->己(5)
  // 午(6)->庚(6), 未(7)->辛(7), 申(8)->壬(8), 酉(9)->癸(9), 戌(10)->甲(0), 亥(11)->乙(1)
  // 这是第一轮甲子开始的对应关系

  const tianIndex = dizhiIndex % 10;
  return TIANGAN[tianIndex];
}

/**
 * 计算命宫
 * 命宫地支 = 14 - 月支 - 时支 (mod 12)
 * 命宫天干使用年干起月法推算
 */
function calculateMinggong(monthDizhi: number, hourDizhi: number, monthDi: string): { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' } {
  // 计算命宫地支
  let minggongDizhi = (14 - monthDizhi - hourDizhi) % 12;
  if (minggongDizhi < 0) minggongDizhi += 12;

  const minggongDi = DIZHI[minggongDizhi];
  const minggongTian = getTianganForDizhi(minggongDizhi);

  // 计算命宫天干在月支的十二长生状态
  const shengwangState = getShengwangState(minggongTian, monthDi);
  const shengwangLevel = getShengwangLevel(shengwangState);

  return {
    tian: minggongTian,
    di: minggongDi,
    nayin: getNayin(minggongTian, minggongDi),
    shengwang: shengwangState,
    shengwangLevel: shengwangLevel
  };
}

/**
 * 计算身宫
 * 身宫地支 = 月支 + 时支 (mod 12)
 */
function calculateShengong(monthDizhi: number, hourDizhi: number, monthDi: string): { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' } {
  const shengongDizhi = (monthDizhi + hourDizhi) % 12;
  const shengongDi = DIZHI[shengongDizhi];
  const shengongTian = getTianganForDizhi(shengongDizhi);

  // 计算身宫天干在月支的十二长生状态
  const shengwangState = getShengwangState(shengongTian, monthDi);
  const shengwangLevel = getShengwangLevel(shengwangState);

  return {
    tian: shengongTian,
    di: shengongDi,
    nayin: getNayin(shengongTian, shengongDi),
    shengwang: shengwangState,
    shengwangLevel: shengwangLevel
  };
}

/**
 * 计算胎宫
 * 胎宫地支 = 日支 + 月支 + 1 (mod 12)
 */
function calculateTaigong(monthDizhi: number, dayDizhi: number, monthDi: string): { tian: string; di: string; nayin?: string; shengwang?: string; shengwangLevel?: 'strong' | 'medium' | 'weak' } {
  const taigongDizhi = (dayDizhi + monthDizhi + 1) % 12;
  const taigongDi = DIZHI[taigongDizhi];
  const taigongTian = getTianganForDizhi(taigongDizhi);

  // 计算胎宫天干在月支的十二长生状态
  const shengwangState = getShengwangState(taigongTian, monthDi);
  const shengwangLevel = getShengwangLevel(shengwangState);

  return {
    tian: taigongTian,
    di: taigongDi,
    nayin: getNayin(taigongTian, taigongDi),
    shengwang: shengwangState,
    shengwangLevel: shengwangLevel
  };
}

/**
 * 计算起运信息
 * 阳男阴女顺行，阴男阳女逆行
 * 顺行：从出生日到下一个节气的天数
 * 逆行：从出生日到上一个节气的天数
 * 3天折1年，1天折4个月，不足1天折若干日
 */
function calculateQiyunInfo(
  birthDate: Date,
  gender: 'male' | 'female',
  yearTian: string
): QiyunInfo {
  // 判断年干阴阳（甲丙戊庚壬为阳，乙丁己辛癸为阴）
  const yangTian = ['甲', '丙', '戊', '庚', '壬'];
  const isYangYear = yangTian.includes(yearTian);

  // 阳男阴女顺行，阴男阳女逆行
  const isShunxing = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear);

  let daysDiff: number;

  if (isShunxing) {
    // 顺行：计算到下一个节气的天数
    const nextJieqi = getNextJieqi(birthDate);
    daysDiff = nextJieqi.daysDiff;
  } else {
    // 逆行：计算到上一个节气的天数
    const prevJieqi = getPreviousJieqi(birthDate);
    daysDiff = prevJieqi.daysDiff;
  }

  // 确保天数为正数
  daysDiff = Math.abs(daysDiff);

  // 3天折1年，1天折4个月
  const years = Math.floor(daysDiff / 3);
  const remainingDays = daysDiff % 3;
  const months = remainingDays * 4;
  const days = Math.floor((daysDiff % 3 - Math.floor(daysDiff % 3)) * 30);

  const description = `约${years}岁${months}个月零${days}日后上运(按岁累加)`;

  return {
    years,
    months,
    days,
    totalDays: daysDiff,
    isShunxing,
    description
  };
}

/**
 * 计算大运
 * @param birthDate 出生日期
 * @param gender 性别
 * @param monthGanzhi 月柱干支
 * @param yearTian 年干
 */
export function calculateDayun(
  birthDate: Date,
  gender: 'male' | 'female',
  monthGanzhi: { tian: string; di: string },
  yearTian: string
): DayunInfo[] {
  // 计算起运信息
  const qiyunInfo = calculateQiyunInfo(birthDate, gender, yearTian);
  const qiyunAge = qiyunInfo.years;

  // 判断顺逆
  const yangTian = ['甲', '丙', '戊', '庚', '壬'];
  const isYangYear = yangTian.includes(yearTian);
  const isShunxing = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear);

  // 获取月柱干支索引
  const monthTianIndex = TIANGAN.indexOf(monthGanzhi.tian);
  const monthDiIndex = DIZHI.indexOf(monthGanzhi.di);

  const dayunList: DayunInfo[] = [];

  // 计算10步大运（每步10年）
  for (let i = 0; i < 10; i++) {
    let tianIndex: number;
    let diIndex: number;

    if (isShunxing) {
      // 顺行
      tianIndex = (monthTianIndex + i + 1) % 10;
      diIndex = (monthDiIndex + i + 1) % 12;
    } else {
      // 逆行
      tianIndex = (monthTianIndex - i - 1 + 10) % 10;
      diIndex = (monthDiIndex - i - 1 + 12) % 12;
    }

    const tian = TIANGAN[tianIndex];
    const di = DIZHI[diIndex];
    const startAge = qiyunAge + i * 10;
    const endAge = startAge + 9;

    dayunList.push({
      age: i + 1,
      ganzhi: `${tian}${di}`,
      tian,
      di,
      startAge,
      endAge
    });
  }

  return dayunList;
}

/**
 * 计算流年
 * @param birthYear 出生年份
 * @param currentYear 当前年份（或指定年份）
 * @param count 计算多少年
 */
export function calculateLiunian(
  birthYear: number,
  currentYear: number,
  count: number = 10
): LiunianInfo[] {
  const liunianList: LiunianInfo[] = [];

  // 从当前年份开始，计算未来若干年
  for (let i = 0; i < count; i++) {
    const year = currentYear + i;
    const age = year - birthYear + 1; // 虚岁

    // 计算该年的干支
    // 以1984年（甲子年）为基准
    const baseYear = 1984;
    const offset = year - baseYear;

    const tianIndex = offset % 10;
    const diIndex = offset % 12;

    const tian = TIANGAN[tianIndex < 0 ? tianIndex + 10 : tianIndex];
    const di = DIZHI[diIndex < 0 ? diIndex + 12 : diIndex];

    liunianList.push({
      year,
      age,
      ganzhi: `${tian}${di}`,
      tian,
      di
    });
  }

  return liunianList;
}
