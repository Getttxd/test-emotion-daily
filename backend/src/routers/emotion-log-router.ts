import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  createEmotionLogSchema,
  dateParamSchema,
  emotionLogListResponseSchema,
  emotionLogNullableResponseSchema,
  emotionLogResponseSchema,
  errorResponseSchema,
  idParamSchema,
  updateEmotionLogSchema,
} from '../schemas/emotion-log-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createEmotionLogRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/',
    describeRoute({
      tags: ['Emotion Logs'],
      summary: 'List all emotion logs',
      responses: {
        200: { description: 'All emotion logs', content: jsonContent(emotionLogListResponseSchema) },
      },
    }),
    (c) => c.get('container').emotionLogHandler.list(c)
  )

  router.get(
    '/date/:date',
    describeRoute({
      tags: ['Emotion Logs'],
      summary: 'Get emotion log by date',
      responses: {
        200: { description: 'Emotion log found', content: jsonContent(emotionLogResponseSchema) },
        404: { description: 'No log for this date', content: jsonContent(emotionLogNullableResponseSchema) },
      },
    }),
    validator('param', dateParamSchema),
    (c) => c.get('container').emotionLogHandler.getByDate(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Emotion Logs'],
      summary: 'Create an emotion log',
      responses: {
        201: { description: 'Emotion log created', content: jsonContent(emotionLogResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', createEmotionLogSchema),
    (c) => c.get('container').emotionLogHandler.create(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Emotion Logs'],
      summary: 'Get an emotion log by id',
      responses: {
        200: { description: 'Emotion log found', content: jsonContent(emotionLogResponseSchema) },
        404: { description: 'Emotion log not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').emotionLogHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['Emotion Logs'],
      summary: 'Update an emotion log',
      responses: {
        200: { description: 'Emotion log updated', content: jsonContent(emotionLogResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Emotion log not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    validator('json', updateEmotionLogSchema),
    (c) => c.get('container').emotionLogHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Emotion Logs'],
      summary: 'Delete an emotion log',
      responses: {
        204: { description: 'Emotion log deleted' },
        404: { description: 'Emotion log not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').emotionLogHandler.delete(c)
  )

  return router
}
