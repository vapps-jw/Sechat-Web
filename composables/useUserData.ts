export const useUserData = () => {
  const userProfile = useState<IUserProfile>("userProfile", () => {
    return {};
  });
  const isSignedIn = useState("isSignedIn", () => false);

  const config = useRuntimeConfig();

  const getUsername = computed(() => userProfile.value.userName);

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
      const displayError = createError({
        ...loginError.value,
        statusMessage: "Sign in Failed",
        statusCode: loginError.value.statusCode,
      });
      console.log("--> Throwing Error", displayError);
      throw displayError;
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

  const signUp = async (username: string, password: string) => {
    console.log("--> Signing Up");

    const { error: loginError, data: response } = await useFetch(
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

    if (loginError.value) {
      const displayError = createError({
        ...loginError.value,
        statusMessage: "Sign up Failed",
        statusCode: loginError.value.statusCode,
      });
      console.log("--> Throwing Error", displayError);
      throw displayError;
    }
  };

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
    signUp,
  };
};
