export const useUserData = () => {
  const userProfile = useState<IUserProfile>("userProfile", () => {
    return {};
  });
  const isSignedIn = useState("isSignedIn", () => false);

  const config = useRuntimeConfig();

  const getUsername = computed(() => {
    return userProfile.value.userName;
  });

  const setUserData = (user: IUserProfile | null) => {
    console.log("--> Setting User Data in the State", user);
    if (user !== null) {
      userProfile.value = user;
      isSignedIn.value = true;
      console.log("--> Logged In");
      return;
    }
    isSignedIn.value = false;
    console.log("--> Not Logged In");
  };

  const signIn = async (username: string, password: string) => {
    console.log("--> Signing In");

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
        statusCode: loginError.value.statusCode,
      });
    }

    await getUserData();

    if (userProfile.value) {
      console.log("--> Navigating to Chat");
      navigateTo("/chat");
    }
  };

  const signOut = async () => {
    console.log("--> Signing Out");

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
      console.error("--> No server not responsed for Sign Out");
    } else {
      setUserData(null);
    }
    navigateTo("/");
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

    if (profileFetchError.value && profileFetchError.value.statusCode === 405) {
      console.error("--> Not logged in - unauthorized");
      setUserData(null);
      return;
    }

    if (profileFetchError.value) {
      console.error("--> Fetch user profile Error");
      setUserData(null);
      return;
    }

    setUserData(newProfile.value);
    console.warn("--> User profile", userProfile.value);
  };

  return {
    userProfile,
    isSignedIn,
    getUsername,
    signOut,
    getUserData,
    signIn,
  };
};
