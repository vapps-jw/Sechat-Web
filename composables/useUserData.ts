export const useUserData = () => {
  const userData = useState<IUserProfile>("user", () => {
    return {};
  });

  const setUserData = (user: IUserProfile) => {
    console.log("setting iser profile", user);
    userData.value = user;
  };

  return { userData, setUserData };
};
