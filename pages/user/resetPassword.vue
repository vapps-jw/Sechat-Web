<template>
  <v-sheet class="bg-transparent pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="380">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          @click:append="showPassword = !showPassword"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          v-model="credentials.password"
          :readonly="loading"
          :rules="credentials.passwordRules"
          clearable
          :counter="20"
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
const route = useRoute();
const token = ref(route.query.token ? route.query.token : "");
const email = ref(route.query.email ? route.query.email : "");

const form = ref(false);
const loading = ref(false);
const sechatStore = useSechatAppStore();
const config = useRuntimeConfig();

interface ICredentials {
  valid: boolean;
  password: string;
  passwordRules: any;
}

const showPassword = ref<boolean>(true);
const buttonText = ref<string>("Change Password");
const buttonColor = ref<string>("warning");
const credentials = ref<ICredentials>({
  valid: true,
  password: "",
  passwordRules: [
    (v) => !!v || "Password is required",
    (v) => (v && v.length <= 20) || "Max 20 characters",
    (v) => (v && v.length > 8) || "Min 8 characters",
    (v) => (v && /[A-Z]/.test(v)) || "At least one Uppercase character",
    (v) => (v && /[a-z]/.test(v)) || "At least one Loercase character",
    (v) => (v && /[0-9]/.test(v)) || "At least one number",
    (v) => (v && /\W/.test(v)) || "At least one special character",
  ],
});

const onSubmit = async () => {
  try {
    const { error: apiError, data: response } = await useFetch(
      `${config.public.apiBase}/account/reset-password`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          email: email,
          token: token,
          newPassword: credentials.value.password,
        },
      }
    );

    console.log("Response", response);

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value?.data ?? "Error occured",
      });
    }

    sechatStore.showSuccessSnackbar(response.value.toString());
    navigateTo("/user/login");
  } catch (error) {
    buttonText.value = "Try Again";
    buttonColor.value = "error";
    sechatStore.showErrorSnackbar(error.statusMessage);
    error.value = null;
  }
};
</script>

<style scoped></style>
