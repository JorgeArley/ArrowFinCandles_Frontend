# ArrowFin Candles Frontend

Web interface to browse the OHLCV candles served by the
[ArrowFin candles backend](../arrow-fin-candles_backend).

- `GET /candles?symbol=MES&tf=5m` returns the candles of a contract and a timeframe.
- The interface shows them as a **candlestick chart** (japanese candles), with a contract
  selector, a timeframe selector and the loading / error / success states of the request.
- The data is never re-aggregated in the browser: the backend already returns the candles of the
  requested timeframe.

---

## Requirements

| Tool | Version | Why |
| --- | --- | --- |
| Node.js | >= 22 (tested on 24) | Vite 8 and Vitest 5 |
| npm | >= 10 | Dependencies |

The candles API must be running in `http://localhost:3000` (see the backend README).

---

## Running the project

```bash
npm install
npm run dev
```

The interface is served in `http://localhost:5173`.

### Why a proxy

The backend does not enable CORS, and `http://localhost:5173` and `http://localhost:3000` are
different origins for the browser even when they share the host. The dev server proxies
`/api/*` to the backend, so the browser only talks to its own origin:

```
browser -> http://localhost:5173/api/candles?symbol=NQ&tf=15m
        -> proxy  -> http://localhost:3000/candles?symbol=NQ&tf=15m
```

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | Base URL of the candles API. Set it to `http://localhost:3000` only if the backend allows CORS. |
| `VITE_API_TARGET` | `http://localhost:3000` | Backend the dev proxy points to. Only used by `npm run dev`. |

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server with the proxy |
| `npm run build` | Type-checks every project and builds the production bundle |
| `npm run preview` | Serves the production build |
| `npm run lint` | ESLint over the whole repository |
| `npm test` | Runs the test suites once |
| `npm run test:watch` | Runs the test suites in watch mode |

---

## The interface

```
┌──────────────────────────────────────────────────────────┐
│  ArrowFin · Candles                        NQ · 15m      │
│  ┌────────────┐   ┌──────────────────┐                   │
│  │ MES │ NQ   │   │ 1m 5m 15m 1h     │                   │
│  └────────────┘   └──────────────────┘                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │           Candlestick chart of the candles          │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌──────┬──────┬──────┬──────┬──────────┐               │
│  │ Open │ High │ Low  │ Close│  Volume  │               │
│  └──────┴──────┴──────┴──────┴──────────┘               │
└──────────────────────────────────────────────────────────┘
```

| State | What the user sees |
| --- | --- |
| Loading | A pulsing skeleton and the message `Loading candles…` |
| Error | A readable message and a **Retry** button |
| Success | The chart and the summary of the session |

### The chart

| Aspect | Detail |
| --- | --- |
| Type | `candlestick`, provided by [chartjs-chart-financial](https://github.com/chartjs/chartjs-chart-financial) |
| Candle | Green when the close is above the open, red when it is below, grey when they are equal |
| Time axis | UTC, with the timestamp of every candle |
| Tooltip | Date and time (UTC), open, high, low, close and volume of the candle |
| Width of the candle | `barThickness: 'flex'`: each candle takes the space of its neighbours, so the same chart works with 7 candles and with 384 |

---

## Architecture

```
src/
├── config/env.ts                     Base URL of the API
├── shared/                           Reusable pieces, unaware of the candles feature
│   ├── ui/OptionGroup/               Segmented control used by both selectors
│   ├── ui/Spinner/
│   └── utils/                        Number and UTC date/time formatting
├── types/                            Types of the third party packages that do not ship their own
└── modules/candles-chart/            The feature
    ├── candles-chart.types.ts        Candle, ContractSymbol, Timeframe
    ├── candles-chart.constants.ts    Supported symbols and timeframes
    ├── domain/candle-series.ts       Deduplication, chart series and session aggregation
    ├── api/candles-api.ts            HTTP call and error translation
    ├── hooks/useCandles.ts           Loading / success / error state machine
    └── components/                   Selectors, chart, summary and states
```

The rules that are respected:

- The components **render**: they receive data and callbacks, they never fetch.
- The hook **decides**: it owns the request, the cancellation and the state of the request.
- `domain/` is **pure**: it knows neither React, nor HTTP, nor Chart.js, so it can be tested
  without mocks.
- The module is consumed through its `index.ts`, so the internals can be reorganised without
  touching `App.tsx`.

### Styles

- **Tailwind CSS v4** for the layout, spacing, typography and responsive rules (no
  `tailwind.config.js` is needed: the theme is configured in CSS).
- **CSS Modules with BEM naming** for the visual details of each component: the block is the
  component (`.candlesChart`), the elements are `block__element` and the modifiers are
  `block__element--modifier`.

---

## Tests

```bash
npm test
```

The suites live in `tests/` and run with Vitest over the pure domain layer:

| Suite | What it checks |
| --- | --- |
| `tests/aggregation.spec.ts` | That the aggregation calculations are correct: open, high, low, close, volume and count of the session, and that the chart series has one point per candle, uses the close price, is ordered and keeps the timestamps |
| `tests/duplicates.spec.ts` | That the duplicated rows do not change the result: a repeated candle does not duplicate the point of the series nor double the volume, resending the whole dataset changes neither the summary nor the series, and the order of the rows does not matter |

The fixture `tests/fixtures/mes-5m.json` is a real response of the API
(`GET /candles?symbol=MES&tf=5m`), so the expectations are checked against real data.

---

## The API

### `GET /candles`

| Parameter | Required | Accepted values |
| --- | --- | --- |
| `symbol` | yes | `MES`, `NQ` |
| `tf` | yes | `1m`, `5m`, `15m`, `1h` |

```json
{
  "symbol": "MES",
  "tf": "5m",
  "candles": [
    {
      "t": "2026-08-25T14:00:00Z",
      "o": 5635.75,
      "h": 5636.75,
      "l": 5627.5,
      "c": 5628.75,
      "v": 9940
    }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `t` | Start of the group, ISO-8601 in UTC |
| `o` | Open |
| `h` | High |
| `l` | Low |
| `c` | Close |
| `v` | Volume |

The backend answers `400` with a readable `message` when the symbol or the timeframe is not
supported, and `500` when it fails unexpectedly. The frontend shows that message as it is.

---

## Decisions

The reasoning behind the technical choices is in [DECISIONS.md](./DECISIONS.md).
