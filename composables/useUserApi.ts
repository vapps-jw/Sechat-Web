export const useUserData = () => {
  const userStore = useUserStore();
  const config = useRuntimeConfig();

  const setUserData = (user: IUserProfile | null) => {
    console.log("--> Setting User Data in the State", user);
    if (user !== null) {
      userStore.updateUserProfile(user);
      userStore.updateSignIn(true);
      console.log("--> Logged In");
      return;
    }
    userStore.updateSignIn(false);
    console.log("--> Not Logged In");
  };

  const signIn = async (username: string, password: string) => {
    console.log("--> Signing In");

    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/account/login`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          username: username,
          password: password,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    await getUserData();

    if (userStore.profilePresent) {
      console.log("--> Navigating to Chat");
      navigateTo("/chat");
    }
  };

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
      setUserData(null);
    }
    navigateTo("/");
  };

  const signUp = async (username: string, password: string) => {
    console.log("--> Signing Up");

    const { error: apiError, data: response } = await useFetch(
      `${config.public.apiBase}/account/register`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          username: username,
          password: password,
        },
      }
    );

    console.log("--> Response", response);

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }
  };

  const changePassword = async (newPassword: string, oldPassword: string) => {
    console.log("--> Changing password");
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/account/change-password`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: { newPassword, oldPassword },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }
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
      setUserData(null);
      return;
    }

    if (apiError.value) {
      console.error("--> Fetch user profile Error");
      setUserData(null);
      return;
    }

    setUserData(newProfile.value);
    console.warn("--> User profile", userStore.userProfile);
  };

  return {
    changePassword,
    signOut,
    getUserData,
    signIn,
    signUp,
  };
};
