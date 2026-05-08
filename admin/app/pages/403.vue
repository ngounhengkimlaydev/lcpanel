<template>
    <div class="flex min-h-screen items-center justify-center bg-default px-6">
        <div class="max-w-md text-center">
            <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-error/10 text-error">
                <UIcon name="i-lucide-shield-x" class="size-10" />
            </div>

            <h1 class="text-4xl font-black text-highlighted">
                403
            </h1>

            <p class="mt-2 text-lg font-semibold text-highlighted">
                Access Denied
            </p>

            <p class="mt-2 text-sm text-muted">
                You do not have permission to access this page.
            </p>

            <div class="mt-6 flex justify-center gap-3">
                <UButton label="Go Home" icon="i-lucide-house" to="/" />

                <UButton label="Go Back" icon="i-lucide-arrow-left" color="neutral" variant="soft"
                    @click="$router.back()" />
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'permission'
})
</script>