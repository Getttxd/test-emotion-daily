<script setup lang="ts">
import { useEmotionLogStore } from '@/stores/use-emotion-log-store'
import { MOODS } from '@/models/emotion-log'
import type { CreateEmotionLogBody, EmotionLog, Mood, UpdateEmotionLogBody } from '@/models'
import { useSEO } from '@/composables/useSEO'

useSEO({
  title: 'Daily-Emotion - Emotion Logs',
  description: 'บันทึกอารมณ์ประจำวัน',
})

const { t } = useI18n()

const emotionLogStore = useEmotionLogStore()
const { logs, isLoading, error } = storeToRefs(emotionLogStore)

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

const headers = computed(() => [
  { title: t('emotionLog.date'), key: 'date' },
  { title: t('emotionLog.mood'), key: 'mood' },
  { title: t('emotionLog.intensity'), key: 'intensity' },
  { title: t('emotionLog.note'), key: 'note' },
  { title: t('emotionLog.action'), key: 'action', sortable: false, align: 'end' as const },
])

// Dialog state
const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingLog = ref<EmotionLog | null>(null)
const deletingLog = ref<EmotionLog | null>(null)

const form = ref<CreateEmotionLogBody>({ mood: 'happy' as Mood, intensity: 5, note: '', date: new Date().toISOString().slice(0, 10) })

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function openCreate() {
  editingLog.value = null
  form.value = { mood: 'happy' as Mood, intensity: 5, note: '', date: getToday() }
  dialog.value = true
}

function openEdit(log: EmotionLog) {
  editingLog.value = log
  form.value = { mood: log.mood, intensity: log.intensity, note: log.note, date: log.date }
  dialog.value = true
}

function openDelete(log: EmotionLog) {
  deletingLog.value = log
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingLog.value)
      await emotionLogStore.updateLog(editingLog.value.id, form.value)
    else
      await emotionLogStore.createLog(form.value)
    dialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingLog.value) return
  isSubmitting.value = true
  try {
    await emotionLogStore.deleteLog(deletingLog.value.id)
    deleteDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

function moodLabel(mood: string) {
  return t(`emotionLog.moodOptions.${mood}`)
}

onMounted(() => emotionLogStore.fetchLogs())
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">{{ t('emotionLog.title') }}</span>
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openCreate"
        >
          {{ t('emotionLog.logToday') }}
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VAlert
        v-if="error"
        type="error"
        class="ma-4"
        :text="error"
        closable
      />

      <VDataTable
        :headers="headers"
        :items="logs"
        :loading="isLoading"
        hover
      >
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template #item.mood="{ item }">
          <VChip
            :color="moodColors[item.mood]"
            variant="flat"
            label
            class="text-capitalize"
            size="small"
          >
            <VIcon :icon="moodIcons[item.mood]" start size="18" />
            {{ moodLabel(item.mood) }}
          </VChip>
        </template>

        <template #item.intensity="{ item }">
          <div class="d-flex align-center ga-1">
            <VProgressLinear
              :model-value="item.intensity * 10"
              :color="moodColors[item.mood]"
              height="8"
              rounded
              class="flex-grow-1"
              max="100"
            />
            <span class="text-caption text-medium-emphasis">{{ item.intensity }}/10</span>
          </div>
        </template>

        <template #item.note="{ item }">
          <span class="text-body-2">{{ item.note || '—' }}</span>
        </template>

        <template #item.action="{ item }">
          <IconBtn @click="openEdit(item)">
            <VTooltip activator="parent" location="top">{{ t('emotionLog.edit') }}</VTooltip>
            <VIcon icon="ri-pencil-line" />
          </IconBtn>
          <IconBtn color="error" @click="openDelete(item)">
            <VTooltip activator="parent" location="top">{{ t('emotionLog.delete') }}</VTooltip>
            <VIcon icon="ri-delete-bin-line" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            <VIcon icon="ri-emotion-line" size="48" class="mb-2" />
            <div>{{ t('emotionLog.noLogs') }}</div>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="520" persistent>
      <VCard :title="editingLog ? t('emotionLog.editTitle') : t('emotionLog.addTitle')">
        <VCardText>
          <VForm @submit.prevent="submit">
            <!-- Date -->
            <VTextField
              v-model="form.date"
              :label="t('emotionLog.date')"
              type="date"
              prepend-inner-icon="ri-calendar-line"
              class="mb-4"
              required
            />

            <!-- Mood Select -->
            <VSelect
              v-model="form.mood"
              :label="t('emotionLog.mood')"
              :items="MOODS"
              prepend-inner-icon="ri-emotion-line"
              class="mb-4"
              required
            >
              <template #item="{ item, props }">
                <VListItem
                  v-bind="props"
                  :prepend-icon="moodIcons[item.value as string]"
                  :title="moodLabel(item.value as string)"
                />
              </template>
              <template #selection="{ item }">
                {{ moodLabel(item.value as string) }}
              </template>
            </VSelect>

            <!-- Intensity Slider -->
            <div class="mb-4">
              <label class="text-body-2 mb-1 d-block">{{ t('emotionLog.intensity') }}: {{ form.intensity }}/10</label>
              <VSlider
                v-model="form.intensity"
                :min="1"
                :max="10"
                :step="1"
                :color="moodColors[form.mood]"
                show-ticks="always"
                tick-size="4"
                class="mt-2"
                thumb-label
              />
              <div class="d-flex justify-space-between text-caption text-medium-emphasis mt-n2">
                <span>{{ t('emotionLog.mild') }}</span>
                <span>{{ t('emotionLog.intense') }}</span>
              </div>
            </div>

            <!-- Note -->
            <VTextarea
              v-model="form.note"
              :label="t('emotionLog.noteOptional')"
              prepend-inner-icon="ri-file-text-line"
              :placeholder="t('emotionLog.howFeeling')"
              auto-grow
              rows="3"
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">{{ t('emotionLog.cancel') }}</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingLog ? t('emotionLog.save') : t('emotionLog.logEmotion') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard :title="t('emotionLog.deleteTitle')">
        <VCardText>
          {{ t('emotionLog.deleteConfirm', { date: deletingLog?.date }) }}
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">{{ t('emotionLog.cancel') }}</VBtn>
          <VBtn
            color="error"
            :loading="isSubmitting"
            @click="confirmDelete"
          >
            {{ t('emotionLog.delete') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
