import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as labsComponents from "vuetify/labs/components";
import * as directives from "vuetify/directives";
import colors from "vuetify/lib/util/colors";

const sechatDark = {
  dark: true,
  colors: {
    primary: colors.blue.darken2,
    accent: colors.grey.darken3,
    secondary: colors.amber.darken3,
    info: colors.purple.lighten1,
    warning: colors.amber.base,
    error: colors.deepOrange.accent4,
    success: colors.green.accent3,
  },
};

const sechatLight = {
  dark: false,
  colors: {
    primary: colors.blue.darken2,
    accent: colors.grey.darken3,
    secondary: colors.amber.darken3,
    info: colors.purple.lighten1,
    warning: colors.amber.base,
    error: colors.deepOrange.accent4,
    success: colors.green.accent3,
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components: {
      ...components,
      ...labsComponents,
    },
    directives,
    theme: {
      defaultTheme: "sechatDark",
      themes: {
        sechatDark,
        sechatLight,
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
