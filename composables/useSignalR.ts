const useUserData = () => {
  const profile = useState<UserProfile>("userProfile", () => new UserProfile());

  return { profile };
};

export default useUserData;
