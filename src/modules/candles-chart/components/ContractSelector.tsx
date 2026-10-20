import { OptionGroup } from '../../../shared/ui/OptionGroup/OptionGroup'
import { SUPPORTED_SYMBOLS } from '../candles-chart.constants'
import type { ContractSymbol } from '../candles-chart.types'

const OPTIONS = SUPPORTED_SYMBOLS.map((symbol) => ({ value: symbol, label: symbol }))

interface ContractSelectorProps {
  readonly value: ContractSymbol
  readonly onChange: (symbol: ContractSymbol) => void
}

export function ContractSelector({ value, onChange }: ContractSelectorProps) {
  return <OptionGroup label="Contract" options={OPTIONS} value={value} onChange={onChange} />
}
