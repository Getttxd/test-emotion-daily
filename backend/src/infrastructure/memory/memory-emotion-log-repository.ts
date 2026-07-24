import type { CreateEmotionLogInput, EmotionLog, UpdateEmotionLogInput } from '../../domain/entities/emotion-log'
import type { EmotionLogRepository } from '../../domain/repositories/emotion-log-repository'

// Reference implementation for runtimes without D1 (AWS Lambda, local tests).
export class MemoryEmotionLogRepository implements EmotionLogRepository {
  private readonly logs = new Map<string, EmotionLog>()

  async findAll(): Promise<EmotionLog[]> {
    return [...this.logs.values()].sort((a, b) => b.date.localeCompare(a.date))
  }

  async findByDate(date: string): Promise<EmotionLog | null> {
    return [...this.logs.values()].find((l) => l.date === date) ?? null
  }

  async findById(id: string): Promise<EmotionLog | null> {
    return this.logs.get(id) ?? null
  }

  async create(input: CreateEmotionLogInput): Promise<EmotionLog> {
    const log: EmotionLog = {
      id: crypto.randomUUID(),
      mood: input.mood,
      intensity: input.intensity,
      note: input.note,
      date: input.date,
      createdAt: new Date().toISOString(),
    }
    this.logs.set(log.id, log)
    return log
  }

  async update(id: string, input: UpdateEmotionLogInput): Promise<EmotionLog | null> {
    const existing = this.logs.get(id)
    if (!existing) return null
    const updated: EmotionLog = {
      ...existing,
      mood: input.mood ?? existing.mood,
      intensity: input.intensity ?? existing.intensity,
      note: input.note ?? existing.note,
      date: input.date ?? existing.date,
    }
    this.logs.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.logs.delete(id)
  }
}
