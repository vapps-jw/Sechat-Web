import type { UserProfile } from "~/data/classes/userProfile";

export const useUserApi = () => {
  const config = useRuntimeConfig();

  const getUserData = async () => {
    const { data: newProfile, error: apiError } = await useFetch<UserProfile>(
      `${config.public.apiBase}/user/get-profile`,
      {
        method: "GET",
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

    return newProfile.value;
  };

  const getGlobalSettings = async (): Promise<GlobalSetting[]> => {
    const { data: globalSettings, error: apiError } = await useFetch<
      GlobalSetting[]
    >(`${config.public.apiBase}/admin/global-settings`, {
      method: "GET",
      credentials: "include",
    });

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
        statusMessage: "Error when loading Global Settings",
      });
    }

    return globalSettings.value;
  };

  return {
    getGlobalSettings,
    getUserData,
  };
};
