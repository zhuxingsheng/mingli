import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'

// 修复 perf.stop 错误的 polyfill
if (typeof wx !== 'undefined' && !wx.getPerformance) {
  wx.getPerformance = () => ({
    start: () => {},
    stop: () => {}
  })
}

// 全局 performance 对象 polyfill
if (typeof global !== 'undefined') {
  global.perf = global.perf || {
    start: () => {},
    stop: () => {}
  }
}

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
  })

  // children 是将要会渲染的页面
  return children
}

export default App
