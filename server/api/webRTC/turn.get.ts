export default defineEventHandler(async (e) => {
  const config = useRuntimeConfig();

  // console.log(`TURN User: ${config.turnApiKey}`);
  // if (!config.turnApiKey) {
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: "No API key",
  //   });
  // }

  // const response: any = await $fetch(
  //   `https://yourappname.metered.live/api/v1/turn/credentials?apiKey=${config.turnApiKey}`
  // );

  const googleStun = [
    {
      urls: config.stunServer,
      // urls: [
      //   "stun:stun.l.google.com:19302",
      //   "stun:stun1.l.google.com:19302",
      //   "stun:stun2.l.google.com:19302",
      //   "stun:stun3.l.google.com:19302",
      //   "stun:stun4.l.google.com:19302",
      // ],
    },
    {
      urls: config.turnServer,
      username: config.turnUser,
      credential: config.turnPassword,
    },
  ];
  //response[0] = { urls: [...googleStun.urls, response[0].urls] };
  return googleStun;
});
