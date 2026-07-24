import type { CreateEmotionLogBody, EmotionLogListResponse, EmotionLogNullableResponse, EmotionLogResponse, UpdateEmotionLogBody } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/emotion-logs`

export const emotionLogApi = {
  list: () => request<EmotionLogListResponse>(BASE),
  get: (id: string) => request<EmotionLogResponse>(`${BASE}/${id}`),
  getByDate: (date: string) => request<EmotionLogNullableResponse>(`${BASE}/date/${date}`),
  create: (body: CreateEmotionLogBody) => request<EmotionLogResponse>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateEmotionLogBody) => request<EmotionLogResponse>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
