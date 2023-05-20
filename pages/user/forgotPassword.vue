<template>
  <v-sheet class="bg-transparent pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="380">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="credentials.email"
          :readonly="loading"
          :rules="credentials.emailRules"
          clearable
          label="Email"
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
const appStore = useSechatApp();
const sechatApp = useSechatApp();
const config = useRuntimeConfig();

interface ICredentials {
  valid: boolean;
  email: string;
  emailRules: any;
}

const buttonText = ref<string>("Reset Password");
const buttonColor = ref<string>("warning");
const credentials = ref<ICredentials>({
  valid: true,
  email: "",
  emailRules: [(v) => /.+@.+/.test(v) || "Invalid Email address"],
});

const onSubmit = async () => {
  try {
    const { error: apiError, data: response } = await useFetch(
      `${config.public.apiBase}/account/forgot-password`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          email: credentials.value.email,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value?.data ?? "Error occured",
      });
    }

    appStore.showSuccessSnackbar(response.value.toString());
    credentials.value.valid = true;
    credentials.value.email = "";
    navigateTo("/");
  } catch (error) {
    buttonText.value = "Try Again";
    buttonColor.value = "error";
    sechatApp.showErrorSnackbar(error.statusMessage);
    error.value = null;
  }
};
</script>

<style scoped></style>
