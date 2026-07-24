export const MOODS = [
  'happy',
  'sad',
  'angry',
  'anxious',
  'calm',
  'tired',
  'excited',
  'grateful',
  'lonely',
  'stressed',
] as const

export type Mood = typeof MOODS[number]

export interface EmotionLog {
  id: string
  mood: Mood
  intensity: number
  note: string
  date: string
  createdAt: string
}

export interface CreateEmotionLogBody {
  mood: Mood
  intensity: number
  note: string
  date: string
}

export interface UpdateEmotionLogBody {
  mood?: Mood
  intensity?: number
  note?: string
  date?: string
}

export interface EmotionLogListResponse {
  data: EmotionLog[]
}

export interface EmotionLogResponse {
  data: EmotionLog
}

export interface EmotionLogNullableResponse {
  data: EmotionLog | null
}
