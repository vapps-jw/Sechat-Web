<template>
  <v-sheet class="bg-transparent pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="344">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="credentials.username"
          :readonly="loading"
          :rules="credentials.nameRules"
          class="mb-2"
          clearable
          label="Name"
        ></v-text-field>

        <v-text-field
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
const userApi = useUserApi();
const sechatApp = useSechatApp();

const onSubmit = async () => {
  try {
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/account/login`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          username: credentials.value.username,
          password: credentials.value.password,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data ?? "Sign in failed",
      });
    }

    await userApi.getUserData();

    if (userStore.profilePresent) {
      userStore.updateSignIn(true);
      console.log("--> Navigating to Chat");
      navigateTo("/chat");
    }
  } catch (error) {
    console.log("--> Sign up error", error);
    buttonText.value = "Try Again";
    buttonColor.value = "error";
    sechatApp.showErrorSnackbar(error.statusMessage);
    error.value = null;
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
