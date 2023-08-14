type UserSettings = {
  tooltipSetting: string;
  theme: string;
};

export const Constants = {
  STORE_NAME: "settings-store",
};

export const TooltpSetting = {
  VISIBLE: "Tooltips visible",
  HIDDEN: "Tooltips hidden",
};

export const ThemeSetting = {
  DARK: "sechatDark",
  LIGHT: "sechatLight",
};

const getDefaultSettings = (): UserSettings => ({
  tooltipSetting: TooltpSetting.VISIBLE,
  theme: ThemeSetting.DARK,
});

const getSettings = (): UserSettings => {
  const settings = localStorage.getItem(Constants.STORE_NAME);
  const defaults = getDefaultSettings();
  if (settings) {
    return { ...defaults, ...JSON.parse(settings) };
  }
  return defaults;
};

export const useSettingsStore = defineStore({
  id: Constants.STORE_NAME,
  state: () => {
    return {
      settings: <UserSettings>getSettings(),
    };
  },
  actions: {
    updateStoredSettings() {
      localStorage.setItem(Constants.STORE_NAME, JSON.stringify(this.settings));
    },
  },
  getters: {},
});
