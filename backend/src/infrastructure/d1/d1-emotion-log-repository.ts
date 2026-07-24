import type { CreateEmotionLogInput, EmotionLog, UpdateEmotionLogInput } from '../../domain/entities/emotion-log'
import type { EmotionLogRepository } from '../../domain/repositories/emotion-log-repository'

interface EmotionLogRow {
  id: string
  mood: string
  intensity: number
  note: string
  date: string
  created_at: string
}

function toEmotionLog(row: EmotionLogRow): EmotionLog {
  return {
    id: row.id,
    mood: row.mood,
    intensity: row.intensity,
    note: row.note,
    date: row.date,
    createdAt: row.created_at,
  }
}

export class D1EmotionLogRepository implements EmotionLogRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<EmotionLog[]> {
    const { results } = await this.db
      .prepare('SELECT id, mood, intensity, note, date, created_at FROM emotion_logs ORDER BY date DESC, created_at DESC')
      .all<EmotionLogRow>()
    return results.map(toEmotionLog)
  }

  async findByDate(date: string): Promise<EmotionLog | null> {
    const row = await this.db
      .prepare('SELECT id, mood, intensity, note, date, created_at FROM emotion_logs WHERE date = ?')
      .bind(date)
      .first<EmotionLogRow>()
    return row ? toEmotionLog(row) : null
  }

  async findById(id: string): Promise<EmotionLog | null> {
    const row = await this.db
      .prepare('SELECT id, mood, intensity, note, date, created_at FROM emotion_logs WHERE id = ?')
      .bind(id)
      .first<EmotionLogRow>()
    return row ? toEmotionLog(row) : null
  }

  async create(input: CreateEmotionLogInput): Promise<EmotionLog> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO emotion_logs (id, mood, intensity, note, date, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, input.mood, input.intensity, input.note, input.date, createdAt)
      .run()
    return { id, mood: input.mood, intensity: input.intensity, note: input.note, date: input.date, createdAt }
  }

  async update(id: string, input: UpdateEmotionLogInput): Promise<EmotionLog | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const mood = input.mood ?? existing.mood
    const intensity = input.intensity ?? existing.intensity
    const note = input.note ?? existing.note
    const date = input.date ?? existing.date
    await this.db
      .prepare('UPDATE emotion_logs SET mood = ?, intensity = ?, note = ?, date = ? WHERE id = ?')
      .bind(mood, intensity, note, date, id)
      .run()
    return { ...existing, mood, intensity, note, date }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM emotion_logs WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }
}
