import { useState, useEffect } from 'react'
import { calculateSizhu, SizhuResult } from './utils/sizhu'
import { formatLunarInfo } from './utils/lunarCalendar'
import { solarToLunar, lunarToSolar, getLunarDayName } from './utils/lunar'
import { getJieqiFullInfo, getJieqiTimeline, JieqiTimelineInfo } from './utils/jieqi'
import { getShengwangState, getShengwangLevel } from './utils/shengwang'
import { calculateTaisuiShensha } from './utils/taisui'
import { getShenshaForDizhi } from './utils/shensha'
import { getXiji, XijiResult } from './utils/xiji'
import './App.css'

type CalendarType = 'solar' | 'lunar'

// 天干地支数据
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 六十甲子组合
const LIUSHIJIAZI = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
]

// 根据天干获取可用的地支
const getValidDizhi = (tiangan: string): string[] => {
  return LIUSHIJIAZI
    .filter(ganzhi => ganzhi.startsWith(tiangan))
    .map(ganzhi => ganzhi.charAt(1))
}

// 根据地支获取可用的天干
const getValidTiangan = (dizhi: string): string[] => {
  return LIUSHIJIAZI
    .filter(ganzhi => ganzhi.endsWith(dizhi))
    .map(ganzhi => ganzhi.charAt(0))
}

// 将Date对象转换为本地时间格式字符串 (yyyy-MM-ddTHH:mm)
const toLocalDateTimeString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}

function App() {
  const [name, setName] = useState('')
  const [birthDateTime, setBirthDateTime] = useState('')
  const [lunarYear, setLunarYear] = useState('')
  const [lunarMonth, setLunarMonth] = useState('')
  const [lunarDay, setLunarDay] = useState('')
  const [lunarHour, setLunarHour] = useState('')
  const [lunarMinute, setLunarMinute] = useState('')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [sizhuResult, setSizhuResult] = useState<SizhuResult | null>(null)
  const [jieqiTimeline, setJieqiTimeline] = useState<JieqiTimelineInfo | null>(null)
  const [selectedDayunIndex, setSelectedDayunIndex] = useState<number>(0) // 选中的大运索引
  const [selectedLiunianIndex, setSelectedLiunianIndex] = useState<number>(0) // 选中的流年索引
  const [showSizhuModal, setShowSizhuModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [timeModalType, setTimeModalType] = useState<'solar' | 'lunar' | 'sizhu'>('solar')
  const [inputTimeInfo, setInputTimeInfo] = useState<{
    lunar: string;
    solar: string;
    gender: string;
  } | null>(null)
  const [showGanzhiPicker, setShowGanzhiPicker] = useState<{
    show: boolean;
    type: 'year' | 'month' | 'day' | 'hour';
    position: 'tian' | 'di';
  }>({ show: false, type: 'year', position: 'tian' })
  const [manualSizhu, setManualSizhu] = useState({
    year: { tian: '', di: '' },
    month: { tian: '', di: '' },
    day: { tian: '', di: '' },
    hour: { tian: '', di: '' }
  })
  // 选中的天干位置，用于显示十二长生状态
  const [selectedTianganPosition, setSelectedTianganPosition] = useState<'hour' | 'day' | 'month' | 'year' | 'minggong' | 'shengong' | 'taigong' | null>(null)
  // 右侧面板的tab选项
  const [rightPanelTab, setRightPanelTab] = useState<string>('xiji')

  const handleCalculate = () => {
    try {
      let result: SizhuResult;

      if (timeModalType === 'solar') {
        if (!birthDateTime) {
          alert('请先选择公历时间')
          return
        }

        const date = new Date(birthDateTime)

        // 验证日期是否有效
        if (isNaN(date.getTime())) {
          alert('请选择有效的出生时间')
          return
        }

        console.log('阳历日期:', date)

        // 使用 lunar-javascript 库进行精确的农历转换
        const lunarInfo = solarToLunar({
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          hour: date.getHours(),
          minute: date.getMinutes()
        })
        console.log('转换后的农历:', lunarInfo)

        // 计算节气信息
        const jieqiInfo = getJieqiFullInfo(date)
        console.log('节气信息:', jieqiInfo)

        // 计算节气时间线
        const timeline = getJieqiTimeline(date)
        console.log('节气时间线:', timeline)
        setJieqiTimeline(timeline)

        // 使用阳历计算四柱（因为我们的四柱算法基于阳历）
        result = calculateSizhu(date, gender)

        // 添加农历显示信息
        result.lunarInfo = {
          year: lunarInfo.year,
          month: lunarInfo.month,
          day: lunarInfo.day,
          isLeap: lunarInfo.isLeap,
          monthName: lunarInfo.monthName,
          originalDate: `农历${lunarInfo.year}年${lunarInfo.isLeap ? '闰' : ''}${lunarInfo.monthName}月${getLunarDayName(lunarInfo.day)}`
        }

        // 添加节气信息
        result.jieqiInfo = {
          previousJieqi: jieqiInfo.previousText,
          nextJieqi: jieqiInfo.nextText
        }

        // 生成输入时间信息显示
        const hour = date.getHours()
        const dizhiNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
        const shichenIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2)
        const shichen = dizhiNames[shichenIndex]
        const genderText = gender === 'male' ? '乾造' : '坤造'

        const dayNames = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
          '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
          '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
        const lunarText = `农历${lunarInfo.year}年 ${lunarInfo.monthName}月${dayNames[lunarInfo.day]} ${shichen}时 ${genderText}`

        const solarText = `公历${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

        setInputTimeInfo({
          lunar: lunarText,
          solar: solarText,
          gender: genderText
        })
      } else if (timeModalType === 'lunar') {
        // 农历输入
        if (!lunarYear || !lunarMonth || !lunarDay || !lunarHour || !lunarMinute) {
          alert('请填写完整的农历出生时间')
          return
        }

        const year = parseInt(lunarYear)
        const month = parseInt(lunarMonth)
        const day = parseInt(lunarDay)
        const hour = parseInt(lunarHour)
        const minute = parseInt(lunarMinute)

        console.log('农历输入:', { year, month, day, hour, minute, isLeapMonth })

        // 使用 lunarToSolar 将农历转换为阳历
        const solarDate = lunarToSolar(year, month, day, isLeapMonth)
        console.log('转换后的阳历:', solarDate)

        // 创建阳历日期对象（带时间）
        const tempDate = new Date(solarDate.year, solarDate.month - 1, solarDate.day, hour, minute)
        console.log('阳历日期对象:', tempDate)

        // 计算节气信息
        const jieqiInfo = getJieqiFullInfo(tempDate)
        console.log('节气信息:', jieqiInfo)

        // 计算节气时间线
        const timeline = getJieqiTimeline(tempDate)
        console.log('节气时间线:', timeline)
        setJieqiTimeline(timeline)

        result = calculateSizhu(tempDate, gender)

        // 添加农历信息显示
        const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']
        const dayNames = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
          '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
          '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

        result.lunarInfo = {
          year,
          month,
          day,
          isLeap: isLeapMonth,
          monthName: (isLeapMonth ? '闰' : '') + (monthNames[month - 1] || `${month}月`),
          originalDate: `农历${year}年${isLeapMonth ? '闰' : ''}${monthNames[month - 1] || month + '月'}${dayNames[day] || day}`
        }

        // 添加节气信息
        result.jieqiInfo = {
          previousJieqi: jieqiInfo.previousText,
          nextJieqi: jieqiInfo.nextText
        }

        // 生成输入时间信息显示
        const dizhiNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
        const shichenIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2)
        const shichen = dizhiNames[shichenIndex]
        const genderText = gender === 'male' ? '乾造' : '坤造'

        const lunarText = `农历${year}年 ${isLeapMonth ? '闰' : ''}${monthNames[month - 1]}${dayNames[day]} ${shichen}时 ${genderText}`
        const solarText = `公历${solarDate.year}年${solarDate.month}月${solarDate.day}日 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

        setInputTimeInfo({
          lunar: lunarText,
          solar: solarText,
          gender: genderText
        })
      } else if (timeModalType === 'sizhu') {
        // 四柱手动输入
        if (!manualSizhu.year.tian || !manualSizhu.year.di ||
            !manualSizhu.month.tian || !manualSizhu.month.di ||
            !manualSizhu.day.tian || !manualSizhu.day.di ||
            !manualSizhu.hour.tian || !manualSizhu.hour.di) {
          alert('请完整选择四柱')
          return
        }

        result = {
          birthYear: new Date().getFullYear(),
          year: {
            tian: manualSizhu.year.tian,
            di: manualSizhu.year.di
          },
          month: {
            tian: manualSizhu.month.tian,
            di: manualSizhu.month.di
          },
          day: {
            tian: manualSizhu.day.tian,
            di: manualSizhu.day.di
          },
          hour: {
            tian: manualSizhu.hour.tian,
            di: manualSizhu.hour.di
          }
        }
      } else {
        alert('请先选择时间')
        return
      }

      setSizhuResult(result)
    } catch (error) {
      alert('日期计算出错，请检查输入的日期是否正确')
      console.error(error)
    }
  }

  const handleReset = () => {
    setName('')
    setBirthDateTime('')
    setLunarYear('')
    setLunarMonth('')
    setLunarDay('')
    setLunarHour('')
    setLunarMinute('')
    setIsLeapMonth(false)
    setSizhuResult(null)
  }

  const handleManualSizhuConfirm = () => {
    // 使用默认值或用户选择的值
    const finalSizhu = {
      year: {
        tian: manualSizhu.year.tian || '甲',
        di: manualSizhu.year.di || '子'
      },
      month: {
        tian: manualSizhu.month.tian || '乙',
        di: manualSizhu.month.di || '丑'
      },
      day: {
        tian: manualSizhu.day.tian || '丙',
        di: manualSizhu.day.di || '寅'
      },
      hour: {
        tian: manualSizhu.hour.tian || '丁',
        di: manualSizhu.hour.di || '卯'
      }
    }

    // 创建手动选择的四柱结果
    const manualResult: SizhuResult = {
      birthYear: new Date().getFullYear(),
      year: {
        tian: finalSizhu.year.tian,
        di: finalSizhu.year.di
      },
      month: {
        tian: finalSizhu.month.tian,
        di: finalSizhu.month.di
      },
      day: {
        tian: finalSizhu.day.tian,
        di: finalSizhu.day.di
      },
      hour: {
        tian: finalSizhu.hour.tian,
        di: finalSizhu.hour.di
      }
    }

    setSizhuResult(manualResult)
    setShowSizhuModal(false)
  }

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showGanzhiPicker.show) {
          setShowGanzhiPicker({ ...showGanzhiPicker, show: false })
        } else if (showTimeModal) {
          setShowTimeModal(false)
        } else if (showSizhuModal) {
          setShowSizhuModal(false)
        }
      }
    }

    if (showSizhuModal || showGanzhiPicker.show || showTimeModal) {
      document.addEventListener('keydown', handleKeyDown)
      // 防止背景滚动
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showSizhuModal, showGanzhiPicker, showTimeModal])



  return (
    <div className="app">
      <div className="main-layout">
        {/* 左侧面板 - 排盘区域 */}
        <div className="left-panel">
          <div className="container">
            {!sizhuResult && (
            <div className="form-section">
          {/* 命主姓名 */}
          <div className="form-row">
            <label className="form-label">命主姓名</label>
            <input
              type="text"
              className="name-input"
              placeholder="请输入姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 性别选择 */}
          <div className="form-row">
            <div className="gender-section">
              <label className="radio-option">
                <input
                  type="radio"
                  value="male"
                  checked={gender === 'male'}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                />
                <span className="radio-text">
                  男 <span className="gender-badge qian">乾</span>
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="female"
                  checked={gender === 'female'}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                />
                <span className="radio-text">
                  女 <span className="gender-badge kun">坤</span>
                </span>
              </label>
            </div>
          </div>

          {/* 时间选择方式 */}
          <div className="form-row">
            <label className="form-label">选择时间</label>
            <div className="time-method-tabs">
              <button
                className={`time-method-tab ${timeModalType === 'solar' ? 'active' : ''}`}
                onClick={() => {
                  setTimeModalType('solar');
                  setShowTimeModal(true);
                }}
              >
                公历
              </button>
              <button
                className={`time-method-tab ${timeModalType === 'lunar' ? 'active' : ''}`}
                onClick={() => {
                  setTimeModalType('lunar');
                  setShowTimeModal(true);
                }}
              >
                农历
              </button>
              <button
                className={`time-method-tab ${timeModalType === 'sizhu' ? 'active' : ''}`}
                onClick={() => {
                  setTimeModalType('sizhu');
                  setShowTimeModal(true);
                }}
              >
                四柱
              </button>
            </div>
          </div>

          {/* 显示已选择的时间 */}
          {(birthDateTime || lunarYear || manualSizhu.year.tian) && (
            <div className="form-row">
              <div className="selected-time-display">
                {timeModalType === 'solar' && birthDateTime && (
                  <div className="time-info">
                    <span className="time-label">公历：</span>
                    <span className="time-value">{new Date(birthDateTime).toLocaleString('zh-CN')}</span>
                  </div>
                )}
                {timeModalType === 'lunar' && lunarYear && (
                  <div className="time-info">
                    <span className="time-label">农历：</span>
                    <span className="time-value">
                      {(() => {
                        const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
                        const dayNames = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                          '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                          '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
                        const dizhiNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
                        const monthName = monthNames[parseInt(lunarMonth) - 1] || `${lunarMonth}月`;
                        const dayName = dayNames[parseInt(lunarDay)] || lunarDay;
                        const hour = parseInt(lunarHour);
                        const shichenIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
                        const shichen = dizhiNames[shichenIndex];
                        return `${lunarYear}年 ${monthName}${dayName} ${shichen}时`;
                      })()}
                    </span>
                  </div>
                )}
                {timeModalType === 'sizhu' && manualSizhu.year.tian && (
                  <div className="time-info">
                    <span className="time-label">四柱：</span>
                    <span className="time-value">
                      {manualSizhu.year.tian}{manualSizhu.year.di}年
                      {manualSizhu.month.tian}{manualSizhu.month.di}月
                      {manualSizhu.day.tian}{manualSizhu.day.di}日
                      {manualSizhu.hour.tian}{manualSizhu.hour.di}时
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 出生地址 */}
          <div className="form-row">
            <label className="form-label">出生地址</label>
            <input
              type="text"
              className="location-input"
              placeholder="未知地 北京时间 --"
            />
          </div>

          {/* 时间选项 */}
          <div className="form-row">
            <div className="time-options">
              <label className="checkbox-option">
                <input type="checkbox" />
                <span>夏令时</span>
              </label>
              <label className="checkbox-option checked">
                <input type="checkbox" defaultChecked />
                <span>真太阳时</span>
              </label>
              <label className="checkbox-option">
                <input type="checkbox" />
                <span>早晚子时</span>
              </label>
              <button className="save-btn">保存</button>
            </div>
          </div>

          {/* 开始排盘按钮 */}
          <button onClick={handleCalculate} className="start-btn">
            开始排盘
          </button>
        </div>
            )}

        {/* 统一时间选择弹窗 */}
        {showTimeModal && (
          <div className="modal-overlay" onClick={() => setShowTimeModal(false)}>
            <div className="time-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-tabs">
                  <button
                    className={`modal-tab ${timeModalType === 'solar' ? 'active' : ''}`}
                    onClick={() => setTimeModalType('solar')}
                  >
                    公历
                  </button>
                  <button
                    className={`modal-tab ${timeModalType === 'lunar' ? 'active' : ''}`}
                    onClick={() => setTimeModalType('lunar')}
                  >
                    农历
                  </button>
                  <button
                    className={`modal-tab ${timeModalType === 'sizhu' ? 'active' : ''}`}
                    onClick={() => setTimeModalType('sizhu')}
                  >
                    四柱
                  </button>
                </div>
                <button
                  className="close-btn"
                  onClick={() => setShowTimeModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="time-modal-content">
                {/* 公历选择 */}
                {timeModalType === 'solar' && (
                  <div className="time-input-section">
                    <div className="modal-label-row">
                      <label className="modal-label">选择公历时间</label>
                      <button
                        className="now-btn"
                        onClick={() => {
                          const now = new Date();
                          setBirthDateTime(toLocalDateTimeString(now));
                        }}
                      >
                        📅 现在
                      </button>
                    </div>
                    <div className="time-input-grid">
                      <div className="input-group">
                        <label className="input-label">年</label>
                        <input
                          type="number"
                          placeholder="1990"
                          value={birthDateTime ? new Date(birthDateTime).getFullYear() : ''}
                          onChange={(e) => {
                            const year = e.target.value;
                            const date = birthDateTime ? new Date(birthDateTime) : new Date();
                            date.setFullYear(parseInt(year) || 1990);
                            setBirthDateTime(toLocalDateTimeString(date));
                          }}
                          min="1900"
                          max="2100"
                          className="time-number-input"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">月</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={birthDateTime ? new Date(birthDateTime).getMonth() + 1 : ''}
                          onChange={(e) => {
                            const month = e.target.value;
                            const date = birthDateTime ? new Date(birthDateTime) : new Date();
                            date.setMonth(parseInt(month) - 1 || 0);
                            setBirthDateTime(toLocalDateTimeString(date));
                          }}
                          min="1"
                          max="12"
                          className="time-number-input"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">日</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={birthDateTime ? new Date(birthDateTime).getDate() : ''}
                          onChange={(e) => {
                            const day = e.target.value;
                            const date = birthDateTime ? new Date(birthDateTime) : new Date();
                            date.setDate(parseInt(day) || 1);
                            setBirthDateTime(toLocalDateTimeString(date));
                          }}
                          min="1"
                          max="31"
                          className="time-number-input"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">时</label>
                        <input
                          type="number"
                          placeholder="12"
                          value={birthDateTime ? new Date(birthDateTime).getHours() : ''}
                          onChange={(e) => {
                            const hour = e.target.value;
                            const date = birthDateTime ? new Date(birthDateTime) : new Date();
                            date.setHours(parseInt(hour) || 0);
                            setBirthDateTime(toLocalDateTimeString(date));
                          }}
                          min="0"
                          max="23"
                          className="time-number-input"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">分</label>
                        <input
                          type="number"
                          placeholder="30"
                          value={birthDateTime ? new Date(birthDateTime).getMinutes() : ''}
                          onChange={(e) => {
                            const minute = e.target.value;
                            const date = birthDateTime ? new Date(birthDateTime) : new Date();
                            date.setMinutes(parseInt(minute) || 0);
                            setBirthDateTime(toLocalDateTimeString(date));
                          }}
                          min="0"
                          max="59"
                          className="time-number-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 农历选择 */}
                {timeModalType === 'lunar' && (
                  <div className="time-input-section">
                    <div className="modal-label-row">
                      <label className="modal-label">选择农历时间</label>
                      <button
                        className="now-btn"
                        onClick={() => {
                          const now = new Date();
                          const lunarInfo = solarToLunar({
                            year: now.getFullYear(),
                            month: now.getMonth() + 1,
                            day: now.getDate(),
                            hour: now.getHours(),
                            minute: now.getMinutes()
                          });
                          setLunarYear(lunarInfo.year.toString());
                          setLunarMonth(lunarInfo.month.toString());
                          setLunarDay(lunarInfo.day.toString());
                          setLunarHour(now.getHours().toString());
                          setLunarMinute(now.getMinutes().toString());
                        }}
                      >
                        🌙 现在
                      </button>
                    </div>
                    <div className="time-input-grid">
                      <div className="input-group">
                        <label className="input-label">年</label>
                        <input
                          type="number"
                          placeholder="1990"
                          value={lunarYear}
                          onChange={(e) => setLunarYear(e.target.value)}
                          min="1900"
                          max="2100"
                          className="time-number-input"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">月</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={lunarMonth}
                          onChange={(e) => setLunarMonth(e.target.value)}
                          min="1"
                          max="12"
                          className="time-number-input"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">日</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={lunarDay}
                          onChange={(e) => setLunarDay(e.target.value)}
                          min="1"
                          max="30"
                          className="time-number-input"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">时</label>
                        <input
                          type="number"
                          placeholder="12"
                          value={lunarHour}
                          onChange={(e) => setLunarHour(e.target.value)}
                          min="0"
                          max="23"
                          className="time-number-input"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">分</label>
                        <input
                          type="number"
                          placeholder="30"
                          value={lunarMinute}
                          onChange={(e) => setLunarMinute(e.target.value)}
                          min="0"
                          max="59"
                          className="time-number-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 四柱选择 */}
                {timeModalType === 'sizhu' && (
                  <div className="time-input-section">
                    <label className="modal-label">手动选择四柱</label>
                    <div className="sizhu-grid">
                      <div className="sizhu-column">
                        <h4>年柱</h4>
                        <div className="pillar-display">
                          <button
                            className="pillar-char"
                            onClick={() => setShowGanzhiPicker({ show: true, type: 'year', position: 'tian' })}
                          >
                            {manualSizhu.year.tian}
                          </button>
                          <button
                            className="pillar-char"
                            onClick={() => setShowGanzhiPicker({ show: true, type: 'year', position: 'di' })}
                          >
                            {manualSizhu.year.di}
                          </button>
                        </div>
                      </div>

                      <div className="sizhu-column">
                        <h4>月柱</h4>
                        <div className="pillar-display">
                          <button
                            className="pillar-char"
                            onClick={() => setShowGanzhiPicker({ show: true, type: 'month', position: 'tian' })}
                          >
                            {manualSizhu.month.tian}
                          </button>
                          <button
                            className="pillar-char"
                            onClick={() => setShowGanzhiPicker({ show: true, type: 'month', position: 'di' })}
                          >
                            {manualSizhu.month.di}
                          </button>
                        </div>
                      </div>

                      <div className="sizhu-column">
                        <h4>日柱</h4>
                        <div className="pillar-display">
                          <button
                            className="pillar-char"
                            onClick={() => setShowGanzhiPicker({ show: true, type: 'day', position: 'tian' })}
                          >
                            {manualSizhu.day.tian}
                          </button>
                          <button
                            className="pillar-char"
                            onClick={() => setShowGanzhiPicker({ show: true, type: 'day', position: 'di' })}
                          >
                            {manualSizhu.day.di}
                          </button>
                        </div>
                      </div>

                      <div className="sizhu-column">
                        <h4>时柱</h4>
                        <div className="pillar-display">
                          <button
                            className="pillar-char"
                            onClick={() => setShowGanzhiPicker({ show: true, type: 'hour', position: 'tian' })}
                          >
                            {manualSizhu.hour.tian}
                          </button>
                          <button
                            className="pillar-char"
                            onClick={() => setShowGanzhiPicker({ show: true, type: 'hour', position: 'di' })}
                          >
                            {manualSizhu.hour.di}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="info-text">
                      <div className="year-range">查找范围：1801-2099年</div>
                      <div className="ganzhi-rule">天干地支按六十甲子规则组合，无效组合将置灰</div>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="confirm-btn"
                onClick={() => setShowTimeModal(false)}
              >
                确定
              </button>
            </div>
          </div>
        )}

        {/* 四柱选择弹窗 */}
        {showSizhuModal && (
          <div className="modal-overlay" onClick={() => setShowSizhuModal(false)}>
            <div className="sizhu-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-tabs">
                  <button className="modal-tab">公历</button>
                  <button className="modal-tab">农历</button>
                  <button className="modal-tab active">四柱</button>
                </div>
                <button
                  className="close-btn"
                  onClick={() => setShowSizhuModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="sizhu-content">
                <div className="sizhu-grid">
                  <div className="sizhu-column">
                    <h4>年柱</h4>
                    <div className="pillar-display">
                      <button
                        className="pillar-char"
                        onClick={() => setShowGanzhiPicker({ show: true, type: 'year', position: 'tian' })}
                      >
                        {manualSizhu.year.tian}
                      </button>
                      <button
                        className="pillar-char"
                        onClick={() => setShowGanzhiPicker({ show: true, type: 'year', position: 'di' })}
                      >
                        {manualSizhu.year.di}
                      </button>
                    </div>
                  </div>

                  <div className="sizhu-column">
                    <h4>月柱</h4>
                    <div className="pillar-display">
                      <button
                        className="pillar-char"
                        onClick={() => setShowGanzhiPicker({ show: true, type: 'month', position: 'tian' })}
                      >
                        {manualSizhu.month.tian}
                      </button>
                      <button
                        className="pillar-char"
                        onClick={() => setShowGanzhiPicker({ show: true, type: 'month', position: 'di' })}
                      >
                        {manualSizhu.month.di}
                      </button>
                    </div>
                  </div>

                  <div className="sizhu-column">
                    <h4>日柱</h4>
                    <div className="pillar-display">
                      <button
                        className="pillar-char"
                        onClick={() => setShowGanzhiPicker({ show: true, type: 'day', position: 'tian' })}
                      >
                        {manualSizhu.day.tian}
                      </button>
                      <button
                        className="pillar-char"
                        onClick={() => setShowGanzhiPicker({ show: true, type: 'day', position: 'di' })}
                      >
                        {manualSizhu.day.di}
                      </button>
                    </div>
                  </div>

                  <div className="sizhu-column">
                    <h4>时柱</h4>
                    <div className="pillar-display">
                      <button
                        className="pillar-char"
                        onClick={() => setShowGanzhiPicker({ show: true, type: 'hour', position: 'tian' })}
                      >
                        {manualSizhu.hour.tian}
                      </button>
                      <button
                        className="pillar-char"
                        onClick={() => setShowGanzhiPicker({ show: true, type: 'hour', position: 'di' })}
                      >
                        {manualSizhu.hour.di}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 四柱预览 */}
                <div className="sizhu-preview">
                  <div className="preview-item">
                    <span className="preview-label">年柱</span>
                    <span className="preview-value">
                      {manualSizhu.year.tian || '?'}{manualSizhu.year.di || '?'}
                    </span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">月柱</span>
                    <span className="preview-value">
                      {manualSizhu.month.tian || '?'}{manualSizhu.month.di || '?'}
                    </span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">日柱</span>
                    <span className="preview-value">
                      {manualSizhu.day.tian || '?'}{manualSizhu.day.di || '?'}
                    </span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">时柱</span>
                    <span className="preview-value">
                      {manualSizhu.hour.tian || '?'}{manualSizhu.hour.di || '?'}
                    </span>
                  </div>
                </div>

                <div className="info-text">
                  <div className="year-range">查找范围：1801-2099年</div>
                  <div className="ganzhi-rule">天干地支按六十甲子规则组合，无效组合将置灰</div>
                </div>

                <button
                  className="confirm-btn"
                  onClick={handleManualSizhuConfirm}
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 天干地支选择器 */}
        {showGanzhiPicker.show && (
          <div className="ganzhi-picker-overlay" onClick={() => setShowGanzhiPicker({ ...showGanzhiPicker, show: false })}>
            <div className="ganzhi-picker" onClick={(e) => e.stopPropagation()}>
              <div className={`ganzhi-grid ${showGanzhiPicker.position === 'di' ? 'dizhi-grid' : ''}`}>
                {(showGanzhiPicker.position === 'tian' ? TIANGAN : DIZHI).map((char) => {
                  // 检查是否可选择
                  let isDisabled = false
                  const currentPillar = manualSizhu[showGanzhiPicker.type]

                  if (showGanzhiPicker.position === 'di' && currentPillar.tian) {
                    // 如果已选择天干，检查地支是否有效
                    const validDizhi = getValidDizhi(currentPillar.tian)
                    isDisabled = !validDizhi.includes(char)
                  } else if (showGanzhiPicker.position === 'tian' && currentPillar.di) {
                    // 如果已选择地支，检查天干是否有效
                    const validTiangan = getValidTiangan(currentPillar.di)
                    isDisabled = !validTiangan.includes(char)
                  }

                  return (
                    <button
                      key={char}
                      className={`ganzhi-option ${isDisabled ? 'disabled' : ''}`}
                      disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled) {
                          setManualSizhu(prev => {
                            const newPillar = {
                              ...prev[showGanzhiPicker.type],
                              [showGanzhiPicker.position]: char
                            }

                            // 检查新组合是否有效，如果无效则清除另一个位置
                            if (newPillar.tian && newPillar.di) {
                              const combination = `${newPillar.tian}${newPillar.di}`
                              if (!LIUSHIJIAZI.includes(combination)) {
                                // 清除另一个位置的选择
                                if (showGanzhiPicker.position === 'tian') {
                                  newPillar.di = ''
                                } else {
                                  newPillar.tian = ''
                                }
                              }
                            }

                            return {
                              ...prev,
                              [showGanzhiPicker.type]: newPillar
                            }
                          })
                          setShowGanzhiPicker({ ...showGanzhiPicker, show: false })
                        }
                      }}
                    >
                      {char}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {sizhuResult && (
          <div className="result-section">
            <div className="result-header">
              <h2>四柱结果</h2>
              <button className="reset-btn" onClick={handleReset}>
                重新排盘
              </button>
            </div>

            {/* 输入时间信息 */}
            {inputTimeInfo && (
              <div className="input-time-info">
                <div className="time-info-line">{inputTimeInfo.lunar}</div>
                <div className="time-info-line">{inputTimeInfo.solar}</div>
              </div>
            )}

            {/* 节气时间线 */}
            {jieqiTimeline && (
              <div className="jieqi-timeline">
                <div className="jieqi-item">
                  <span className="jieqi-name">{jieqiTimeline.prevPrev.name}:</span>
                  <span className="jieqi-time">{jieqiTimeline.prevPrev.dateString}</span>
                </div>
                <div className="jieqi-item">
                  <span className="jieqi-name">{jieqiTimeline.previous.name}:</span>
                  <span className="jieqi-time">{jieqiTimeline.previous.dateString}</span>
                </div>
                <div className="jieqi-item birth">
                  <span className="jieqi-name">出生:</span>
                  <span className="jieqi-time">{jieqiTimeline.birth.dateString}</span>
                </div>
                <div className="jieqi-item">
                  <span className="jieqi-name">{jieqiTimeline.next.name}:</span>
                  <span className="jieqi-time">{jieqiTimeline.next.dateString}</span>
                </div>
              </div>
            )}

            {/* 四柱与三宫合并表格 */}
            <div className="sizhu-sangong-merged">
              {/* 选中天干提示 */}
              {selectedTianganPosition && (
                <div className="shengwang-hint">
                  点击显示 <strong>{
                    selectedTianganPosition === 'hour' ? sizhuResult.hour.tian :
                    selectedTianganPosition === 'day' ? sizhuResult.day.tian :
                    selectedTianganPosition === 'month' ? sizhuResult.month.tian :
                    selectedTianganPosition === 'year' ? sizhuResult.year.tian :
                    selectedTianganPosition === 'minggong' ? sizhuResult.minggong?.tian :
                    selectedTianganPosition === 'shengong' ? sizhuResult.shengong?.tian :
                    sizhuResult.taigong?.tian
                  }</strong> 在各地支的十二长生状态
                  <button
                    className="shengwang-hint-close"
                    onClick={() => setSelectedTianganPosition(null)}
                  >
                    ✕ 恢复默认
                  </button>
                </div>
              )}
              <table>
                <thead>
                  <tr>
                    <th>年柱</th>
                    <th>月柱</th>
                    <th>日柱</th>
                    <th>时柱</th>
                    <th>命宫</th>
                    <th>身宫</th>
                    <th>胎宫</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="tiangan-row">
                    <td
                      className={`gan clickable ${selectedTianganPosition === 'year' ? 'selected' : ''}`}
                      onClick={() => setSelectedTianganPosition(selectedTianganPosition === 'year' ? null : 'year')}
                      title="点击查看此天干在各地支的十二长生状态"
                    >
                      {sizhuResult.year.tian}
                    </td>
                    <td
                      className={`gan clickable ${selectedTianganPosition === 'month' ? 'selected' : ''}`}
                      onClick={() => setSelectedTianganPosition(selectedTianganPosition === 'month' ? null : 'month')}
                      title="点击查看此天干在各地支的十二长生状态"
                    >
                      {sizhuResult.month.tian}
                    </td>
                    <td
                      className={`gan day-master clickable ${selectedTianganPosition === 'day' ? 'selected' : ''}`}
                      onClick={() => setSelectedTianganPosition(selectedTianganPosition === 'day' ? null : 'day')}
                      title="点击查看此天干在各地支的十二长生状态"
                    >
                      {sizhuResult.day.tian}
                    </td>
                    <td
                      className={`gan clickable ${selectedTianganPosition === 'hour' ? 'selected' : ''}`}
                      onClick={() => setSelectedTianganPosition(selectedTianganPosition === 'hour' ? null : 'hour')}
                      title="点击查看此天干在各地支的十二长生状态"
                    >
                      {sizhuResult.hour.tian}
                    </td>
                    <td
                      className={`gan minggong-gan clickable ${selectedTianganPosition === 'minggong' ? 'selected' : ''}`}
                      onClick={() => sizhuResult.minggong?.tian && setSelectedTianganPosition(selectedTianganPosition === 'minggong' ? null : 'minggong')}
                      title="点击查看此天干在各地支的十二长生状态"
                    >
                      {sizhuResult.minggong?.tian || '-'}
                    </td>
                    <td
                      className={`gan shengong-gan clickable ${selectedTianganPosition === 'shengong' ? 'selected' : ''}`}
                      onClick={() => sizhuResult.shengong?.tian && setSelectedTianganPosition(selectedTianganPosition === 'shengong' ? null : 'shengong')}
                      title="点击查看此天干在各地支的十二长生状态"
                    >
                      {sizhuResult.shengong?.tian || '-'}
                    </td>
                    <td
                      className={`gan taigong-gan clickable ${selectedTianganPosition === 'taigong' ? 'selected' : ''}`}
                      onClick={() => sizhuResult.taigong?.tian && setSelectedTianganPosition(selectedTianganPosition === 'taigong' ? null : 'taigong')}
                      title="点击查看此天干在各地支的十二长生状态"
                    >
                      {sizhuResult.taigong?.tian || '-'}
                    </td>
                  </tr>
                  <tr className="dizhi-row">
                    <td className="zhi">{sizhuResult.year.di}</td>
                    <td className="zhi">{sizhuResult.month.di}</td>
                    <td className="zhi day-master">{sizhuResult.day.di}</td>
                    <td className="zhi">{sizhuResult.hour.di}</td>
                    <td className="zhi minggong-zhi">{sizhuResult.minggong?.di || '-'}</td>
                    <td className="zhi shengong-zhi">{sizhuResult.shengong?.di || '-'}</td>
                    <td className="zhi taigong-zhi">{sizhuResult.taigong?.di || '-'}</td>
                  </tr>
                  <tr className="nayin-row">
                    <td className="nayin">{sizhuResult.year.nayin || '-'}</td>
                    <td className="nayin">{sizhuResult.month.nayin || '-'}</td>
                    <td className="nayin">{sizhuResult.day.nayin || '-'}</td>
                    <td className="nayin">{sizhuResult.hour.nayin || '-'}</td>
                    <td className="nayin">{sizhuResult.minggong?.nayin || '-'}</td>
                    <td className="nayin">{sizhuResult.shengong?.nayin || '-'}</td>
                    <td className="nayin">{sizhuResult.taigong?.nayin || '-'}</td>
                  </tr>
                  <tr className="shengwang-row">
                    {(() => {
                      // 获取选中位置对应的天干
                      const getSelectedTiangan = (): string | null => {
                        if (!selectedTianganPosition) return null;
                        switch (selectedTianganPosition) {
                          case 'hour': return sizhuResult.hour.tian;
                          case 'day': return sizhuResult.day.tian;
                          case 'month': return sizhuResult.month.tian;
                          case 'year': return sizhuResult.year.tian;
                          case 'minggong': return sizhuResult.minggong?.tian || null;
                          case 'shengong': return sizhuResult.shengong?.tian || null;
                          case 'taigong': return sizhuResult.taigong?.tian || null;
                          default: return null;
                        }
                      };

                      const selectedTiangan = getSelectedTiangan();

                      // 获取各柱的十二长生状态
                      const getShengwang = (di: string | undefined, defaultState: string | undefined, defaultLevel: string | undefined) => {
                        if (!di) return { state: '-', level: '' };
                        if (selectedTiangan) {
                          const state = getShengwangState(selectedTiangan, di);
                          const level = getShengwangLevel(state);
                          return { state, level };
                        }
                        return { state: defaultState || '-', level: defaultLevel || '' };
                      };

                      const hourSW = getShengwang(sizhuResult.hour.di, sizhuResult.hour.shengwang, sizhuResult.hour.shengwangLevel);
                      const daySW = getShengwang(sizhuResult.day.di, sizhuResult.day.shengwang, sizhuResult.day.shengwangLevel);
                      const monthSW = getShengwang(sizhuResult.month.di, sizhuResult.month.shengwang, sizhuResult.month.shengwangLevel);
                      const yearSW = getShengwang(sizhuResult.year.di, sizhuResult.year.shengwang, sizhuResult.year.shengwangLevel);
                      const minggongSW = getShengwang(sizhuResult.minggong?.di, sizhuResult.minggong?.shengwang, sizhuResult.minggong?.shengwangLevel);
                      const shengongSW = getShengwang(sizhuResult.shengong?.di, sizhuResult.shengong?.shengwang, sizhuResult.shengong?.shengwangLevel);
                      const taigongSW = getShengwang(sizhuResult.taigong?.di, sizhuResult.taigong?.shengwang, sizhuResult.taigong?.shengwangLevel);

                      return (
                        <>
                          <td className={`shengwang ${yearSW.level}`}>{yearSW.state}</td>
                          <td className={`shengwang ${monthSW.level}`}>{monthSW.state}</td>
                          <td className={`shengwang ${daySW.level}`}>{daySW.state}</td>
                          <td className={`shengwang ${hourSW.level}`}>{hourSW.state}</td>
                          <td className={`shengwang ${minggongSW.level}`}>{minggongSW.state}</td>
                          <td className={`shengwang ${shengongSW.level}`}>{shengongSW.state}</td>
                          <td className={`shengwang ${taigongSW.level}`}>{taigongSW.state}</td>
                        </>
                      );
                    })()}
                  </tr>
                  <tr className="shensha-row">
                    {(() => {
                      // 以年支为太岁，计算各柱地支对应的神煞
                      const yearDi = sizhuResult.year.di;

                      const hourShensha = calculateTaisuiShensha(yearDi, sizhuResult.hour.di);
                      const dayShensha = calculateTaisuiShensha(yearDi, sizhuResult.day.di);
                      const monthShensha = calculateTaisuiShensha(yearDi, sizhuResult.month.di);
                      const yearShensha = calculateTaisuiShensha(yearDi, sizhuResult.year.di);
                      const minggongShensha = sizhuResult.minggong?.di
                        ? calculateTaisuiShensha(yearDi, sizhuResult.minggong.di)
                        : { shensha: '-', jixiong: 'xiong' as const, desc: '' };
                      const shengongShensha = sizhuResult.shengong?.di
                        ? calculateTaisuiShensha(yearDi, sizhuResult.shengong.di)
                        : { shensha: '-', jixiong: 'xiong' as const, desc: '' };
                      const taigongShensha = sizhuResult.taigong?.di
                        ? calculateTaisuiShensha(yearDi, sizhuResult.taigong.di)
                        : { shensha: '-', jixiong: 'xiong' as const, desc: '' };

                      return (
                        <>
                          <td className={`shensha ${yearShensha.jixiong}`} title={yearShensha.desc}>{yearShensha.shensha}</td>
                          <td className={`shensha ${monthShensha.jixiong}`} title={monthShensha.desc}>{monthShensha.shensha}</td>
                          <td className={`shensha ${dayShensha.jixiong}`} title={dayShensha.desc}>{dayShensha.shensha}</td>
                          <td className={`shensha ${hourShensha.jixiong}`} title={hourShensha.desc}>{hourShensha.shensha}</td>
                          <td className={`shensha ${minggongShensha.jixiong}`} title={minggongShensha.desc}>{minggongShensha.shensha}</td>
                          <td className={`shensha ${shengongShensha.jixiong}`} title={shengongShensha.desc}>{shengongShensha.shensha}</td>
                          <td className={`shensha ${taigongShensha.jixiong}`} title={taigongShensha.desc}>{taigongShensha.shensha}</td>
                        </>
                      );
                    })()}
                  </tr>
                  <tr className="shensha2-row">
                    {(() => {
                      // 以日干和年支为准，计算驿马、羊刃、禄、天乙贵人
                      const dayTian = sizhuResult.day.tian;
                      const yearDi = sizhuResult.year.di;

                      const hourShensha2 = getShenshaForDizhi(dayTian, yearDi, sizhuResult.hour.di);
                      const dayShensha2 = getShenshaForDizhi(dayTian, yearDi, sizhuResult.day.di);
                      const monthShensha2 = getShenshaForDizhi(dayTian, yearDi, sizhuResult.month.di);
                      const yearShensha2 = getShenshaForDizhi(dayTian, yearDi, sizhuResult.year.di);
                      const minggongShensha2 = sizhuResult.minggong?.di
                        ? getShenshaForDizhi(dayTian, yearDi, sizhuResult.minggong.di)
                        : { labels: [] as string[] };
                      const shengongShensha2 = sizhuResult.shengong?.di
                        ? getShenshaForDizhi(dayTian, yearDi, sizhuResult.shengong.di)
                        : { labels: [] as string[] };
                      const taigongShensha2 = sizhuResult.taigong?.di
                        ? getShenshaForDizhi(dayTian, yearDi, sizhuResult.taigong.di)
                        : { labels: [] as string[] };

                      const renderShensha2 = (shensha: { labels: string[] }) => {
                        if (shensha.labels.length === 0) return '-';
                        return shensha.labels.map((label, i) => (
                          <span key={i} className={`shensha2-tag ${label === '贵' ? 'tianyi' : label === '禄' ? 'lu' : label === '马' ? 'yima' : 'yangren'}`}>
                            {label}
                          </span>
                        ));
                      };

                      return (
                        <>
                          <td className="shensha2">{renderShensha2(yearShensha2)}</td>
                          <td className="shensha2">{renderShensha2(monthShensha2)}</td>
                          <td className="shensha2">{renderShensha2(dayShensha2)}</td>
                          <td className="shensha2">{renderShensha2(hourShensha2)}</td>
                          <td className="shensha2">{renderShensha2(minggongShensha2)}</td>
                          <td className="shensha2">{renderShensha2(shengongShensha2)}</td>
                          <td className="shensha2">{renderShensha2(taigongShensha2)}</td>
                        </>
                      );
                    })()}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 大运和流年 */}
            {sizhuResult.dayun && sizhuResult.dayun.length > 0 && (
              <div className="dayun-liunian-wrapper">
                <h3 className="section-title">大运流年</h3>

                {/* 起运信息 */}
                {sizhuResult.qiyunInfo && (
                  <div className="qiyun-info">
                    <p className="qiyun-text">{sizhuResult.qiyunInfo.description}</p>
                  </div>
                )}

                {/* 大运横向平铺 */}
                <div className="dayun-container">
                  {sizhuResult.dayun.map((dayun, dayunIndex) => {
                    const birthYear = sizhuResult.birthYear;
                    const startYear = birthYear + dayun.startAge - 1;

                    // 计算该大运期间的流年
                    const liunianList = [];
                    for (let i = 0; i < 10; i++) {
                      const year = startYear + i;
                      const age = dayun.startAge + i;

                      // 计算该年的干支
                      const baseYear = 1984;
                      const offset = year - baseYear;
                      const tianIndex = offset % 10;
                      const diIndex = offset % 12;

                      const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
                      const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

                      const tian = TIANGAN[tianIndex < 0 ? tianIndex + 10 : tianIndex];
                      const di = DIZHI[diIndex < 0 ? diIndex + 12 : diIndex];

                      liunianList.push({
                        year,
                        age,
                        ganzhi: `${tian}${di}`
                      });
                    }

                    return (
                      <div
                        key={dayunIndex}
                        className={`dayun-column ${selectedDayunIndex === dayunIndex ? 'selected' : ''}`}
                      >
                        {/* 大运头部 */}
                        <div
                          className="dayun-header"
                          onClick={() => {
                            setSelectedDayunIndex(dayunIndex);
                            setSelectedLiunianIndex(0);
                          }}
                        >
                          <div className="dayun-ganzhi">
                            <span>{dayun.ganzhi[0]}</span>
                            <span>{dayun.ganzhi[1]}</span>
                          </div>
                          <div className="dayun-age">{dayun.startAge}-{dayun.endAge}</div>
                        </div>

                        {/* 流年列表（竖向，始终显示） */}
                        <div className="liunian-list">
                          {liunianList.map((liunian, liunianIdx) => (
                            <div
                              key={liunianIdx}
                              className={`liunian-item ${
                                selectedDayunIndex === dayunIndex && selectedLiunianIndex === liunianIdx
                                  ? 'selected'
                                  : ''
                              }`}
                              onClick={() => {
                                setSelectedDayunIndex(dayunIndex);
                                setSelectedLiunianIndex(liunianIdx);
                              }}
                            >
                              <span className="liunian-year">{liunian.year}</span>
                              <span className="liunian-ganzhi">{liunian.ganzhi}</span>
                              <span className="liunian-age">{liunian.age}岁</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
          </div>
        </div>

        {/* 右侧面板 - Tab区域 */}
        <div className="right-panel">
          <div className="right-panel-header">
            <h2 className="right-panel-title">子平入手式<span className="subtitle">(传习子平)</span></h2>
          </div>
          <div className="right-panel-tabs">
            <button
              className={`tab-btn ${rightPanelTab === 'xiji' ? 'active' : ''}`}
              onClick={() => setRightPanelTab('xiji')}
            >
              喜忌
            </button>
            <button
              className={`tab-btn ${rightPanelTab === 'gongjia' ? 'active' : ''}`}
              onClick={() => setRightPanelTab('gongjia')}
            >
              拱夹暗带
            </button>
            <button
              className={`tab-btn ${rightPanelTab === 'xingchong' ? 'active' : ''}`}
              onClick={() => setRightPanelTab('xingchong')}
            >
              地支刑冲
            </button>
            <button
              className={`tab-btn ${rightPanelTab === 'geju' ? 'active' : ''}`}
              onClick={() => setRightPanelTab('geju')}
            >
              格局
            </button>
          </div>
          <div className="right-panel-content">
            {rightPanelTab === 'xiji' && (
              <div className="tab-content xiji-content">
                {sizhuResult ? (
                  (() => {
                    const xijiInfo = getXiji(sizhuResult.day.tian, sizhuResult.month.di);
                    if (!xijiInfo) {
                      return <p className="no-data">无法获取喜忌信息</p>;
                    }
                    return (
                      <>
                        <div className="xiji-header">
                          <span className="xiji-wuxing">{xijiInfo.wuxing}日主</span>
                          <span className="xiji-season">生{xijiInfo.season}天</span>
                        </div>
                        <h3 className="xiji-title">{xijiInfo.title}</h3>
                        <div className="xiji-verse">
                          {xijiInfo.verse.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                        <div className="xiji-analysis">
                          <h4>解析</h4>
                          <p>{xijiInfo.analysis}</p>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <div className="no-data">
                    <p>请先排盘后查看喜忌</p>
                  </div>
                )}
              </div>
            )}
            {rightPanelTab === 'gongjia' && (
              <div className="tab-content">
                <h3>拱夹暗带</h3>
                <p>待补充...</p>
              </div>
            )}
            {rightPanelTab === 'xingchong' && (
              <div className="tab-content">
                <h3>地支刑冲</h3>
                <p>待补充...</p>
              </div>
            )}
            {rightPanelTab === 'geju' && (
              <div className="tab-content">
                <h3>格局</h3>
                <p>待补充...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
