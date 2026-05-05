<script setup lang="ts">

defineProps<{
  collapsed?: boolean
}>()


</script>

<template>
  <img class="hidden dark:block cursor-pointer max-w-30 lg:w-full" src="/logo.svg" @click="navigateTo('/')" />
  <img class="dark:hidden block cursor-pointer max-w-30 lg:w-full" src="/logoLight.svg" @click="navigateTo('/')" />
</template>
