export default defineNuxtPlugin(async (context) => {
  console.log("--> Client Init Plugin Triggered");
  const userData = useUserApi();
  await userData.getUserData();
});
