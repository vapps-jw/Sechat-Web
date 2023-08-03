export const useUserApi = () => {
  const userStore = useUserStore();

  const getUserData = async () => {
    const config = useRuntimeConfig();
    console.warn("API Base", config.public.apiBase);
    const { data: newProfile, error: apiError } = await useFetch<IUserProfile>(
      `${config.public.apiBase}/user/get-profile`,
      {
        credentials: "include",
      }
    );

    if (apiError.value && apiError.value.statusCode === 405) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: "You are not logged in",
      });
    }

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: "Error when loading User Profile",
      });
    }

    userStore.updateUserProfile(newProfile.value);
    console.warn("User profile", userStore.userProfile);
  };

  return {
    getUserData,
  };
};
