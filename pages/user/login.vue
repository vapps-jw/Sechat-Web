<template>
  <v-sheet class="bg-transparent pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="344">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          data-cy="sign-in-username"
          v-model="credentials.username"
          :readonly="loading"
          :rules="credentials.nameRules"
          class="mb-2"
          clearable
          label="Name"
        ></v-text-field>

        <v-text-field
          data-cy="sign-in-password"
          @click:append="showPassword = !showPassword"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          v-model="credentials.password"
          :readonly="loading"
          :rules="credentials.passwordRules"
          clearable
          label="Password"
        ></v-text-field>

        <br />
        <v-btn
          data-cy="sign-in-request"
          :disabled="!form"
          :loading="loading"
          block
          :color="buttonColor"
          size="large"
          type="submit"
          variant="elevated"
        >
          {{ buttonText }}
        </v-btn>
      </v-form>
      <v-btn
        data-cy="sign-in"
        @click="navigateTo('/')"
        class="mt-3"
        color="tertiary"
        block
        size="large"
        type="submit"
        variant="elevated"
      >
        Go Back
      </v-btn>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
const form = ref(false);
const loading = ref(false);

definePageMeta({
  middleware: ["login-page-handler"],
});

interface ICredentials {
  valid: boolean;
  username: string;
  password: string;
  nameRules: any;
  passwordRules: any;
}

const showPassword = ref<boolean>(true);
const buttonText = ref<string>("Sign In");
const buttonColor = ref<string>("warning");
const config = useRuntimeConfig();
const userStore = useUserStore();
const appStore = useSechatAppStore();
const userApi = useUserApi();

const onSubmit = async () => {
  try {
    loading.value = true;
    const { error: apiError, data: userProfile } = await useFetch(
      `${config.public.apiBase}/account/login`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          username: credentials.value.username.trim(),
          password: credentials.value.password.trim(),
        },
      }
    );

    if (!apiError.value) {
      console.log("Profile received", userProfile);
      userStore.updateUserProfile(userProfile.value);

      try {
        const result = await userApi.getGlobalSettings();
        console.warn("Updating Global Settings", result);
        userStore.globalSettings = result;
      } catch (error) {
        console.error(error);
      }

      console.log("Navigating to Chat");
      navigateTo("/");
    }

    if (apiError.value && apiError.value.statusCode !== 405) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data
          ? apiError.value.data
          : "Login Error, check you browser settings or internet connection",
      });
    }
  } catch (error) {
    console.error("Login Error", error);
    appStore.showErrorSnackbar(error.statusMessage);
    buttonText.value = "Try Again";
    buttonColor.value = "error";
    error.value = null;
  } finally {
    loading.value = false;
  }
};

const credentials = ref<ICredentials>({
  valid: true,
  username: "",
  password: "",
  nameRules: [(v) => !!v || "Name is required"],
  passwordRules: [(v) => !!v || "Password is required"],
});
</script>

<style scoped></style>
