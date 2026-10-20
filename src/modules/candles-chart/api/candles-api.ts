import { API_BASE_URL } from '../../../config/env'
import type { Candle, CandlesResponse, ContractSymbol, Timeframe } from '../candles-chart.types'

const NETWORK_ERROR_MESSAGE =
  'Could not reach the candles service. Is the backend running on port 3000?'
const UNSUPPORTED_REQUEST_MESSAGE = 'The requested symbol or timeframe is not supported.'
const SERVER_ERROR_MESSAGE = 'The candles service is not available right now. Please try again.'
const INVALID_RESPONSE_MESSAGE = 'The candles service returned an unexpected response.'

export class CandlesApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'CandlesApiError'
    this.status = status
  }
}

export async function fetchCandles(
  symbol: ContractSymbol,
  tf: Timeframe,
  signal: AbortSignal,
): Promise<Candle[]> {
  const url = `${API_BASE_URL}/candles?symbol=${encodeURIComponent(symbol)}&tf=${encodeURIComponent(tf)}`
  const response = await request(url, signal)

  if (!response.ok) throw await toApiError(response)

  return parseCandles(response)
}

async function request(url: string, signal: AbortSignal): Promise<Response> {
  try {
    return await fetch(url, { signal, headers: { Accept: 'application/json' } })
  } catch (error) {
    if (isAbortError(error)) throw error

    throw new CandlesApiError(NETWORK_ERROR_MESSAGE, 0)
  }
}

async function toApiError(response: Response): Promise<CandlesApiError> {
  if (response.status >= 500) {
    return new CandlesApiError(SERVER_ERROR_MESSAGE, response.status)
  }

  return new CandlesApiError((await readErrorMessage(response)) ?? UNSUPPORTED_REQUEST_MESSAGE, response.status)
}

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json()

    if (typeof body === 'object' && body !== null && 'message' in body) {
      const { message } = body as { message: unknown }

      if (typeof message === 'string' && message.length > 0) return message
    }

    return null
  } catch {
    return null
  }
}

async function parseCandles(response: Response): Promise<Candle[]> {
  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new CandlesApiError(INVALID_RESPONSE_MESSAGE, response.status)
  }

  const candles = (payload as CandlesResponse | null)?.candles

  if (!Array.isArray(candles)) {
    throw new CandlesApiError(INVALID_RESPONSE_MESSAGE, response.status)
  }

  return candles
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
