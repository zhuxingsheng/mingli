// @ts-ignore
import * as LunarLib from 'lunar-javascript';
const { Lunar, Solar } = LunarLib;

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  monthName: string;
  yearInGanZhi: string;
  monthInGanZhi: string;
  dayInGanZhi: string;
}

export interface SolarDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/**
 * 简化的阳历转农历函数
 * 使用基础算法进行转换
 */
export function solarToLunar(solarDate: SolarDate): LunarDate {
  try {
    console.log('转换阳历日期:', solarDate);

    // 尝试使用lunar-javascript库
    if (Solar && typeof Solar.fromYmdHms === 'function') {
      const solar = Solar.fromYmdHms(
        solarDate.year,
        solarDate.month,
        solarDate.day,
        solarDate.hour,
        solarDate.minute,
        0
      );

      const lunar = solar.getLunar();

      const result = {
        year: lunar.getYear(),
        month: Math.abs(lunar.getMonth()), // 取绝对值，因为闰月是负数
        day: lunar.getDay(),
        isLeap: lunar.getMonth() < 0, // 月份为负数表示闰月
        monthName: lunar.getMonthInChinese(),
        yearInGanZhi: lunar.getYearInGanZhi(),
        monthInGanZhi: lunar.getMonthInGanZhi(),
        dayInGanZhi: lunar.getDayInGanZhi()
      };

      console.log('转换后的农历:', result);
      return result;
    } else {
      // 如果库不可用，使用简化的转换逻辑
      return solarToLunarSimple(solarDate);
    }
  } catch (error) {
    console.error('阳历转农历出错，使用简化算法:', error);
    return solarToLunarSimple(solarDate);
  }
}

/**
 * 简化的阳历转农历算法
 */
function solarToLunarSimple(solarDate: SolarDate): LunarDate {
  // 这是一个简化的转换，实际应用中需要更精确的算法
  // 这里提供一个基础的近似转换

  const year = solarDate.year;
  const month = solarDate.month;
  const day = solarDate.day;

  // 简化的农历月份映射（仅作示例）
  const lunarMonthNames = [
    '正月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '冬月', '腊月'
  ];

  // 简化计算：大致减去一个月左右的差值
  let lunarMonth = month - 1;
  let lunarYear = year;
  let lunarDay = day - 10; // 简化的日期差值

  if (lunarMonth <= 0) {
    lunarMonth = 12;
    lunarYear = year - 1;
  }

  if (lunarDay <= 0) {
    lunarDay = 30 + lunarDay;
    lunarMonth = lunarMonth - 1;
    if (lunarMonth <= 0) {
      lunarMonth = 12;
      lunarYear = lunarYear - 1;
    }
  }

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeap: false,
    monthName: lunarMonthNames[lunarMonth - 1] || `${lunarMonth}月`,
    yearInGanZhi: '',
    monthInGanZhi: '',
    dayInGanZhi: ''
  };
}

/**
 * 农历转阳历
 */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeap: boolean = false): SolarDate {
  // lunar-javascript 中闰月用负数表示
  const month = isLeap ? -lunarMonth : lunarMonth;
  const lunar = Lunar.fromYmd(lunarYear, month, lunarDay);
  const solar = lunar.getSolar();
  
  return {
    year: solar.getYear(),
    month: solar.getMonth(),
    day: solar.getDay(),
    hour: 0,
    minute: 0
  };
}

/**
 * 获取农历日期的天干地支信息
 */
export function getLunarGanZhi(lunarYear: number, lunarMonth: number, lunarDay: number, hour: number, minute: number = 0): {
  year: string;
  month: string;
  day: string;
  hour: string;
} {
  try {
    console.log('计算天干地支:', { lunarYear, lunarMonth, lunarDay, hour, minute });

    const lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay);
    const solar = lunar.getSolar();

    // 创建带时间的Solar对象来获取时柱
    const solarWithTime = Solar.fromYmdHms(
      solar.getYear(),
      solar.getMonth(),
      solar.getDay(),
      hour,
      minute,
      0
    );
    const lunarWithTime = solarWithTime.getLunar();

    const result = {
      year: lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhi(),
      day: lunar.getDayInGanZhi(),
      hour: lunarWithTime.getTimeInGanZhi()
    };

    console.log('天干地支结果:', result);
    return result;
  } catch (error) {
    console.error('计算天干地支出错:', error, { lunarYear, lunarMonth, lunarDay, hour, minute });
    throw new Error(`天干地支计算失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 格式化农历日期显示
 */
export function formatLunarDate(lunarDate: LunarDate): string {
  const leapText = lunarDate.isLeap ? '闰' : '';
  return `农历${lunarDate.year}年${leapText}${lunarDate.monthName}${getLunarDayName(lunarDate.day)}`;
}

/**
 * 获取农历日期的中文名称
 */
export function getLunarDayName(day: number): string {
  const dayNames = [
    '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];
  return dayNames[day] || day.toString();
}

/**
 * 验证农历日期是否有效
 */
export function isValidLunarDate(year: number, month: number, day: number, isLeap: boolean = false): boolean {
  try {
    // lunar-javascript 中闰月用负数表示
    const m = isLeap ? -month : month;
    Lunar.fromYmd(year, m, day);
    return true;
  } catch (error) {
    return false;
  }
}
