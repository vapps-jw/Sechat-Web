export const useUserStore = defineStore({
  id: "user-store",
  state: () => {
    return {
      userProfile: <IUserProfile>null,
      isSignedIn: <boolean>null,
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
    getUserName: (state) => state.userProfile?.userName,
    profilePresent: (state) => (state.userProfile ? true : false),
  },
});
