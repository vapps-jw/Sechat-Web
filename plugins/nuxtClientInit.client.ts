export default defineNuxtPlugin(async (context) => {
  console.log("--> client init triggered");
  const userData = useUserData();
  await userData.getUserData();
});
