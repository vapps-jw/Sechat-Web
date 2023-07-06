export default defineNuxtPlugin(async (context) => {
  const disableLogs = () => {
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
  };

  console.warn("--> Client Init Plugin Triggered");
  console.warn("Disabling console", process.env.NODE_ENV);
  process.env.NODE_ENV === "production" ? disableLogs() : null;

  const userData = useUserApi();

  await userData.getUserData();
});
