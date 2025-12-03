/**
 * 四柱反推公历日期工具
 * 根据给定的四柱（年柱、月柱、日柱、时柱）反推可能的公历日期
 */

// @ts-ignore
import * as LunarLib from 'lunar-javascript';
const { Solar } = LunarLib;

import { TIANGAN, DIZHI, SHICHEN_MAP } from './sizhu';

export interface SizhuInput {
  year: { tian: string; di: string };
  month: { tian: string; di: string };
  day: { tian: string; di: string };
  hour: { tian: string; di: string };
}

export interface MatchedDate {
  solar: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  solarString: string;
  lunarString: string;
}

/**
 * 获取时辰对应的小时范围
 */
function getHourFromDizhi(dizhi: string): number {
  const dizhiIndex = DIZHI.indexOf(dizhi);
  // 时辰到小时的映射：子时对应23点或0点，这里取中间值
  const hourMap: { [key: number]: number } = {
    0: 0,   // 子时 23:00-01:00 -> 取 0点
    1: 2,   // 丑时 01:00-03:00 -> 取 2点
    2: 4,   // 寅时 03:00-05:00 -> 取 4点
    3: 6,   // 卯时 05:00-07:00 -> 取 6点
    4: 8,   // 辰时 07:00-09:00 -> 取 8点
    5: 10,  // 巳时 09:00-11:00 -> 取 10点
    6: 12,  // 午时 11:00-13:00 -> 取 12点
    7: 14,  // 未时 13:00-15:00 -> 取 14点
    8: 16,  // 申时 15:00-17:00 -> 取 16点
    9: 18,  // 酉时 17:00-19:00 -> 取 18点
    10: 20, // 戌时 19:00-21:00 -> 取 20点
    11: 22, // 亥时 21:00-23:00 -> 取 22点
  };
  return hourMap[dizhiIndex] ?? 12;
}

/**
 * 格式化日期为显示字符串
 */
function formatSolarDate(year: number, month: number, day: number, hour: number): string {
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  const hourStr = hour.toString().padStart(2, '0');
  return `${year}年${monthStr}月${dayStr}日 ${hourStr}:00`;
}

/**
 * 获取时辰地支
 */
function getHourDizhi(hour: number): string {
  // 时辰索引：子丑寅卯辰巳午未申酉戌亥
  // 子时: 23-1, 丑时: 1-3, 寅时: 3-5, 等等
  if (hour === 23 || hour === 0) return '子';
  return DIZHI[Math.floor((hour + 1) / 2)];
}

/**
 * 获取农历日期字符串
 */
function getLunarString(year: number, month: number, day: number, hour: number): string {
  try {
    const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
    const lunar = solar.getLunar();
    const leapStr = lunar.getMonth() < 0 ? '闰' : '';
    return `农历${lunar.getYear()}年${leapStr}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${getHourDizhi(hour)}时`;
  } catch {
    return '';
  }
}

/**
 * 根据四柱反推公历日期
 * @param sizhu 四柱信息
 * @param startYear 搜索起始年份（默认1801）
 * @param endYear 搜索结束年份（默认2099）
 * @returns 匹配的公历日期列表
 */
export function sizhuToSolar(
  sizhu: SizhuInput,
  startYear: number = 1801,
  endYear: number = 2099
): MatchedDate[] {
  const results: MatchedDate[] = [];
  const targetHour = getHourFromDizhi(sizhu.hour.di);
  
  // 遍历年份范围
  for (let year = startYear; year <= endYear; year++) {
    // 遍历每月每日
    for (let month = 1; month <= 12; month++) {
      // 获取该月天数
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        try {
          const solar = Solar.fromYmdHms(year, month, day, targetHour, 0, 0);
          const lunar = solar.getLunar();
          const eightChar = lunar.getEightChar();
          
          // 检查四柱是否匹配
          const yearGan = eightChar.getYearGan();
          const yearZhi = eightChar.getYearZhi();
          const monthGan = eightChar.getMonthGan();
          const monthZhi = eightChar.getMonthZhi();
          const dayGan = eightChar.getDayGan();
          const dayZhi = eightChar.getDayZhi();
          const hourGan = eightChar.getTimeGan();
          const hourZhi = eightChar.getTimeZhi();
          
          // 完全匹配检查
          if (
            yearGan === sizhu.year.tian && yearZhi === sizhu.year.di &&
            monthGan === sizhu.month.tian && monthZhi === sizhu.month.di &&
            dayGan === sizhu.day.tian && dayZhi === sizhu.day.di &&
            hourGan === sizhu.hour.tian && hourZhi === sizhu.hour.di
          ) {
            results.push({
              solar: { year, month, day, hour: targetHour, minute: 0 },
              solarString: formatSolarDate(year, month, day, targetHour),
              lunarString: getLunarString(year, month, day, targetHour)
            });
          }
        } catch {
          // 日期无效，跳过
          continue;
        }
      }
    }
  }
  
  return results;
}

/**
 * 检查四柱是否为有效组合（六十甲子）
 */
export function isValidSizhu(sizhu: SizhuInput): boolean {
  const checkGanzhi = (tian: string, di: string): boolean => {
    const tianIndex = TIANGAN.indexOf(tian);
    const diIndex = DIZHI.indexOf(di);
    if (tianIndex === -1 || diIndex === -1) return false;
    // 天干地支的奇偶性必须相同
    return tianIndex % 2 === diIndex % 2;
  };
  
  return (
    checkGanzhi(sizhu.year.tian, sizhu.year.di) &&
    checkGanzhi(sizhu.month.tian, sizhu.month.di) &&
    checkGanzhi(sizhu.day.tian, sizhu.day.di) &&
    checkGanzhi(sizhu.hour.tian, sizhu.hour.di)
  );
}

