<script setup lang="ts">
import { useEmotionLogStore } from '@/stores/use-emotion-log-store'
import { MOODS } from '@/models/emotion-log'
import type { CreateEmotionLogBody, EmotionLog, Mood, UpdateEmotionLogBody } from '@/models'

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

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Mood', key: 'mood' },
  { title: 'Intensity', key: 'intensity' },
  { title: 'Note', key: 'note' },
  { title: 'Action', key: 'action', sortable: false, align: 'end' as const },
]

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
  return mood.charAt(0).toUpperCase() + mood.slice(1)
}

onMounted(() => emotionLogStore.fetchLogs())
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">Daily Emotion Logs</span>
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openCreate"
        >
          Log Today's Emotion
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
            <VTooltip activator="parent" location="top">Edit</VTooltip>
            <VIcon icon="ri-pencil-line" />
          </IconBtn>
          <IconBtn color="error" @click="openDelete(item)">
            <VTooltip activator="parent" location="top">Delete</VTooltip>
            <VIcon icon="ri-delete-bin-line" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            <VIcon icon="ri-emotion-line" size="48" class="mb-2" />
            <div>No emotion logs yet. Click "Log Today's Emotion" to start tracking!</div>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="520" persistent>
      <VCard :title="editingLog ? 'Edit Emotion Log' : 'Log Today\'s Emotion'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <!-- Date -->
            <VTextField
              v-model="form.date"
              label="Date"
              type="date"
              prepend-inner-icon="ri-calendar-line"
              class="mb-4"
              required
            />

            <!-- Mood Select -->
            <VSelect
              v-model="form.mood"
              label="Mood"
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
                <span class="text-capitalize">{{ moodLabel(item.value as string) }}</span>
              </template>
            </VSelect>

            <!-- Intensity Slider -->
            <div class="mb-4">
              <label class="text-body-2 mb-1 d-block">Intensity: {{ form.intensity }}/10</label>
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
                <span>Mild</span>
                <span>Intense</span>
              </div>
            </div>

            <!-- Note -->
            <VTextarea
              v-model="form.note"
              label="Note (optional)"
              prepend-inner-icon="ri-file-text-line"
              placeholder="How are you feeling today?"
              auto-grow
              rows="3"
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">Cancel</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingLog ? 'Save' : 'Log Emotion' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="Delete Emotion Log">
        <VCardText>
          Are you sure you want to delete the log for <strong>{{ deletingLog?.date }}</strong>? This action cannot be undone.
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">Cancel</VBtn>
          <VBtn
            color="error"
            :loading="isSubmitting"
            @click="confirmDelete"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
