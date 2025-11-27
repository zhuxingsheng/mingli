declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    static fromDate(date: Date): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getLunar(): Lunar;
    toYmd(): string;
    toYmdHms(): string;
    next(days: number): Solar;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar;
    static fromDate(date: Date): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    isLeap(): boolean;
    getSolar(): Solar;
    getEightChar(): EightChar;
    getJieQi(): string;
    getPrevJieQi(): JieQi;
    getNextJieQi(): JieQi;
    getJieQiTable(): { [key: string]: Solar };
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    toString(): string;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
  }

  export class JieQi {
    getName(): string;
    getSolar(): Solar;
  }
}

