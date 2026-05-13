export default defineNuxtConfig({
  srcDir: "app/",
  ssr: false,
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
  ],

  devtools: {
    enabled: true,
  },
  pinia: {
    storesDirs: ["./store"],
  },
  imports: {
    dirs: ["stores"],
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/api/**": {
      cors: true,
    },
  },
  i18n: {
    defaultLocale: "en",
    strategy: "no_prefix",

    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "km", name: "Khmer", file: "km.json" },
      { code: "zh", name: "Chinese", file: "zh.json" },
    ],
    langDir: "locales/",

    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },
  compatibilityDate: "2024-07-11",
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "https://lcpanel-api.ltech.digital/api",
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL,
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
    },
  },
  nitro: {
    preset: "node-server",
  },
  devServer: {
    port: 41201,
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
