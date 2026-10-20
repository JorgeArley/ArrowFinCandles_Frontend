import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { formatUtcDateTime, formatUtcTime } from '../../../shared/utils/formatDateTime'
import { formatPrice, formatVolume } from '../../../shared/utils/formatNumber'
import type { Candle, Timeframe } from '../candles-chart.types'
import { toChartPoints, type CandlePoint } from '../domain/candle-series'
import styles from './CandlesChart.module.css'

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler)

const LINE_COLOR = '#38bdf8'
const GRID_COLOR = 'rgba(148, 163, 184, 0.12)'
const AXIS_COLOR = 'rgba(148, 163, 184, 0.25)'
const TICK_COLOR = '#64748b'

interface CandlesChartProps {
  readonly candles: Candle[]
  readonly tf: Timeframe
}

export function CandlesChart({ candles, tf }: CandlesChartProps) {
  const data = useMemo<ChartData<'line', CandlePoint[], Date>>(() => {
    const points = toChartPoints(candles)

    return {
      datasets: [
        {
          label: 'Close',
          data: points,
          borderColor: LINE_COLOR,
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          borderWidth: 2,
          fill: true,
          tension: 0.15,
          pointRadius: points.length === 1 ? 4 : 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: LINE_COLOR,
          pointHoverBorderColor: '#0f172a',
        },
      ],
    }
  }, [candles])

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
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
          callbacks: {
            title: (items) => {
              const timestamp = items[0]?.parsed.x

              return timestamp === null || timestamp === undefined ? '' : formatUtcDateTime(timestamp)
            },
            label: (item) => (item.parsed.y === null ? '' : `Close ${formatPrice(item.parsed.y)}`),
            afterLabel: (item) => `Volume ${formatVolume(volumeOf(item))}`,
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
            callback: (value) => formatUtcTime(Number(value)),
          },
          grid: { color: GRID_COLOR },
          border: { color: AXIS_COLOR },
        },
        y: {
          ticks: {
            color: TICK_COLOR,
            callback: (value) => formatPrice(Number(value)),
          },
          grid: { color: GRID_COLOR },
          border: { color: AXIS_COLOR },
        },
      },
    }),
    [tf],
  )

  return (
    <div className={styles.candlesChart__canvas}>
      <Line data={data} options={options} />
    </div>
  )
}

function volumeOf(item: TooltipItem<'line'>): number {
  const raw = item.raw as Partial<CandlePoint> | undefined

  return typeof raw?.volume === 'number' ? raw.volume : 0
}
