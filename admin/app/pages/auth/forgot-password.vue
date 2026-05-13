<template>
  <section class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.2),transparent_35%)]" />

    <div class="relative flex min-h-screen items-center justify-center p-6">
      <div class="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-xl">
        <div class="mb-8 text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-400 shadow-lg shadow-cyan-500/20">
            <Icon name="i-lucide-key-round" class="text-2xl text-white" />
          </div>

          <h1 class="text-3xl font-bold">Reset Password</h1>
          <p class="mt-2 text-sm text-slate-400">
            Enter your customer email and Firebase will send a secure reset link.
          </p>
        </div>

        <form class="space-y-5" @submit.prevent="handleReset">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">Email</label>
            <input v-model="email" type="email" autocomplete="email" placeholder="you@example.com"
              class="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" />
          </div>

          <button type="submit" :disabled="loading"
            class="w-full rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:opacity-60">
            {{ loading ? 'Sending reset link...' : 'Send Reset Link' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-400">
          Remembered it?
          <NuxtLink to="/auth/login" class="font-semibold text-cyan-300 hover:text-cyan-200">
            Back to login
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

const email = ref('')
const loading = ref(false)

const handleReset = async () => {
  if (!email.value) {
    toast.add({
      title: 'Email required',
      description: 'Please enter the email address for your customer account.',
      color: 'warning'
    })
    return
  }

  loading.value = true

  try {
    let sentByFirebase = true

    try {
      await firebaseAuth.sendResetEmail(email.value)
    } catch {
      sentByFirebase = false
      await userStore.requestPasswordReset(email.value)
    }

    if (sentByFirebase) {
      await userStore.requestPasswordReset(email.value)
    }

    toast.add({
      title: sentByFirebase ? 'Reset link sent' : 'Reset requested',
      description: sentByFirebase
        ? 'Check your inbox for the password reset email.'
        : 'The backend accepted the reset request. Contact support if no email arrives.',
      color: 'success'
    })
    email.value = ''
  } finally {
    loading.value = false
  }
}
</script>
