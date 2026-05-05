<template>
  <section class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.2),transparent_35%)]" />

    <div class="relative grid min-h-screen lg:grid-cols-2">
      <!-- Brand Side -->
      <div class="hidden items-center justify-center p-12 lg:flex">
        <div class="max-w-xl">
          <div
            class="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span class="text-sm text-slate-300">Server Management Panel</span>
          </div>

          <h1 class="text-5xl font-black leading-tight">
            Control your servers,
            <span class="block bg-linear-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              websites & deployments
            </span>
          </h1>

          <p class="mt-6 text-lg text-slate-300">
            Manage domains, SSL, databases, Node apps, backups, logs and server health from one clean dashboard.
          </p>

          <div class="mt-10 grid grid-cols-3 gap-4">
            <div class="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <Icon name="i-lucide-server" class="mb-3 text-2xl text-cyan-300" />
              <p class="text-2xl font-bold">99.9%</p>
              <p class="text-sm text-slate-400">Uptime</p>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <Icon name="i-lucide-lock-keyhole" class="mb-3 text-2xl text-emerald-300" />
              <p class="text-2xl font-bold">SSL</p>
              <p class="text-sm text-slate-400">Auto Issue</p>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <Icon name="i-lucide-terminal" class="mb-3 text-2xl text-blue-300" />
              <p class="text-2xl font-bold">PM2</p>
              <p class="text-sm text-slate-400">Node Apps</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Login -->
      <div class="flex items-center justify-center p-6 sm:p-10">
        <div class="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-xl">
          <div class="mb-8 text-center">
            <div
              class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-400 shadow-lg shadow-cyan-500/20">
              <Icon name="i-lucide-shield-check" class="text-2xl text-white" />
            </div>

            <h2 class="text-3xl font-bold">Welcome Back</h2>
            <p class="mt-2 text-sm text-slate-400">
              Sign in to your server control center
            </p>
          </div>

          <form class="space-y-5" @submit.prevent="handleLogin">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">Username or Email</label>
              <input v-model="form.username" type="text" placeholder="admin@ltech.digital"
                class="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <div class="relative">
                <input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="••••••••"
                  class="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-11 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" />

                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  @click="showPwd = !showPwd">
                  <Icon :name="showPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 text-sm text-slate-400">
                <input v-model="rememberMe" type="checkbox" class="rounded border-white/10 bg-slate-900" />
                Remember me
              </label>

              <NuxtLink to="/forgot-password" class="text-sm text-cyan-300 hover:text-cyan-200">
                Forgot password?
              </NuxtLink>
            </div>

            <button type="submit" :disabled="loading"
              class="w-full rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:opacity-60">
              {{ loading ? 'Authenticating...' : 'Login to Panel' }}
            </button>
          </form>

          <p class="mt-8 text-center text-xs text-slate-500">
            © 2026 LTech Server Panel. Secure access only.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
const userStore = useUserStore()

definePageMeta({
  layout: 'auth'
})
const api = useApiFetch()
const form = reactive({
  username: '',
  password: ''
})

const showPwd = ref(false)
const rememberMe = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    alert('Please enter email and password')
    return
  }

  loading.value = true

  try {
    await userStore.login(form)
    await navigateTo('/')
  } catch (err: any) {
    // alert(err?.data?.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>
