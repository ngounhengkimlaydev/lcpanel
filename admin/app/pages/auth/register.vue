<template>
  <section class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.2),transparent_35%)]" />

    <div class="relative flex min-h-screen items-center justify-center p-6">
      <div class="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-xl">
        <div class="mb-8 text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-400 shadow-lg shadow-cyan-500/20">
            <Icon name="i-lucide-user-plus" class="text-2xl text-white" />
          </div>

          <h1 class="text-3xl font-bold">Create Customer Account</h1>
          <p class="mt-2 text-sm text-slate-400">
            Register once, then manage websites and deployments from the panel.
          </p>
        </div>

        <button type="button" :disabled="googleLoading || loading"
          class="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
          @click="handleGoogleRegister">
          <Icon name="i-simple-icons-google" class="text-lg" />
          {{ googleLoading ? 'Connecting Google...' : 'Register with Google' }}
        </button>

        <div class="mb-6 flex items-center gap-3">
          <span class="h-px flex-1 bg-white/10"></span>
          <span class="text-xs uppercase tracking-wider text-slate-500">or use email</span>
          <span class="h-px flex-1 bg-white/10"></span>
        </div>

        <form class="space-y-5" @submit.prevent="handleRegister">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">Full name</label>
            <input v-model="form.name" type="text" autocomplete="name" placeholder="Alex Morgan"
              class="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">Email</label>
            <input v-model="form.email" type="email" autocomplete="email" placeholder="you@example.com"
              class="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">Phone</label>
            <input v-model="form.phone" type="tel" autocomplete="tel" placeholder="+855 12 345 678"
              class="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">Password</label>
            <input v-model="form.password" type="password" autocomplete="new-password" placeholder="••••••••"
              class="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" />
          </div>

          <button type="submit" :disabled="loading"
            class="w-full rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:opacity-60">
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-400">
          Already have access?
          <NuxtLink to="/auth/login" class="font-semibold text-cyan-300 hover:text-cyan-200">
            Sign in
          </NuxtLink>
        </p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
const userStore = useUserStore()
const firebaseAuth = useFirebaseAuth()
const toast = useToast()

definePageMeta({
  layout: 'auth'
})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: ''
})

const loading = ref(false)
const googleLoading = ref(false)

const handleRegister = async () => {
  if (!form.name || !form.email || !form.password) {
    toast.add({
      title: 'Missing information',
      description: 'Name, email and password are required.',
      color: 'warning'
    })
    return
  }

  loading.value = true

  try {
    const idToken = await firebaseAuth.registerWithEmail(form.name, form.email, form.password)
    await userStore.registerCustomer({ ...form, idToken })
    await navigateTo('/')
  } finally {
    loading.value = false
  }
}

const handleGoogleRegister = async () => {
  googleLoading.value = true

  try {
    const idToken = await firebaseAuth.signInWithGoogle()
    await userStore.registerCustomer({
      idToken,
      name: form.name || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined
    })
    await navigateTo('/')
  } finally {
    googleLoading.value = false
  }
}
</script>
