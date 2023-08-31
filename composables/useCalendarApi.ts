export const useCalendarApi = () => {
  const config = useRuntimeConfig();

  const clearCalendar = async () => {
    console.log("Getting Rooms from API");
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/calendar`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }
  };

  return {
    clearCalendar,
  };
};
