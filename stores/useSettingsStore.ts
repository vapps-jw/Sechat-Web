type UserSettings = {
  tooltipSetting: string;
};

export const Constants = {
  STORE_NAME: "settings-store",
};

export const TooltpSetting = {
  VISIBLE: "Tooltips visible",
  HIDDEN: "Tooltips hidden",
};

const getDefaultSettings = (): UserSettings => ({
  tooltipSetting: TooltpSetting.VISIBLE,
});

const getSettings = (): UserSettings => {
  const settings = localStorage.getItem(Constants.STORE_NAME);
  return settings ? JSON.parse(settings) : getDefaultSettings();
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
