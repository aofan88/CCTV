/**
 * ECharts 共享配置
 *
 * 統一註冊所有圖表組件，避免在各個組件中重複註冊
 */
import { LineChart, MapChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GeoComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

// 一次性註冊所有需要的 ECharts 組件
use([
  LineChart,
  MapChart,
  GridComponent,
  GeoComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  DataZoomComponent,
  CanvasRenderer,
])
