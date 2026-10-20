import type { CSSProperties } from 'react'
import styles from './OptionGroup.module.css'

export interface OptionGroupOption<TValue extends string> {
  readonly value: TValue
  readonly label: string
}

interface OptionGroupProps<TValue extends string> {
  readonly label: string
  readonly options: readonly OptionGroupOption<TValue>[]
  readonly value: TValue
  readonly onChange: (value: TValue) => void
}

export function OptionGroup<TValue extends string>({
  label,
  options,
  value,
  onChange,
}: OptionGroupProps<TValue>) {
  const activeIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  )

  const indicatorStyle = {
    '--option-count': options.length,
    transform: `translateX(${activeIndex * 100}%)`,
  } as CSSProperties

  return (
    <div className={styles.optionGroup} role="radiogroup" aria-label={label}>
      <span className={styles.optionGroup__indicator} style={indicatorStyle} aria-hidden="true" />

      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`${styles.optionGroup__option} ${
              isActive ? styles['optionGroup__option--active'] : ''
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
