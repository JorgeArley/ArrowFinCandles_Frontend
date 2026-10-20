const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

export function formatUtcTime(value: Date | number): string {
  return TIME_FORMATTER.format(new Date(value))
}

export function formatUtcDateTime(value: Date | number): string {
  return DATE_TIME_FORMATTER.format(new Date(value))
}
