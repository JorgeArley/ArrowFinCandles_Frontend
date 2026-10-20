import { OptionGroup } from '../../../shared/ui/OptionGroup/OptionGroup'
import { SUPPORTED_TIMEFRAMES } from '../candles-chart.constants'
import type { Timeframe } from '../candles-chart.types'

const OPTIONS = SUPPORTED_TIMEFRAMES.map((timeframe) => ({ value: timeframe, label: timeframe }))

interface TimeframeSelectorProps {
  readonly value: Timeframe
  readonly onChange: (timeframe: Timeframe) => void
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return <OptionGroup label="Timeframe" options={OPTIONS} value={value} onChange={onChange} />
}
