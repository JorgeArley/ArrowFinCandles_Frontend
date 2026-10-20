# Prompts

## Prompt 1

Exact text of the prompt I used.

- Kept: the separation between the aggregation logic and the controller.
- Modified: the handling of the input parameters.
- Discarded: the extra complexity the exercise did not need.

## Prompt 2

Exact text of the prompt I used.

> Create a plan to consume and display the data returned by this endpoint:
> `localhost:3000/candles?symbol=NQ&tf=15m`.
>
> The interface must have three fundamental elements:
>
> - Contract selector: MES or NQ.
> - Timeframe selector: 1m, 5m, 15m or 1h.
> - Chart with the results of the API.
>
> You can use a line with the close prices, which is a simpler solution.
>
> You must also implement the states of the request:
>
> - Loading: show a message or an indicator while the data is loading.
> - Error: show a readable message if the API fails.
> - Success: render the chart with the received candles.
>
> Use clean code, BEM and modules for the visuals, Chart.js for the chart and Tailwind CSS,
> everything in English.

And, when reviewing the plan:

> Add these two tests: one that checks that the aggregation calculations of the candles are
> correct. Another one that demonstrates that the duplicated rows of the dataset do not change the
> result.

- **Kept**: the three elements of the interface (contract selector, timeframe selector and
  chart), the three states of the request and the line of close prices as the solution for the
  chart.
- **Modified**: how the API is reached. The frontend and the backend share the host but not the
  port, and the backend does not enable CORS, so instead of calling `http://localhost:3000`
  directly the frontend requests `/api/candles` and the Vite dev server proxies it to
  `http://localhost:3000`. That way the browser only talks to its own origin.
- **Modified**: where the logic lives. Instead of the React component holding the calculations,
  there is a pure module (`domain/candle-series.ts`) that deduplicates the candles, builds the
  chart series and summarises the session. That way the two requested tests are written against
  code with no React and no network.
- **Discarded**: the candlestick chart. The backend already returns the series aggregated for the
  requested timeframe, so there was no need to group by timeframe again in the browser.
- **Discarded**: auto-refresh and polling: they were not requested and they add state nobody
  reads.
- **Discarded**: an HTTP client library (React Query, SWR). One request, one hook and an
  `AbortController` cover the case without adding dependencies.

### Technical decisions

| Decision | Why |
| --- | --- |
| Vite proxy instead of `enableCors()` in the backend | It solves the problem without touching the backend repository; `VITE_API_BASE_URL` stays available for deployments on another origin |
| Request state derived from the request key (`symbol-tf-requestId`) | It avoids calling `setState` synchronously inside the effect and discards any response that arrives late |
| `AbortController` in the effect cleanup | A quick selector change cannot paint the data of the previous request |
| Time axis with `chartjs-adapter-date-fns` and UTC labels | The data is UTC; showing it in the browser time zone would make every label doubtful |
| A repeated candle duplicates neither the point nor the volume | The API contract does not guarantee uniqueness and the chart cannot have two points at the same instant |
| Tailwind v4 without `tailwind.config.js` and CSS Modules for the visual detail | Tailwind covers layout and responsive rules; the BEM modules cover the style of each component without filling the JSX with utilities |
| The previous chart is kept during the load and an overlay is placed on top | The chart does not disappear: when the data arrives, Chart.js animates the transition instead of drawing it all at once |
| The previous candles are kept in the hook while another combination is requested | That is what allows the chart to stay visible during the load |
| Sliding indicator in the selectors instead of only changing the colour of the option | The movement communicates which option is active; the colour just jumps |
| The summary values are remounted when they change | The `key` restarts the entry CSS animation: the new number appears with a short movement instead of jumping |
| `width: 100%` on the canvas container | Its parent is a flex column with `align-items: center`, which shrinks it to the canvas size (300px by default) and the chart is drawn in a narrow strip |
