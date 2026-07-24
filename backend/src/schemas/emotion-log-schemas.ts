import z from 'zod'

// HTTP contract schemas — used by routers for validation (hono-openapi
// validator) and OpenAPI spec generation. Keep in sync with domain entities.

const VALID_MOODS = ['happy', 'sad', 'angry', 'anxious', 'calm', 'tired', 'excited', 'grateful', 'lonely', 'stressed'] as const

export const emotionLogSchema = z.object({
  id: z.uuid(),
  mood: z.string(),
  intensity: z.number().int().min(1).max(10),
  note: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  createdAt: z.iso.datetime(),
})

export const createEmotionLogSchema = z.object({
  mood: z.enum(VALID_MOODS),
  intensity: z.number().int().min(1).max(10),
  note: z.string().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
})

export const updateEmotionLogSchema = z.object({
  mood: z.enum(VALID_MOODS).optional(),
  intensity: z.number().int().min(1).max(10).optional(),
  note: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD').optional(),
})

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
})

export const emotionLogResponseSchema = z.object({ data: emotionLogSchema })
export const emotionLogNullableResponseSchema = z.object({ data: emotionLogSchema.nullable() })
export const emotionLogListResponseSchema = z.object({ data: z.array(emotionLogSchema) })

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
