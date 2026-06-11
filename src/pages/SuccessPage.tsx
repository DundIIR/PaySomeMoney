import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ApiError, getStats, type StatsResponse } from '../api/payments'
import styles from './SuccessPage.module.css'

const POLL_INTERVAL_MS = 3000
const MAX_ATTEMPTS = 40 // 40 × 3 секунды = 2 минуты

type State =
  | { kind: 'polling' }
  | { kind: 'no-token' }
  | { kind: 'failed'; message: string }
  | { kind: 'success'; stats: StatsResponse }

function SuccessPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<State>({ kind: 'polling' })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setState({ kind: 'no-token' })
      return
    }

    let attempts = 0
    let stopped = false

    const intervalId = setInterval(async () => {
      attempts += 1
      try {
        const stats = await getStats(token)
        if (stopped) return
        clearInterval(intervalId)
        setState({ kind: 'success', stats })
      } catch (e) {
        if (stopped) return
        if (e instanceof ApiError && e.status === 403) {
          // платёж ещё pending — ждём следующей попытки
          if (attempts >= MAX_ATTEMPTS) {
            clearInterval(intervalId)
            setState({
              kind: 'failed',
              message: 'Что-то пошло не так. Проверьте оплату или напишите нам.',
            })
          }
          return
        }
        clearInterval(intervalId)
        setState({
          kind: 'failed',
          message: 'Не получилось проверить оплату. Попробуйте позже.',
        })
      }
    }, POLL_INTERVAL_MS)

    return () => {
      stopped = true
      clearInterval(intervalId)
    }
  }, [])

  if (state.kind === 'polling') {
    return (
      <div className={styles.page}>
        <p className={styles.message}>
          Подтверждаем оплату
          <span className={styles.dots}>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>
    )
  }

  if (state.kind === 'no-token') {
    return (
      <div className={styles.page}>
        <p className={styles.message}>Токен не найден. Попробуйте оплатить снова.</p>
        <button className={styles.button} onClick={() => navigate('/')}>
          На главную
        </button>
      </div>
    )
  }

  if (state.kind === 'failed') {
    return (
      <div className={styles.page}>
        <p className={styles.message}>{state.message}</p>
        <button className={styles.button} onClick={() => navigate('/')}>
          На главную
        </button>
      </div>
    )
  }

  const { stats } = state
  return (
    <div className={styles.page}>
      <p className={styles.total}>
        {stats.total_count} человек / {stats.total_amount} ₽
      </p>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.daily}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--accent)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SuccessPage
