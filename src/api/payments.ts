const BASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export interface StatsResponse {
  total_count: number
  total_amount: number
  daily: { date: string; count: number; amount: number }[]
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function createPayment(): Promise<{ url: string; token: string }> {
  const response = await fetch(`${BASE_URL}/functions/v1/create-payment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ANON_KEY}` },
  })
  if (!response.ok) {
    throw new ApiError('Failed to create payment', response.status)
  }
  const data = await response.json()
  return { url: data.confirmation_url, token: data.access_token }
}

export async function getStats(token: string): Promise<StatsResponse> {
  const response = await fetch(
    `${BASE_URL}/functions/v1/get-stats?token=${encodeURIComponent(token)}`,
  )
  if (!response.ok) {
    // 403 во время поллинга = платёж ещё не подтверждён вебхуком
    throw new ApiError('Failed to get stats', response.status)
  }
  return response.json()
}
