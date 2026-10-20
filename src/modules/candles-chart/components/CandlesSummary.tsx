import { useMemo } from 'react'
import { formatPrice, formatVolume } from '../../../shared/utils/formatNumber'
import type { Candle } from '../candles-chart.types'
import { aggregateCandles } from '../domain/candle-series'
import styles from './CandlesSummary.module.css'

interface CandlesSummaryProps {
  readonly candles: Candle[]
}

export function CandlesSummary({ candles }: CandlesSummaryProps) {
  const summary = useMemo(() => aggregateCandles(candles), [candles])

  if (!summary) return null

  return (
    <dl className={styles.candlesSummary}>
      <div>
        <dt className={styles.candlesSummary__label}>Open</dt>
        <dd key={summary.open} className={styles.candlesSummary__value}>
          {formatPrice(summary.open)}
        </dd>
      </div>
      <div>
        <dt className={styles.candlesSummary__label}>High</dt>
        <dd key={summary.high} className={styles.candlesSummary__value}>
          {formatPrice(summary.high)}
        </dd>
      </div>
      <div>
        <dt className={styles.candlesSummary__label}>Low</dt>
        <dd key={summary.low} className={styles.candlesSummary__value}>
          {formatPrice(summary.low)}
        </dd>
      </div>
      <div>
        <dt className={styles.candlesSummary__label}>Close</dt>
        <dd key={summary.close} className={styles.candlesSummary__value}>
          {formatPrice(summary.close)}
        </dd>
      </div>
      <div>
        <dt className={styles.candlesSummary__label}>Volume</dt>
        <dd key={summary.volume} className={styles.candlesSummary__value}>
          {formatVolume(summary.volume)}
        </dd>
      </div>
    </dl>
  )
}
