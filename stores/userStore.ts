export const useUserStore = defineStore({
  id: "user-store",
  state: () => {
    return {
      userProfile: <IUserProfile>null,
    };
  },
  actions: {
    updateUserProfile(value: IUserProfile) {
      this.userProfile = value;
    },
  },
  getters: {
    isSignedIn: (state) => (state.userProfile ? true : false),
    getUserName: (state) => state.userProfile?.userName,
    getUserEmail: (state) => state.userProfile?.email,
    isEmailConfirmed: (state) => state.userProfile?.emailConfirmed,
  },
});
