import { useState, type CSSProperties } from 'react'
import { createPayment } from '../api/payments'

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '24px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    margin: 0,
  },
  description: {
    fontSize: '16px',
    color: '#666',
    maxWidth: '360px',
    margin: 0,
    lineHeight: 1.5,
  },
  button: {
    fontSize: '18px',
    padding: '14px 32px',
    border: 'none',
    borderRadius: '8px',
    background: '#1a1a1a',
    color: '#fff',
    cursor: 'pointer',
    marginTop: '8px',
  },
  buttonDisabled: {
    background: '#999',
    cursor: 'default',
  },
  error: {
    color: '#c0392b',
    fontSize: '14px',
    margin: 0,
  },
} satisfies Record<string, CSSProperties>

function HomePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    setLoading(true)
    setError(null)
    try {
      const { url, token } = await createPayment()
      localStorage.setItem('access_token', token)
      window.location.href = url
    } catch {
      setError('Не получилось создать платёж. Попробуйте ещё раз.')
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>PaySomeMoney</h1>
      <p style={styles.description}>
        Нажми кнопку и заплати 55 рублей. Без причины, без подписки, без
        смысла — просто потому что можешь.
      </p>
      <button
        style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? 'Подождите...' : 'Заплатить 55 ₽'}
      </button>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  )
}

export default HomePage
