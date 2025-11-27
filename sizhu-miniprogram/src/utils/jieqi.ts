/**
 * 二十四节气计算工具
 */

// 二十四节气名称
export const JIEQI_NAMES = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
];

// 节气对应的大致日期（平年）
const JIEQI_DATES = [
  [2, 4],   // 立春 2月4日左右
  [2, 19],  // 雨水 2月19日左右
  [3, 6],   // 惊蛰 3月6日左右
  [3, 21],  // 春分 3月21日左右
  [4, 5],   // 清明 4月5日左右
  [4, 20],  // 谷雨 4月20日左右
  [5, 6],   // 立夏 5月6日左右
  [5, 21],  // 小满 5月21日左右
  [6, 6],   // 芒种 6月6日左右
  [6, 22],  // 夏至 6月22日左右
  [7, 7],   // 小暑 7月7日左右
  [7, 23],  // 大暑 7月23日左右
  [8, 8],   // 立秋 8月8日左右
  [8, 23],  // 处暑 8月23日左右
  [9, 8],   // 白露 9月8日左右
  [9, 23],  // 秋分 9月23日左右
  [10, 8],  // 寒露 10月8日左右
  [10, 24], // 霜降 10月24日左右
  [11, 8],  // 立冬 11月8日左右
  [11, 22], // 小雪 11月22日左右
  [12, 7],  // 大雪 12月7日左右
  [12, 22], // 冬至 12月22日左右
  [1, 6],   // 小寒 1月6日左右（次年）
  [1, 20]   // 大寒 1月20日左右（次年）
];

export interface JieqiInfo {
  name: string;
  date: Date;
  daysDiff: number;
}

/**
 * 计算某年的节气日期
 * 使用简化的计算方法
 */
function calculateJieqiDate(year: number, jieqiIndex: number): Date {
  const [month, day] = JIEQI_DATES[jieqiIndex];
  
  // 对于小寒和大寒，它们在次年1月
  if (jieqiIndex >= 22) {
    return new Date(year + 1, month - 1, day);
  }
  
  return new Date(year, month - 1, day);
}

/**
 * 获取某个日期最近的上一个节气
 */
export function getPreviousJieqi(date: Date): JieqiInfo {
  const year = date.getFullYear();
  const targetTime = date.getTime();
  
  let closestJieqi: JieqiInfo = {
    name: '',
    date: new Date(),
    daysDiff: 0
  };
  
  let minDiff = Infinity;
  
  // 检查当年和前一年的节气
  for (let yearOffset = 0; yearOffset >= -1; yearOffset--) {
    const checkYear = year + yearOffset;
    
    for (let i = 0; i < 24; i++) {
      const jieqiDate = calculateJieqiDate(checkYear, i);
      const jieqiTime = jieqiDate.getTime();
      
      // 只考虑在目标日期之前的节气
      if (jieqiTime <= targetTime) {
        const diff = targetTime - jieqiTime;
        if (diff < minDiff) {
          minDiff = diff;
          closestJieqi = {
            name: JIEQI_NAMES[i],
            date: jieqiDate,
            daysDiff: Math.floor(diff / (24 * 60 * 60 * 1000))
          };
        }
      }
    }
  }
  
  return closestJieqi;
}

/**
 * 获取某个日期最近的下一个节气
 */
export function getNextJieqi(date: Date): JieqiInfo {
  const year = date.getFullYear();
  const targetTime = date.getTime();
  
  let closestJieqi: JieqiInfo = {
    name: '',
    date: new Date(),
    daysDiff: 0
  };
  
  let minDiff = Infinity;
  
  // 检查当年和下一年的节气
  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    const checkYear = year + yearOffset;
    
    for (let i = 0; i < 24; i++) {
      const jieqiDate = calculateJieqiDate(checkYear, i);
      const jieqiTime = jieqiDate.getTime();
      
      // 只考虑在目标日期之后的节气
      if (jieqiTime > targetTime) {
        const diff = jieqiTime - targetTime;
        if (diff < minDiff) {
          minDiff = diff;
          closestJieqi = {
            name: JIEQI_NAMES[i],
            date: jieqiDate,
            daysDiff: Math.floor(diff / (24 * 60 * 60 * 1000))
          };
        }
      }
    }
  }
  
  return closestJieqi;
}

/**
 * 格式化节气信息
 */
export function formatJieqiInfo(jieqi: JieqiInfo, isPrevious: boolean = true): string {
  if (!jieqi.name) {
    return '';
  }

  const direction = isPrevious ? '后' : '前';
  const dateStr = `${jieqi.date.getMonth() + 1}月${jieqi.date.getDate()}日`;

  if (jieqi.daysDiff === 0) {
    return `${dateStr}${jieqi.name}（今日）`;
  } else if (jieqi.daysDiff === 1) {
    const dayText = isPrevious ? '次日' : '前日';
    return `${dateStr}${jieqi.name}（${dayText}）`;
  } else {
    return `${dateStr}${jieqi.name}（${direction}${jieqi.daysDiff}日）`;
  }
}

/**
 * 格式化节气信息（带年份）
 */
export function formatJieqiInfoWithYear(jieqi: JieqiInfo, isPrevious: boolean = true): string {
  if (!jieqi.name) {
    return '';
  }

  const direction = isPrevious ? '后' : '前';
  const year = jieqi.date.getFullYear();
  const month = jieqi.date.getMonth() + 1;
  const day = jieqi.date.getDate();
  const dateStr = `${year}年${month}月${day}日`;

  if (jieqi.daysDiff === 0) {
    return `${dateStr}${jieqi.name}（今日）`;
  } else if (jieqi.daysDiff === 1) {
    const dayText = isPrevious ? '次日' : '前日';
    return `${dateStr}${jieqi.name}（${dayText}）`;
  } else {
    return `${dateStr}${jieqi.name}（${direction}${jieqi.daysDiff}日）`;
  }
}

/**
 * 获取完整的节气信息（包括上一个和下一个）
 */
export interface JieqiFullInfo {
  previous: JieqiInfo;
  next: JieqiInfo;
  previousText: string;
  nextText: string;
}

export function getJieqiFullInfo(date: Date): JieqiFullInfo {
  const previous = getPreviousJieqi(date);
  const next = getNextJieqi(date);

  // 判断是否需要显示年份（跨年的情况）
  const currentYear = date.getFullYear();
  const needYearForPrevious = previous.date.getFullYear() !== currentYear;
  const needYearForNext = next.date.getFullYear() !== currentYear;

  return {
    previous,
    next,
    previousText: needYearForPrevious ?
      formatJieqiInfoWithYear(previous, true) :
      formatJieqiInfo(previous, true),
    nextText: needYearForNext ?
      formatJieqiInfoWithYear(next, false) :
      formatJieqiInfo(next, false)
  };
}
