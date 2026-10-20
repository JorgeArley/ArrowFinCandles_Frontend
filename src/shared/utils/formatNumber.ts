const PRICE_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const VOLUME_FORMATTER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export function formatPrice(value: number): string {
  return PRICE_FORMATTER.format(value)
}

export function formatVolume(value: number): string {
  return VOLUME_FORMATTER.format(value)
}
