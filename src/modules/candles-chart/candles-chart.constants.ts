import type { ContractSymbol, Timeframe } from './candles-chart.types'

export const SUPPORTED_SYMBOLS = ['MES', 'NQ'] as const satisfies readonly ContractSymbol[]

export const SUPPORTED_TIMEFRAMES = ['1m', '5m', '15m', '1h'] as const satisfies readonly Timeframe[]
