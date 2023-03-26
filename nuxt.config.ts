export default defineNuxtConfig({
  typescript: {
    strict: false,
  },
  plugins: [
    "~/plugins/nuxtClientInit.client.ts",
    { src: "~/plugins/pwa-update.ts", mode: "client" },
  ],
  runtimeConfig: {
    public: {
      appVersion: "BETA v0.3.6",
      publicVapidKey:
        "BIazXIHc0G_xFGTio-sMOdSbarBmeVNtcKaQGsV6mLnaO1cn3_b_-j218VFz5YiSOWaVHX58tRo_dbkHh-xXfpg",
      apiBase: process.env.API_BASE_URL || "https://api.sechat.net",
    },
  },
  modules: ["@nuxt/image-edge", "@nuxtjs/i18n", "@vite-pwa/nuxt"],
  pwa: {
    registerType: "autoUpdate",
    strategies: "injectManifest",
    filename: "sw.js",
    manifest: {
      name: "Sechat",
      short_name: "Sechat",
      background_color: "#000000",
      scope: "/",
      start_url: "/",
      description: "Secure chat app",
      icons: [
        {
          src: "icons/icon_64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "icons/icon_144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "icons/icon_192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/icon_512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      sourcemap: true,
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  },
  i18n: {
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root", // recommended
    },
  },
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css",
    "@/assets/main.css",
  ],
  build: {
    transpile: ["vuetify"],
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "Sechat",
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ],
    },
  },
  routeRules: {
    // Render these routes with SPA
    "/**": { ssr: false },
  },
});
