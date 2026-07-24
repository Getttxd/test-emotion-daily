import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { createEmotionLogRouter } from './emotion-log-router'
import { createUserRouter } from './user-router'

export function createApiRouter() {
  const api = new Hono<AppEnv>()

  api.route('/users', createUserRouter())
  api.route('/emotion-logs', createEmotionLogRouter())

  return api
}
