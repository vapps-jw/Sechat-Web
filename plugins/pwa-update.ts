export default defineNuxtPlugin(async (context, firstTime = true) => {
  // TODO delete in the future
  const updatAction = async (context, firstTime) => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log("--> Checking for PWA update");
        registration.update();
        if (firstTime) {
          registration.addEventListener("updatefound", () => {
            // any code you need to do to suppress "unsaved changes" warnings
            window.location.reload();
          });
        }
      }
    }
  };

  //setInterval(async () => await updatAction(context, false), 5000);
});
