export interface EmotionLog {
  id: string
  mood: string
  intensity: number
  note: string
  date: string
  createdAt: string
}

export interface CreateEmotionLogInput {
  mood: string
  intensity: number
  note: string
  date: string
}

export interface UpdateEmotionLogInput {
  mood?: string
  intensity?: number
  note?: string
  date?: string
}
