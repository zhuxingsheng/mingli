import { useState } from 'react'
import { View, Text, Input, Button, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { calculateSizhu } from '../../utils/sizhu-simple'
import './simple.scss'

export default function Index() {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [sizhuResult, setSizhuResult] = useState(null)

  const handleCalculate = () => {
    try {
      if (!birthDate || !birthTime) {
        Taro.showToast({
          title: '请选择出生日期和时间',
          icon: 'none'
        })
        return
      }

      const dateTimeStr = `${birthDate} ${birthTime}`
      const date = new Date(dateTimeStr)

      // 验证日期是否有效
      if (isNaN(date.getTime())) {
        Taro.showToast({
          title: '请选择有效的出生时间',
          icon: 'none'
        })
        return
      }

      // 计算四柱
      const result = calculateSizhu(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes()
      )

      setSizhuResult(result)

      Taro.showToast({
        title: '排盘完成',
        icon: 'success'
      })
    } catch (error) {
      Taro.showToast({
        title: '日期计算出错，请检查输入',
        icon: 'none'
      })
      console.error(error)
    }
  }

  const handleReset = () => {
    setName('')
    setBirthDate('')
    setBirthTime('')
    setSizhuResult(null)
  }
  return (
    <View className='container'>
      <View className='card'>
        <Text className='title'>四柱排盘</Text>

        {/* 命主姓名 */}
        <View className='form-item'>
          <Text className='form-label'>命主姓名</Text>
          <Input
            className='form-input'
            placeholder='请输入姓名'
            value={name}
            onInput={(e) => setName(e.detail.value)}
          />
        </View>

        {/* 出生时间 */}
        <View className='form-item'>
          <Text className='form-label'>出生时间</Text>
          <View className='datetime-section'>
            <Picker
              mode='date'
              value={birthDate}
              onChange={(e) => setBirthDate(e.detail.value)}
            >
              <View className='picker'>
                {birthDate || '请选择日期'}
              </View>
            </Picker>
            <Picker
              mode='time'
              value={birthTime}
              onChange={(e) => setBirthTime(e.detail.value)}
            >
              <View className='picker'>
                {birthTime || '请选择时间'}
              </View>
            </Picker>
          </View>
        </View>

        {/* 开始排盘按钮 */}
        <Button className='btn' onClick={handleCalculate}>
          开始排盘
        </Button>

        {/* 重置按钮 */}
        <Button className='btn reset-btn' onClick={handleReset}>
          重置
        </Button>
      </View>

      {/* 四柱结果显示 */}
      {sizhuResult && (
        <View className='card result-card'>
          <Text className='title'>四柱结果</Text>
          <View className='sizhu-text'>
            <Text className='sizhu-summary'>
              四柱：{sizhuResult.year}{sizhuResult.month}{sizhuResult.day}{sizhuResult.hour}
            </Text>
            <Text className='name-info'>
              命主：{name || '未填写'}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
