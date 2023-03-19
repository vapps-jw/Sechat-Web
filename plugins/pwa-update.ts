export default async function checkForUpdate(context, err, firstTime = true) {
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
  setTimeout(() => checkForUpdate(context, err, false), 5000);
}
