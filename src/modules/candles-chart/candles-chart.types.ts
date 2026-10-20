export type ContractSymbol = 'MES' | 'NQ'

export type Timeframe = '1m' | '5m' | '15m' | '1h'

export interface Candle {
  readonly t: string
  readonly o: number
  readonly h: number
  readonly l: number
  readonly c: number
  readonly v: number
}

export interface CandlesResponse {
  readonly symbol: ContractSymbol
  readonly tf: Timeframe
  readonly candles: Candle[]
}
