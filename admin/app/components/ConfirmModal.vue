<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold text-highlighted">
            {{ title }}
          </h3>
        </template>

        <p class="text-sm text-muted">
          {{ description }}
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              :label="cancelText"
              color="neutral"
              variant="ghost"
              @click="close(false)"
            />

            <UButton
              :label="confirmText"
              :color="color"
              @click="close(true)"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

withDefaults(defineProps<{
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  color?: 'primary' | 'error' | 'success' | 'warning' | 'neutral'
}>(), {
  title: 'Confirm',
  description: 'Are you sure?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  color: 'primary'
})

const emit = defineEmits<{
  close: [boolean]
}>()

function close(value: boolean) {
  open.value = false
  emit('close', value)
}
</script>