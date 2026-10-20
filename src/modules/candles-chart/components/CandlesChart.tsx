import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  TimeSeriesScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial'
import 'chartjs-adapter-date-fns'
import { useMemo } from 'react'
import { Chart } from 'react-chartjs-2'
import { formatUtcDateTime, formatUtcTime } from '../../../shared/utils/formatDateTime'
import { formatPrice, formatVolume } from '../../../shared/utils/formatNumber'
import type { Candle, Timeframe } from '../candles-chart.types'
import { priceBounds, toCandlePoints, type CandlePoint } from '../domain/candle-series'
import styles from './CandlesChart.module.css'

ChartJS.register(CandlestickController, CandlestickElement, TimeSeriesScale, LinearScale, Tooltip, Legend)

const GRID_COLOR = 'rgba(148, 163, 184, 0.12)'
const AXIS_COLOR = 'rgba(148, 163, 184, 0.25)'
const TICK_COLOR = '#64748b'

const UP_BORDER = '#22c55e'
const DOWN_BORDER = '#ef4444'
const UNCHANGED_BORDER = '#94a3b8'

interface CandlesChartProps {
  readonly candles: Candle[]
  readonly tf: Timeframe
}

export function CandlesChart({ candles, tf }: CandlesChartProps) {
  const data = useMemo<ChartData<'candlestick', CandlePoint[]>>(() => {
    const points = toCandlePoints(candles)

    return {
      datasets: [
        {
          label: 'Candles',
          data: points,
          barThickness: 'flex',
          borderColors: { up: UP_BORDER, down: DOWN_BORDER, unchanged: UNCHANGED_BORDER },
          backgroundColors: {
            up: 'rgba(34, 197, 94, 0.35)',
            down: 'rgba(239, 68, 68, 0.35)',
            unchanged: 'rgba(148, 163, 184, 0.35)',
          },
        },
      ],
    }
  }, [candles])

  const options = useMemo<ChartOptions<'candlestick'>>(() => {
    const bounds = priceBounds(candles)

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 600,
        easing: 'easeOutQuart',
      },
      animations: {
        x: { duration: 600, easing: 'easeOutQuart' },
        y: { duration: 700, easing: 'easeOutQuart' },
      },
      transitions: {
        active: { animation: { duration: 150 } },
      },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (items) => {
              const candle = items.length > 0 ? candleOf(items[0]) : null

              return candle ? formatUtcDateTime(candle.x) : ''
            },
            label: (item) => {
              const candle = candleOf(item)

              if (!candle) return ''

              return [
                `Open ${formatPrice(candle.o)}`,
                `High ${formatPrice(candle.h)}`,
                `Low ${formatPrice(candle.l)}`,
                `Close ${formatPrice(candle.c)}`,
              ]
            },
            afterLabel: (item) => {
              const candle = candleOf(item)

              return candle ? `Volume ${formatVolume(candle.volume)}` : ''
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: { unit: tf === '1h' ? 'hour' : 'minute' },
          ticks: {
            color: TICK_COLOR,
            maxRotation: 0,
            autoSkip: true,
            autoSkipPadding: 24,
            maxTicksLimit: 10,
            callback: (value) => formatUtcTime(Number(value)),
          },
          grid: { color: GRID_COLOR },
          border: { color: AXIS_COLOR },
        },
        y: {
          min: bounds?.min,
          max: bounds?.max,
          ticks: {
            color: TICK_COLOR,
            callback: (value) => formatPrice(Number(value)),
          },
          grid: { color: GRID_COLOR },
          border: { color: AXIS_COLOR },
        },
      },
    }
  }, [candles, tf])

  return (
    <div className={styles.candlesChart__canvas}>
      <Chart type="candlestick" data={data} options={options} />
    </div>
  )
}

function candleOf(item: TooltipItem<'candlestick'>): CandlePoint | null {
  const raw = item.raw as Partial<CandlePoint> | undefined

  return raw && typeof raw.o === 'number' ? (raw as CandlePoint) : null
}
