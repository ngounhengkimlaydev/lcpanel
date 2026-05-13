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

const showLoadingSkeleton = ref(false)
let loadingTimer: ReturnType<typeof setTimeout> | null = null

watch(isLoading, (loading) => {
  if (loading) {
    if (loadingTimer) {
      return
    }

    loadingTimer = setTimeout(() => {
      showLoadingSkeleton.value = true
      loadingTimer = null
    }, 140)

    return
  }

  if (loadingTimer) {
    clearTimeout(loadingTimer)
    loadingTimer = null
  }

  showLoadingSkeleton.value = false
}, { immediate: true })

onMounted(async () => {
  await useUserStore().initStore()
})

onBeforeUnmount(() => {
  if (loadingTimer) {
    clearTimeout(loadingTimer)
  }
})
</script>

<template>
  <UApp :toaster="{ position: 'top-right' }" :class="fontClass">
    <NuxtLoadingIndicator />
    <AppLoadingSkeleton v-if="showLoadingSkeleton" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
