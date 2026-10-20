import styles from './Spinner.module.css'

interface SpinnerProps {
  readonly label?: string
}

export function Spinner({ label = 'Loading' }: SpinnerProps) {
  return <span className={styles.spinner} role="status" aria-label={label} />
}
