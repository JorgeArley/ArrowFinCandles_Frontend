import type { ReactNode } from 'react'
import { Spinner } from '../../../shared/ui/Spinner/Spinner'
import type { CandlesStatus } from '../hooks/useCandles'
import styles from './ChartState.module.css'

interface ChartStateProps {
  readonly status: CandlesStatus
  readonly errorMessage: string | null
  readonly hasData: boolean
  readonly onRetry: () => void
  readonly children: ReactNode
}

export function ChartState({ status, errorMessage, hasData, onRetry, children }: ChartStateProps) {
  if (status === 'error') {
    return (
      <div className={styles.chartState} role="alert">
        <div className={styles.chartState__panel}>
          <p className={styles.chartState__message}>Could not load the candles</p>
          <p className={styles.chartState__detail}>{errorMessage ?? 'Unexpected error.'}</p>
          <button type="button" className={styles.chartState__retry} onClick={onRetry}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className={styles.chartState}>
        {status === 'loading' ? (
          <div className={styles.chartState__skeleton} aria-hidden="true" />
        ) : (
          <p className={styles.chartState__message}>No candles available for this combination.</p>
        )}
      </div>
    )
  }

  return (
    <div className={styles.chartState}>
      {children}

      {status === 'loading' && (
        <div className={styles.chartState__overlay}>
          <Spinner label="Loading candles" />
          <span>Loading candles…</span>
        </div>
      )}
    </div>
  )
}
