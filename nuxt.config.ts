export default defineNuxtConfig({
  ssr: false,
  devServer: {
    port: 3000,
    host: "localhost",
  },
  sourcemap: {
    server: true,
    client: true,
  },
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
    stunServer: process.env.NUXT_STUN_SERVER ?? "not set",
    turnServer: process.env.NUXT_TURN_SERVER ?? "not set",
    turnUser: process.env.NUXT_TURN_USER ?? "not set",
    turnPassword: process.env.NUXT_TURN_PASSWORD ?? "not set",
    public: {
      mainDomain:
        process.env.NODE_ENV === "production" ? ".sechat.app" : "localhost",
      appVersion: "v1.7.25",
      vapidKey: process.env.NUXT_PUBLIC_VAPID_KEY ?? "not set",
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "not set",
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
        "display-capture": ["self"],
        fullscreen: ["self"],
        geolocation: ["()"],
      },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        "img-src": ["*", "data:"],
      },
      crossOriginResourcePolicy: "cross-origin",
    },
  },
  modules: [
    "nuxt-icon",
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
        action: "/chat/share",
        method: "GET",
        params: {
          title: "title",
          text: "text",
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
      script: [
        {
          src: "https://stats.sechat.app/js/script.js",
          "data-domain": "sechat.app",
          defer: true,
        },
      ],
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Secure chat and video calls",
        },
        {
          hid: "og:title",
          property: "og:title",
          content: "Sechat - communicator",
        },
        { hid: "og:url", property: "og:url", content: "https://sechat.app" },
        {
          hid: "og:description",
          property: "og:description",
          content: "Open Source Secure Chat and Video Calls",
        },
        {
          hid: "og:image",
          property: "og:image",
          content: "https://sechat.app/logos/logo-only-transparent-300x300.png",
        },

        // twitter card
        {
          hid: "twitter:title",
          name: "twitter:title",
          content: "Sechat - communicator",
        },
        {
          hid: "twitter:url",
          name: "twitter:url",
          content: "https://sechat.app",
        },
        {
          hid: "twitter:description",
          name: "twitter:description",
          content: "Open Source Secure Chat and Video Calls",
        },
        {
          hid: "twitter:image",
          name: "twitter:image",
          content: "https://sechat.app/logos/logo-only-transparent-300x300.png",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ],
    },
  },
});
