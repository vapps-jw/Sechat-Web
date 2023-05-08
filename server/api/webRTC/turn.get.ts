export default defineEventHandler(async (e) => {
  const config = useRuntimeConfig();
  const servers = [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
    {
      urls: [config.turnServer],
      username: config.turnUser,
      credential: config.turnPassword,
    },
  ];
  return servers;
});
