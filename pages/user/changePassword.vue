<template>
  <v-sheet class="bg-transparent pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="380">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="credentials.oldPassword"
          :readonly="loading"
          clearable
          :counter="20"
          label="Old Password"
        ></v-text-field>

        <v-text-field
          v-model="credentials.newPassword"
          :readonly="loading"
          :rules="credentials.passwordRules"
          clearable
          :counter="20"
          label="New Password"
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
const sechatStore = useSechatAppStore();
const config = useRuntimeConfig();

definePageMeta({
  middleware: ["authenticated"],
});

interface ICredentials {
  valid: boolean;
  oldPassword: string;
  newPassword: string;
  passwordRules: any;
}

const buttonText = ref<string>("Change Password");
const buttonColor = ref<string>("warning");
const credentials = ref<ICredentials>({
  valid: true,
  newPassword: "",
  oldPassword: "",
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
    console.log("Changing password");
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/account/change-password`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          newPassword: credentials.value.newPassword,
          oldPassword: credentials.value.oldPassword,
        },
      }
    );

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    sechatStore.showSuccessSnackbar("Password Changed");
    navigateTo("/user/login");
  } catch (error) {
    console.log("Change Password error", error);
    buttonText.value = "Try Again";
    buttonColor.value = "error";
    sechatStore.showErrorSnackbar(error.statusMessage);
    error.value = null;
  }
};
</script>

<style scoped></style>
