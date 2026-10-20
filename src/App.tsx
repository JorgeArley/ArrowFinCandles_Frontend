import { useState } from 'react'
import {
  CandlesChart,
  CandlesSummary,
  ChartState,
  ContractSelector,
  TimeframeSelector,
  useCandles,
  type ContractSymbol,
  type Timeframe,
} from './modules/candles-chart'

function App() {
  const [symbol, setSymbol] = useState<ContractSymbol>('NQ')
  const [timeframe, setTimeframe] = useState<Timeframe>('15m')
  const { status, candles, errorMessage, reload } = useCandles(symbol, timeframe)

  const hasCandles = candles.length > 0

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-200 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">ArrowFin · Candles</h1>
          <p className="text-sm text-slate-400">
            {symbol} · {timeframe}
            {hasCandles ? ` · ${candles.length} candles` : ''}
          </p>
        </header>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ContractSelector value={symbol} onChange={setSymbol} />
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
          <ChartState
            status={status}
            errorMessage={errorMessage}
            hasData={hasCandles}
            onRetry={reload}
          >
            <CandlesChart candles={candles} tf={timeframe} />
          </ChartState>

          {hasCandles && (
            <div className="mt-6 border-t border-slate-800 pt-4">
              <CandlesSummary candles={candles} />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
