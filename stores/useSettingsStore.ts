export const Constants = {
  STORE_NAME: "settings-store",
};

const getDefaultSettings = (): UserSettings => ({
  tooltipSetting: <TooltipSetting>{ showTooltips: true },
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
    updateShowTooltips(flag: boolean) {
      (<UserSettings>this.settings).tooltipSetting.showTooltips = flag;
      localStorage.setItem(Constants.STORE_NAME, JSON.stringify(this.settings));
    },
  },
  getters: {},
});
