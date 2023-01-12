export const useUserData = () => {
  const userData = useState<IUserProfile>("userProfile", () => {
    return {};
  });
  const isSignedIn = useState("isSignedIn", () => false);

  const config = useRuntimeConfig();

  const setUserData = (user: IUserProfile) => {
    console.log("--> setting user profile", user);
    userData.value = user;
    if (userData.value.userId) {
      isSignedIn.value = true;
      console.log("--> logged in");
      return;
    }
    isSignedIn.value = false;
    console.log("--> not logged in");
  };

  const signIn = async (username: string, password: string) => {
    console.log("--> signing in");

    const { error: loginError } = await useFetch(
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

    if (loginError.value) {
      throw createError({
        ...loginError.value,
        statusMessage: "Sing in Failed",
      });
    }

    await getUserData();

    if (userData.value) {
      console.log("--> navigating to chat");
      navigateTo("/chat");
    }
  };

  const signOut = async () => {
    console.log("--> signing out");

    const { error: loginError } = await useFetch(
      `${config.public.apiBase}/account/logout`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
      }
    );

    if (loginError.value) {
      throw createError({
        ...loginError.value,
        statusMessage: "Logout Failed",
      });
    }
    setUserData({});
  };

  const register = async (username: string, password: string) => {};

  const getUserData = async () => {
    const config = useRuntimeConfig();
    const { data: newProfile, error: profileFetchError } =
      await useFetch<IUserProfile>(
        `${config.public.apiBase}/user/get-profile`,
        {
          credentials: "include",
        }
      );

    if (profileFetchError.value) {
      setUserData({});
      return;
    }

    setUserData(newProfile.value);
  };

  return {
    userData,
    isSignedIn,
    signOut,
    getUserData,
    signIn,
  };
};
