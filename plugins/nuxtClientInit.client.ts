export default defineNuxtPlugin(async (context) => {
  console.warn("--> Client Init Plugin Triggered");
  const userData = useUserApi();

  await userData.getUserData();
});
