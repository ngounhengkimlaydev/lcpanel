<script setup lang="ts">
const colorMode = useColorMode()
const { isLoading } = useApiLoading()
const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.svg' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nexora Dashboard Template'

useSeoMeta({
  title,
  ogTitle: title,
})
const { locale } = useI18n()

const fontClass = computed(() => `font-${locale.value}`)
onMounted(async () => {
  await useUserStore().initStore()
})
</script>

<template>
  <UApp :toaster="{ position: 'top-right' }" :class="fontClass">
    <NuxtLoadingIndicator />
    <div v-if="isLoading" class="fixed inset-0 z-9999 flex items-center justify-center bg-black/20">
      <UIcon name="i-lucide-loader-circle" class="size-10 animate-spin text-primary" />
    </div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
