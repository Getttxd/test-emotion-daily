import type { CreateEmotionLogInput, EmotionLog, UpdateEmotionLogInput } from '../domain/entities/emotion-log'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { EmotionLogRepository } from '../domain/repositories/emotion-log-repository'

const VALID_MOODS = ['happy', 'sad', 'angry', 'anxious', 'calm', 'tired', 'excited', 'grateful', 'lonely', 'stressed']
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export class EmotionLogService {
  constructor(private readonly emotionLogRepository: EmotionLogRepository) {}

  async listLogs(): Promise<EmotionLog[]> {
    return this.emotionLogRepository.findAll()
  }

  async getLog(id: string): Promise<EmotionLog> {
    const log = await this.emotionLogRepository.findById(id)
    if (!log) throw new NotFoundError('EmotionLog')
    return log
  }

  async getLogByDate(date: string): Promise<EmotionLog | null> {
    this.validateDateFormat(date)
    return this.emotionLogRepository.findByDate(date)
  }

  async createLog(input: CreateEmotionLogInput): Promise<EmotionLog> {
    this.validateMood(input.mood)
    this.validateIntensity(input.intensity)
    this.validateDateFormat(input.date)

    return this.emotionLogRepository.create({
      mood: input.mood,
      intensity: input.intensity,
      note: input.note ?? '',
      date: input.date,
    })
  }

  async updateLog(id: string, input: UpdateEmotionLogInput): Promise<EmotionLog> {
    if (input.mood !== undefined) this.validateMood(input.mood)
    if (input.intensity !== undefined) this.validateIntensity(input.intensity)
    if (input.date !== undefined) this.validateDateFormat(input.date)

    const updated = await this.emotionLogRepository.update(id, input)
    if (!updated) throw new NotFoundError('EmotionLog')
    return updated
  }

  async deleteLog(id: string): Promise<void> {
    const deleted = await this.emotionLogRepository.delete(id)
    if (!deleted) throw new NotFoundError('EmotionLog')
  }

  private validateMood(mood: string): void {
    if (!VALID_MOODS.includes(mood)) {
      throw new ValidationError(`mood must be one of: ${VALID_MOODS.join(', ')}`)
    }
  }

  private validateIntensity(intensity: number): void {
    if (!Number.isInteger(intensity) || intensity < 1 || intensity > 10) {
      throw new ValidationError('intensity must be an integer between 1 and 10')
    }
  }

  private validateDateFormat(date: string): void {
    if (!DATE_REGEX.test(date)) {
      throw new ValidationError('date must be in YYYY-MM-DD format')
    }
  }
}
