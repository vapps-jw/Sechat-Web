export const useUserApi = () => {
  const userStore = useUserStore();
  const config = useRuntimeConfig();

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
    const { data: newProfile, error: apiError } = await useFetch<IUserProfile>(
      `${config.public.apiBase}/user/get-profile`,
      {
        credentials: "include",
      }
    );

    if (apiError.value && apiError.value.statusCode === 405) {
      console.error("--> Not logged in - unauthorized");
      return;
    }

    if (apiError.value) {
      console.error("--> Fetch user profile Error");
      return;
    }

    userStore.updateUserProfile(newProfile.value);
    console.warn("--> User profile", userStore.userProfile);
  };

  return {
    signOut,
    getUserData,
  };
};
