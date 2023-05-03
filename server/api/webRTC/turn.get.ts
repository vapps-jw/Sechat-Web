export default defineEventHandler(async (e) => {
  const config = useRuntimeConfig();

  console.log(`API Key: ${config.turnApiKey}`);
  if (!config.turnApiKey) {
    throw createError({
      statusCode: 400,
      statusMessage: "No API key",
    });
  }

  const { data: response, error: apiError } = await useFetch(
    `https://yourappname.metered.live/api/v1/turn/credentials?apiKey=${config.turnApiKey}`
  );

  console.warn("--> TURN Servers", response);

  if (apiError.value) {
    throw createError({
      statusCode: 400,
      statusMessage: "TURN Servers fetch error",
    });
  }

  return response;
});
