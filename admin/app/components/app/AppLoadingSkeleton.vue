<template>
  <div class="pointer-events-none fixed inset-0 z-[9999] overflow-hidden bg-default/78 backdrop-blur-md">
    <div class="grid h-full grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside class="hidden border-r border-default/70 bg-elevated/65 px-5 py-6 lg:flex lg:flex-col lg:gap-5">
        <div class="space-y-3">
          <div class="h-10 w-36 rounded-2xl bg-muted/80 animate-pulse" />
          <div class="h-9 w-full rounded-2xl bg-muted/60 animate-pulse" />
        </div>

        <div class="space-y-3">
          <div v-for="item in 7" :key="`sidebar-${item}`" class="flex items-center gap-3 rounded-2xl px-3 py-3">
            <div class="size-9 rounded-xl bg-muted/70 animate-pulse" />
            <div class="h-4 flex-1 rounded-full bg-muted/65 animate-pulse" />
          </div>
        </div>

        <div class="mt-auto rounded-3xl border border-default/60 bg-default/60 p-4">
          <div class="h-4 w-24 rounded-full bg-muted/70 animate-pulse" />
          <div class="mt-3 h-10 rounded-2xl bg-muted/60 animate-pulse" />
        </div>
      </aside>

      <div class="flex min-h-0 flex-col">
        <div class="border-b border-default/70 bg-default/72 px-4 py-4 sm:px-6">
          <div class="flex items-center justify-between gap-4">
            <div class="h-10 w-10 rounded-2xl bg-muted/70 animate-pulse lg:hidden" />

            <div class="flex flex-1 items-center justify-end gap-3">
              <div class="hidden h-10 w-48 rounded-2xl bg-muted/60 animate-pulse sm:block" />
              <div class="size-10 rounded-2xl bg-muted/70 animate-pulse" />
              <div class="h-10 w-32 rounded-2xl bg-muted/65 animate-pulse" />
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div class="mx-auto flex h-full w-full max-w-7xl flex-col gap-6">
            <section class="space-y-3">
              <div class="h-8 w-56 rounded-full bg-muted/75 animate-pulse" />
              <div class="h-4 w-80 max-w-full rounded-full bg-muted/55 animate-pulse" />
            </section>

            <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div v-for="card in 4" :key="`card-${card}`" class="rounded-3xl border border-default/60 bg-default/72 p-5">
                <div class="flex items-start justify-between gap-4">
                  <div class="space-y-3">
                    <div class="h-4 w-24 rounded-full bg-muted/60 animate-pulse" />
                    <div class="h-7 w-16 rounded-full bg-muted/75 animate-pulse" />
                  </div>

                  <div class="size-12 rounded-2xl bg-muted/70 animate-pulse" />
                </div>
              </div>
            </section>

            <section class="flex-1 rounded-[2rem] border border-default/60 bg-default/72 p-5">
              <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div class="space-y-3">
                  <div class="h-5 w-40 rounded-full bg-muted/70 animate-pulse" />
                  <div class="h-4 w-72 max-w-full rounded-full bg-muted/55 animate-pulse" />
                </div>

                <div class="flex gap-3">
                  <div class="h-10 w-52 rounded-2xl bg-muted/60 animate-pulse" />
                  <div class="h-10 w-28 rounded-2xl bg-muted/60 animate-pulse" />
                </div>
              </div>

              <div class="mt-6 space-y-4">
                <div v-for="row in 5" :key="`row-${row}`" class="rounded-3xl border border-default/60 bg-elevated/55 p-5">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div class="space-y-3">
                      <div class="h-5 w-52 rounded-full bg-muted/70 animate-pulse" />
                      <div class="h-4 w-80 max-w-full rounded-full bg-muted/55 animate-pulse" />
                      <div class="flex flex-wrap gap-2">
                        <div v-for="pill in 3" :key="`pill-${row}-${pill}`" class="h-7 w-20 rounded-full bg-muted/60 animate-pulse" />
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <div class="h-9 w-24 rounded-2xl bg-muted/70 animate-pulse" />
                      <div class="h-9 w-24 rounded-2xl bg-muted/60 animate-pulse" />
                      <div class="h-9 w-12 rounded-2xl bg-muted/60 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
