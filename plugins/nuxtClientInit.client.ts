export default defineNuxtPlugin(async (context) => {
  console.log("--> Client Init Triggered");

  const userData = useUserData();

  console.log("--> Getting User Data");
  await userData.getUserData();
});
