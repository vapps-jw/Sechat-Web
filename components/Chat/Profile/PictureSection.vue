<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Profile Picture"
      text="Choose a picture as your avatar"
    ></v-alert>
    <v-card>
      <v-card-actions>
        <v-file-input
          accept="image/png, image/jpeg, image/bmp"
          placeholder="Pick an avatar"
          prepend-icon="mdi-camera"
          label="Profile picture"
          v-model="chosenFile"
        >
          <template v-slot:append>
            <v-icon @click="profilePictureUpdate" color="warning"
              >mdi-send</v-icon
            >
          </template></v-file-input
        >
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const sechatStore = useSechatAppStore();
const config = useRuntimeConfig();

const busy = ref<boolean>(false);
const chosenFile = ref<File[]>(null);

const profilePictureUpdate = async () => {
  if (!chosenFile.value) {
    console.warn("No File");
    return;
  }
  busy.value = true;

  const formData = new FormData();
  formData.append("image", chosenFile.value[0]);

  const { error: apiError, data: processedImage } =
    await useFetch<ProcessedImageResponse>(
      `${config.public.apiBase}/user/profile-picture`,
      {
        method: "PATCH",
        credentials: "include",
        body: formData,
      }
    );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    busy.value = false;
    return;
  }

  console.log("Processed Image Response", processedImage);
  userStore.userProfile.profilePicture = processedImage.value.data;
  busy.value = false;
};
</script>

<style scoped></style>
