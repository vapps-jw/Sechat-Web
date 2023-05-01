import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import colors from "vuetify/lib/util/colors";

const sechatDefault = {
  dark: true,
  colors: {
    primary: colors.blue.darken2,
    accent: colors.grey.darken3,
    secondary: colors.amber.darken3,
    info: colors.teal.lighten1,
    warning: colors.amber.base,
    error: colors.deepOrange.accent4,
    success: colors.green.accent3,
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components: {
      ...components,
    },
    directives,
    theme: {
      defaultTheme: "sechatDefault",
      themes: {
        sechatDefault,
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
