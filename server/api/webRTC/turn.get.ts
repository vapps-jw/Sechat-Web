export default defineEventHandler(async (e) => {
  const config = useRuntimeConfig();
  const servers = [
    {
      urls: config.stunServer,
    },
    {
      urls: config.turnServer,
      username: config.turnUser,
      credential: config.turnPassword,
    },
  ];
  return servers;
});
