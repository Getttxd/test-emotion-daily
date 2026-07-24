import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { EmotionLogRepository } from '../domain/repositories/emotion-log-repository'
import type { UserRepository } from '../domain/repositories/user-repository'
import { EmotionLogHandler } from '../handlers/emotion-log-handler'
import { UserHandler } from '../handlers/user-handler'
import { EmotionLogService } from '../services/emotion-log-service'
import { UserService } from '../services/user-service'

export interface Repositories {
  userRepository: UserRepository
  emotionLogRepository: EmotionLogRepository
  cacheRepository: CacheRepository
}

export interface Container {
  userHandler: UserHandler
  emotionLogHandler: EmotionLogHandler
}

export function createContainer(repos: Repositories): Container {
  const userService = new UserService(repos.userRepository, repos.cacheRepository)
  const emotionLogService = new EmotionLogService(repos.emotionLogRepository)

  return {
    userHandler: new UserHandler(userService),
    emotionLogHandler: new EmotionLogHandler(emotionLogService),
  }
}
