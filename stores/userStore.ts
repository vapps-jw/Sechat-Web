export const useUserStore = defineStore({
  id: "user-store",
  state: () => {
    return {
      userProfile: <IUserProfile>null,
      isSignedIn: <boolean>false,
    };
  },
  actions: {
    updateUserProfile(value: IUserProfile) {
      this.userProfile = value;
    },
    updateSignIn(value: boolean) {
      this.isSignedIn = value;
    },
  },
  getters: {
    getIsSignedIn: (state) => state.isSignedIn,
    getUserName: (state) => state.userProfile?.userName,
    profilePresent: (state) => (state.userProfile ? true : false),
  },
});
