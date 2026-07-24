import type { Context } from 'hono'
import type { CreateEmotionLogInput, UpdateEmotionLogInput } from '../domain/entities/emotion-log'
import { ValidationError } from '../domain/errors'
import type { EmotionLogService } from '../services/emotion-log-service'

export class EmotionLogHandler {
  constructor(private readonly emotionLogService: EmotionLogService) {}

  list = async (c: Context) => {
    const logs = await this.emotionLogService.listLogs()
    return c.json({ data: logs })
  }

  get = async (c: Context) => {
    const log = await this.emotionLogService.getLog(this.param(c, 'id'))
    return c.json({ data: log })
  }

  getByDate = async (c: Context) => {
    const log = await this.emotionLogService.getLogByDate(this.param(c, 'date'))
    if (!log) return c.json({ data: null }, 404)
    return c.json({ data: log })
  }

  create = async (c: Context) => {
    const body = await this.parseJson<CreateEmotionLogInput>(c)
    const log = await this.emotionLogService.createLog(body)
    return c.json({ data: log }, 201)
  }

  update = async (c: Context) => {
    const body = await this.parseJson<UpdateEmotionLogInput>(c)
    const log = await this.emotionLogService.updateLog(this.param(c, 'id'), body)
    return c.json({ data: log })
  }

  delete = async (c: Context) => {
    await this.emotionLogService.deleteLog(this.param(c, 'id'))
    return c.body(null, 204)
  }

  private param(c: Context, name: string): string {
    const value = c.req.param(name)
    if (!value) throw new ValidationError(`${name} param is required`)
    return value
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
