<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useSEO } from '@/composables/useSEO'
import { useEmotionLogStore } from '@/stores/use-emotion-log-store'

const { t } = useI18n()

useSEO({
  title: 'Daily-Emotion - Dashboard',
  description: t('dashboard.title'),
})

const emotionLogStore = useEmotionLogStore()
const { logs, isLoading } = storeToRefs(emotionLogStore)

const moodColors: Record<string, string> = {
  happy: '#FFD700',
  sad: '#6C63FF',
  angry: '#FF4757',
  anxious: '#FFA502',
  calm: '#2ED573',
  tired: '#747D8C',
  excited: '#FF6B81',
  grateful: '#A29BFE',
  lonely: '#636E72',
  stressed: '#E17055',
}

const moodIcons: Record<string, string> = {
  happy: 'ri-emotion-happy-line',
  sad: 'ri-emotion-sad-line',
  angry: 'ri-emotion-angry-line',
  anxious: 'ri-emotion-unhappy-line',
  calm: 'ri-emotion-normal-line',
  tired: 'ri-emotion-tired-line',
  excited: 'ri-emotion-laugh-line',
  grateful: 'ri-heart-line',
  lonely: 'ri-emotion-sad-line',
  stressed: 'ri-emotion-angry-line',
}

const totalLogs = computed(() => logs.value.length)

const avgIntensity = computed(() => {
  if (logs.value.length === 0) return 0
  const sum = logs.value.reduce((acc, log) => acc + log.intensity, 0)
  return (sum / logs.value.length).toFixed(1)
})

const todayMood = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return logs.value.find(log => log.date === today) ?? null
})

const streak = computed(() => {
  if (logs.value.length === 0) return 0
  // Sort unique dates descending
  const dates = [...new Set(logs.value.map(l => l.date))].sort().reverse()
  let count = 0
  const today = new Date()
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    const expectedStr = expected.toISOString().slice(0, 10)
    if (dates[i] === expectedStr) count++
    else break
  }
  return count
})

const moodDistribution = computed(() => {
  const counts: Record<string, number> = {}
  logs.value.forEach(log => {
    counts[log.mood] = (counts[log.mood] || 0) + 1
  })
  const total = logs.value.length || 1
  return Object.entries(counts)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / total) * 100),
      color: moodColors[mood] || '#ccc',
      icon: moodIcons[mood] || 'ri-emotion-line',
    }))
    .sort((a, b) => b.count - a.count)
})

const recentLogs = computed(() =>
  logs.value.slice(0, 5)
)

function moodLabel(mood: string) {
  return t(`emotionLog.moodOptions.${mood}`)
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

onMounted(async () => {
  await emotionLogStore.fetchLogs()
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">{{ t('dashboard.title') }}</h1>

    <!-- Stats Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="primary" variant="tonal" size="48">
              <VIcon icon="ri-emotion-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">{{ t('dashboard.totalLogs') }}</div>
              <div class="text-h5 font-weight-bold">{{ totalLogs }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar
              :color="todayMood ? (moodColors[todayMood.mood] || 'grey') : 'grey'"
              variant="tonal"
              size="48"
            >
              <VIcon
                :icon="todayMood ? (moodIcons[todayMood.mood] || 'ri-emotion-line') : 'ri-question-line'"
                size="24"
              />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">{{ t('dashboard.todayMood') }}</div>
              <div class="text-h5 font-weight-bold">
                <template v-if="todayMood">
                  {{ moodLabel(todayMood.mood) }}
                </template>
                <template v-else>
                  <span class="text-medium-emphasis">{{ t('dashboard.noTodayMood') }}</span>
                </template>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="warning" variant="tonal" size="48">
              <VIcon icon="ri-speed-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">{{ t('dashboard.avgIntensity') }}</div>
              <div class="text-h5 font-weight-bold">{{ avgIntensity }} /10</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-fire-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">{{ t('dashboard.streak') }}</div>
              <div class="text-h5 font-weight-bold">{{ streak }} {{ t('dashboard.days') }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <!-- Mood Distribution -->
      <VCol cols="12" md="6">
        <VCard :title="t('dashboard.moodDistribution')" :loading="isLoading">
          <VCardText>
            <div v-if="moodDistribution.length === 0" class="text-center py-4 text-medium-emphasis">
              {{ t('dashboard.noEmotions') }}
            </div>
            <div v-for="item in moodDistribution" :key="item.mood" class="mb-3">
              <div class="d-flex align-center mb-1">
                <VIcon :icon="item.icon" :color="item.color" size="18" class="me-2" />
                <span class="text-body-2 flex-grow-1">{{ moodLabel(item.mood) }}</span>
                <span class="text-caption text-medium-emphasis">{{ item.count }} ({{ item.percentage }}%)</span>
              </div>
              <VProgressLinear
                :model-value="item.percentage"
                :color="item.color"
                height="8"
                rounded
              />
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Recent Emotions -->
      <VCol cols="12" md="6">
        <VCard :title="t('dashboard.recentEmotions')" :loading="isLoading">
          <VList lines="two">
            <VListItem
              v-for="log in recentLogs"
              :key="log.id"
            >
              <template #prepend>
                <VAvatar :color="moodColors[log.mood] || 'grey'" variant="tonal" size="36">
                  <VIcon :icon="moodIcons[log.mood] || 'ri-emotion-line'" size="18" />
                </VAvatar>
              </template>
              <VListItemTitle>
                <span class="font-weight-medium">{{ moodLabel(log.mood) }}</span>
                <VChip
                  size="x-small"
                  variant="flat"
                  class="ms-2"
                >
                  {{ log.intensity }}/10
                </VChip>
              </VListItemTitle>
              <VListItemSubtitle>
                {{ formatDate(log.date) }}{{ log.note ? ' · ' + log.note : '' }}
              </VListItemSubtitle>
            </VListItem>
            <VListItem v-if="recentLogs.length === 0" class="text-center text-medium-emphasis py-4">
              {{ t('dashboard.noEmotions') }}
            </VListItem>
          </VList>
          <VCardActions>
            <RouterLink :to="{ name: 'emotion-log-page' }">
              <VBtn variant="text" size="small">{{ t('dashboard.viewAllEmotions') }}</VBtn>
            </RouterLink>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
