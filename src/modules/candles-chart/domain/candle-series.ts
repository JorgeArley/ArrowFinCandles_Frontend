import type { Candle } from '../candles-chart.types'

export interface CandlePoint {
  readonly x: Date
  readonly y: number
  readonly volume: number
}

export interface CandleSummary {
  readonly open: number
  readonly high: number
  readonly low: number
  readonly close: number
  readonly volume: number
  readonly count: number
}

/**
 * Deja una sola vela por timestamp: el contrato de la API no garantiza unicidad y una vela
 * repetida no debe generar dos puntos ni duplicar el volumen.
 */
export function dedupeCandles(candles: readonly Candle[]): Candle[] {
  const byTimestamp = new Map<string, Candle>()

  for (const candle of candles) {
    byTimestamp.set(candle.t, candle)
  }

  return [...byTimestamp.values()]
}

export function sortCandlesByTime(candles: readonly Candle[]): Candle[] {
  return [...candles].sort((left, right) => timeOf(left) - timeOf(right))
}

/** Serie del gráfico: una vela de cierre por punto, de la más antigua a la más reciente. */
export function toChartPoints(candles: readonly Candle[]): CandlePoint[] {
  return sortCandlesByTime(dedupeCandles(candles)).map((candle) => ({
    x: new Date(candle.t),
    y: candle.c,
    volume: candle.v,
  }))
}

/** Agregación de la sesión: apertura, máximo, mínimo, cierre, volumen y número de velas. */
export function aggregateCandles(candles: readonly Candle[]): CandleSummary | null {
  const ordered = sortCandlesByTime(dedupeCandles(candles))
  const first = ordered[0]

  if (!first) return null

  let high = first.h
  let low = first.l
  let volume = 0

  for (const candle of ordered) {
    high = Math.max(high, candle.h)
    low = Math.min(low, candle.l)
    volume += candle.v
  }

  return {
    open: first.o,
    high,
    low,
    close: ordered[ordered.length - 1].c,
    volume,
    count: ordered.length,
  }
}

function timeOf(candle: Candle): number {
  return new Date(candle.t).getTime()
}
