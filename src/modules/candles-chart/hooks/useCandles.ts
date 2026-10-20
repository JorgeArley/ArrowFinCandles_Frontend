import { useCallback, useEffect, useState } from 'react'
import { fetchCandles } from '../api/candles-api'
import type { Candle, ContractSymbol, Timeframe } from '../candles-chart.types'

export type CandlesStatus = 'loading' | 'success' | 'error'

export interface CandlesState {
  readonly status: CandlesStatus
  readonly candles: Candle[]
  readonly errorMessage: string | null
}

export interface UseCandlesResult extends CandlesState {
  readonly reload: () => void
}

interface CandlesResult {
  readonly key: string
  readonly candles: Candle[]
  readonly errorMessage: string | null
}

export function useCandles(symbol: ContractSymbol, tf: Timeframe): UseCandlesResult {
  const [requestId, setRequestId] = useState(0)
  const [result, setResult] = useState<CandlesResult | null>(null)
  const key = `${symbol}-${tf}-${requestId}`

  useEffect(() => {
    const controller = new AbortController()

    fetchCandles(symbol, tf, controller.signal)
      .then((candles) => {
        if (controller.signal.aborted) return

        setResult({ key, candles, errorMessage: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        setResult({ key, candles: [], errorMessage: toErrorMessage(error) })
      })

    return () => controller.abort()
  }, [symbol, tf, requestId, key])

  const reload = useCallback(() => setRequestId((id) => id + 1), [])

  // Mientras se pide una combinación nueva se conservan las velas anteriores: el grafico no
  // desaparece y la transicion hacia los datos nuevos se dibuja en lugar de aparecer de golpe.
  const current = result?.key === key ? result : null

  return {
    status: current === null ? 'loading' : current.errorMessage === null ? 'success' : 'error',
    candles: result?.candles ?? [],
    errorMessage: current?.errorMessage ?? null,
    reload,
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) return error.message

  return 'Something went wrong while loading the candles.'
}
