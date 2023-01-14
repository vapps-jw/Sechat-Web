// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  plugins: ["~/plugins/nuxtClientInit.client.ts"],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || "/api",
    },
  },
  modules: ["@nuxt/image-edge", "@nuxtjs/i18n"],
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
      title: "sechat",
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
    "/chat/**": { ssr: false },
  },
});
