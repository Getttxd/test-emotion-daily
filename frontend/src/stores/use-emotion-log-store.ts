import { defineStore } from 'pinia'
import { emotionLogApi } from '@/apis/emotion-log-api'
import type { CreateEmotionLogBody, EmotionLog, UpdateEmotionLogBody } from '@/models'

export const useEmotionLogStore = defineStore('EmotionLogStore', () => {
  const logs = ref<EmotionLog[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLogs() {
    isLoading.value = true
    error.value = null
    try {
      const res = await emotionLogApi.list()
      logs.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function createLog(body: CreateEmotionLogBody) {
    const res = await emotionLogApi.create(body)
    logs.value.unshift(res.data)
    return res.data
  }

  async function updateLog(id: string, body: UpdateEmotionLogBody) {
    const res = await emotionLogApi.update(id, body)
    const idx = logs.value.findIndex(l => l.id === id)
    if (idx !== -1) logs.value[idx] = res.data
    return res.data
  }

  async function deleteLog(id: string) {
    await emotionLogApi.remove(id)
    logs.value = logs.value.filter(l => l.id !== id)
  }

  return { logs, isLoading, error, fetchLogs, createLog, updateLog, deleteLog }
})
