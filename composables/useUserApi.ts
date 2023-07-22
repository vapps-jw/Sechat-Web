export const useUserApi = () => {
  const userStore = useUserStore();
  const config = useRuntimeConfig();
  const sechatApp = useSechatApp();

  const signOut = async () => {
    console.log("--> Signing Out");

    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/account/logout`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    } else {
      userStore.$reset();
    }
    navigateTo("/");
  };

  const getUserData = async () => {
    const config = useRuntimeConfig();
    console.warn("--> API Base", config.public.apiBase);
    const { data: newProfile, error: apiError } = await useFetch<IUserProfile>(
      `${config.public.apiBase}/user/get-profile`,
      {
        credentials: "include",
      }
    );

    if (apiError.value && apiError.value.statusCode === 405) {
      sechatApp.showErrorSnackbar("You are not logged in, unauthorized");
      return;
    }

    if (apiError.value) {
      sechatApp.showErrorSnackbar("Error when loading User Profile");
      return;
    }

    userStore.updateUserProfile(newProfile.value);
    sechatApp.showSuccessSnackbar("User Profile loaded");
    console.warn("--> User profile", userStore.userProfile);
  };

  return {
    signOut,
    getUserData,
  };
};
