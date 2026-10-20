import type { Candle } from '../../src/modules/candles-chart/candles-chart.types'

/** Inserta de nuevo una vela, simulando el reenvio de una fila ya recibida. */
export function withDuplicated(candles: readonly Candle[], index: number): Candle[] {
  const result = [...candles]

  result.splice(index + 1, 0, candles[index])

  return result
}

/** Reenvia el conjunto completo de velas, como hace la API cuando recibe el dataset otra vez. */
export function resend(candles: readonly Candle[]): Candle[] {
  return [...candles, ...candles]
}

/** Barajado determinista: el mismo seed produce siempre el mismo orden. */
export function shuffle(candles: readonly Candle[], seed = 1): Candle[] {
  const result = [...candles]
  let state = seed

  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) % 4294967296
    const target = Math.floor((state / 4294967296) * (index + 1))
    const swap = result[index]

    result[index] = result[target]
    result[target] = swap
  }

  return result
}
