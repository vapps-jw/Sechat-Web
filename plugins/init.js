export default defineNuxtPlugin(async (nuxtApp) => {
  if (process.server) {
    const header = useRequestHeaders(["cookie"]);

    if (header["cookie"]) {
      const data = await $fetch("http://localhost:5000/auth/test", {
        headers: useRequestHeaders(["cookie"]),
      });
      console.log(data);
    }
  }
});
