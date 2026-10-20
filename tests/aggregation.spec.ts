import { describe, expect, it } from 'vitest'
import type { Candle } from '../src/modules/candles-chart/candles-chart.types'
import {
  aggregateCandles,
  priceBounds,
  toCandlePoints,
} from '../src/modules/candles-chart/domain/candle-series'
import fixture from './fixtures/mes-5m.json'

const candles: Candle[] = fixture.candles
const sortedCandles = [...candles].sort((left, right) => left.t.localeCompare(right.t))

describe('the aggregation of the candles', () => {
  it('the summary open is the open of the first candle', () => {
    expect(aggregateCandles(candles)?.open).toBe(5630)
  })

  it('the summary high is the highest high', () => {
    expect(aggregateCandles(candles)?.high).toBe(5672.5)
  })

  it('the summary low is the lowest low', () => {
    expect(aggregateCandles(candles)?.low).toBe(5623.75)
  })

  it('the summary close is the close of the last candle', () => {
    expect(aggregateCandles(candles)?.close).toBe(5652.75)
  })

  it('the summary volume is the sum of the volumes', () => {
    expect(aggregateCandles(candles)?.volume).toBe(563044)
  })

  it('the summary counts every candle once', () => {
    expect(aggregateCandles(candles)?.count).toBe(78)
  })

  it('the 14:00 group matches the documented example', () => {
    const group = candles.find((candle) => candle.t === '2026-08-25T14:00:00Z')

    expect(group).toEqual({
      t: '2026-08-25T14:00:00Z',
      o: 5635.75,
      h: 5636.75,
      l: 5627.5,
      c: 5628.75,
      v: 9940,
    })
  })

  it('the price bounds cover the lowest low and the highest high', () => {
    const bounds = priceBounds(candles)

    expect(bounds?.min).toBeLessThanOrEqual(5623.75)
    expect(bounds?.max).toBeGreaterThanOrEqual(5672.5)
  })

  it('the price bounds leave a margin around the candles', () => {
    const bounds = priceBounds(candles)

    expect(bounds?.min).toBeLessThan(5623.75)
    expect(bounds?.max).toBeGreaterThan(5672.5)
  })
})

describe('the series of the chart', () => {
  it('the series has one point per candle', () => {
    expect(toCandlePoints(candles)).toHaveLength(78)
  })

  it('the series carries the OHLC values of its candle', () => {
    expect(toCandlePoints(candles).map((point) => [point.o, point.h, point.l, point.c])).toEqual(
      sortedCandles.map((candle) => [candle.o, candle.h, candle.l, candle.c]),
    )
  })

  it('the series is ordered from oldest to newest', () => {
    const timestamps = toCandlePoints(candles).map((point) => point.x)

    expect(timestamps).toEqual([...timestamps].sort((left, right) => left - right))
    expect(new Set(timestamps).size).toBe(timestamps.length)
  })

  it('the series keeps the candle timestamps', () => {
    expect(toCandlePoints(candles).map((point) => new Date(point.x).toISOString())).toEqual(
      sortedCandles.map((candle) => new Date(candle.t).toISOString()),
    )
  })

  it('a payload with a single candle produces a single point', () => {
    const single: Candle[] = [
      {
        t: '2026-08-25T14:00:00Z',
        o: 5635.75,
        h: 5636.75,
        l: 5627.5,
        c: 5628.75,
        v: 9940,
      },
    ]

    const points = toCandlePoints(single)

    expect(points).toHaveLength(1)
    expect(points[0]).toMatchObject({ o: 5635.75, h: 5636.75, l: 5627.5, c: 5628.75 })
    expect(aggregateCandles(single)?.count).toBe(1)
  })
})
