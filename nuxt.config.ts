export default defineNuxtConfig({
  typescript: {
    strict: false,
  },
  imports: {
    dirs: ["stores"],
  },
  plugins: ["~/plugins/nuxtClientInit.client.ts"],
  // alias: {
  //   pinia: "/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs",
  // },
  runtimeConfig: {
    turnApiKey: "",
    public: {
      appVersion: "BETA v0.5.2.4",
      publicVapidKey: "",
      apiBase: "",
    },
  },
  security: {
    corsHandler: {
      origin: "*",
      methods: "*",
    },
    headers: {
      permissionsPolicy: {
        camera: ["self"],
        microphone: ["self"],
      },
    },
  },
  modules: [
    "@nuxt/image-edge",
    "@nuxtjs/i18n",
    "@vite-pwa/nuxt",
    "nuxt-security",
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore", "acceptHMRUpdate", "storeToRefs"],
      },
    ],
  ],
  pwa: {
    registerType: "autoUpdate",
    strategies: "injectManifest",
    filename: "sw.js",
    manifest: {
      share_target: {
        action: "/chat",
        method: "GET",
        params: {
          title: "name",
          text: "description",
          url: "link",
        },
      },
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
    client: {
      periodicSyncForUpdates: 3600,
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
    "@/assets/main-effects.css",
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
