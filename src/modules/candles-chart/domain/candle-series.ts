import type { Candle } from '../candles-chart.types'

export interface CandlePoint {
  /** Epoch en milisegundos: el grafico financiero trabaja con marcas de tiempo numericas. */
  readonly x: number
  readonly o: number
  readonly h: number
  readonly l: number
  readonly c: number
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

export interface PriceBounds {
  readonly min: number
  readonly max: number
}

/**
 * Deja una sola vela por timestamp: el contrato de la API no garantiza unicidad y una vela
 * repetida no debe generar dos velas ni duplicar el volumen.
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

/** Serie del gráfico: una vela con su OHLC por punto, de la más antigua a la más reciente. */
export function toCandlePoints(candles: readonly Candle[]): CandlePoint[] {
  return sortCandlesByTime(dedupeCandles(candles)).map((candle) => ({
    x: timeOf(candle),
    o: candle.o,
    h: candle.h,
    l: candle.l,
    c: candle.c,
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

/**
 * Rango del eje de precios con un margen: el gráfico necesita unos limites propios porque una
 * sola vela no define un rango util en el eje de valores.
 */
export function priceBounds(candles: readonly Candle[]): PriceBounds | null {
  const ordered = sortCandlesByTime(dedupeCandles(candles))
  const first = ordered[0]

  if (!first) return null

  let min = first.l
  let max = first.h

  for (const candle of ordered) {
    min = Math.min(min, candle.l)
    max = Math.max(max, candle.h)
  }

  const padding = (max - min) * 0.05 || Math.max(Math.abs(max) * 0.001, 1)

  return { min: min - padding, max: max + padding }
}

function timeOf(candle: Candle): number {
  return new Date(candle.t).getTime()
}
