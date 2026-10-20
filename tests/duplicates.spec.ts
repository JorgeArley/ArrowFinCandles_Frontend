import { describe, expect, it } from 'vitest'
import type { Candle } from '../src/modules/candles-chart/candles-chart.types'
import {
  aggregateCandles,
  toChartPoints,
} from '../src/modules/candles-chart/domain/candle-series'
import fixture from './fixtures/mes-5m.json'
import { resend, shuffle, withDuplicated } from './helpers/candles'

const candles: Candle[] = fixture.candles

describe('the duplicated rows', () => {
  it('a candle repeated does not duplicate the point in the series', () => {
    const points = toChartPoints(withDuplicated(candles, 10))

    expect(points).toHaveLength(candles.length)
  })

  it('a candle with volume 100 repeated does not produce a volume of 200', () => {
    const candle: Candle = {
      t: '2026-08-25T14:00:00Z',
      o: 100,
      h: 100,
      l: 100,
      c: 100,
      v: 100,
    }

    expect(aggregateCandles([candle, candle])?.volume).toBe(100)
  })

  it('resending the whole dataset does not change the summary', () => {
    expect(aggregateCandles(resend(candles))).toEqual(aggregateCandles(candles))
  })

  it('resending the whole dataset does not change the series', () => {
    expect(toChartPoints(resend(candles))).toEqual(toChartPoints(candles))
  })

  it('the result does not depend on the order the rows arrive in', () => {
    expect(toChartPoints(shuffle(candles, 7))).toEqual(toChartPoints(candles))
    expect(aggregateCandles(shuffle(candles, 7))).toEqual(aggregateCandles(candles))
  })
})
