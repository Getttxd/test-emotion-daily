import type { CreateEmotionLogInput, EmotionLog, UpdateEmotionLogInput } from '../entities/emotion-log'

export interface EmotionLogRepository {
  findAll(): Promise<EmotionLog[]>
  findByDate(date: string): Promise<EmotionLog | null>
  findById(id: string): Promise<EmotionLog | null>
  create(input: CreateEmotionLogInput): Promise<EmotionLog>
  update(id: string, input: UpdateEmotionLogInput): Promise<EmotionLog | null>
  delete(id: string): Promise<boolean>
}
