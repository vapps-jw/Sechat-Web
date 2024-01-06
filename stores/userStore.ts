import { getInitials, stringToColor } from "~/utilities/stringFunctions";

export const InvitationsPermission = {
  ALLOWED: "Allowed",
  FORBIDDEN: "Forbidden",
};

export const useUserStore = defineStore({
  id: "user-store",
  state: () => {
    return {
      globalSettings: <GlobalSetting[]>null,
      userProfile: <IUserProfile>null,
      subscribedToPush: <boolean>true,
    };
  },
  actions: {
    updateUserProfile(value: IUserProfile) {
      this.userProfile = value;
    },
  },
  getters: {
    getColor: (state) => stringToColor(state.userProfile?.userName),
    getInitials: (state) => getInitials(state.userProfile?.userName),
    isSignedIn: (state) => (state.userProfile ? true : false),
    getUserName: (state) => state.userProfile?.userName,
    getProfilePicture: (state) => state.userProfile?.profilePicture,
    getUserEmail: (state) => state.userProfile?.email,
    getReferralPass: (state) => state.userProfile?.referralPass,
    isEmailConfirmed: (state) => state.userProfile?.emailConfirmed,
    invitationsPermission: (state) =>
      state.userProfile?.invitationsAllowed
        ? InvitationsPermission.ALLOWED
        : InvitationsPermission.FORBIDDEN,
    isAdmin: (state) => (state.globalSettings ? true : false),
  },
});
