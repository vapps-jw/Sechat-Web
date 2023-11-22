<template>
  <v-sheet class="bg-transparent pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="380">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="credentials.username"
          :readonly="loading"
          :rules="credentials.usernameRules"
          class="mb-2"
          clearable
          :counter="10"
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
          :counter="20"
          label="Password"
        ></v-text-field>
        <v-text-field
          @click:append="showReferral = !showReferral"
          :append-icon="showReferral ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showReferral ? 'text' : 'password'"
          v-model="credentials.referralPass"
          :readonly="loading"
          :rules="credentials.referralRules"
          clearable
          :counter="20"
          label="Referall Pass"
        ></v-text-field>
        <v-checkbox
          v-model="credentials.policiesAccepted"
          :rules="[(v) => !!v || 'You must agree to continue!']"
          required
        >
          <template v-slot:label>
            <span style="font-size: 10px"
              >I accept privacy policy, cookie policy and terms of service</span
            >
          </template>
        </v-checkbox>

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

interface ICredentials {
  valid: boolean;
  policiesAccepted: boolean;
  username: string;
  password: string;
  referralPass: string;
  agreementRoles: any;
  usernameRules: any;
  passwordRules: any;
  referralRules: any;
}

const showPassword = ref<boolean>(true);
const showReferral = ref<boolean>(true);

const buttonText = ref<string>("Sign Up");
const buttonColor = ref<string>("warning");
const credentials = ref<ICredentials>({
  valid: true,
  policiesAccepted: false,
  username: "",
  password: "",
  referralPass: "",
  agreementRoles: [(v) => !!v || "You must agree to continue!"],
  usernameRules: [
    (v) => !!v || "Username is required",
    (v) => (v && v.length <= 10) || "Max 10 characters",
  ],
  passwordRules: [
    (v) => !!v || "Password is required",
    (v) => (v && v.length <= 20) || "Max 20 characters",
    (v) => (v && v.length > 8) || "Min 8 characters",
    (v) => (v && /[A-Z]/.test(v)) || "At least one Uppercase character",
    (v) => (v && /[a-z]/.test(v)) || "At least one Loercase character",
    (v) => (v && /[0-9]/.test(v)) || "At least one number",
    (v) => (v && /\W/.test(v)) || "At least one special character",
  ],
  referralRules: [
    (v) => !!v || "Referall is required, ask someone for referral",
    (v) => (v && v.length <= 20) || "Max 20 characters",
    (v) => (v && v.length > 8) || "Min 8 characters",
  ],
});

const onSubmit = async () => {
  try {
    console.log("Signing Up");

    const { error: apiError, data: response } = await useFetch(
      `${config.public.apiBase}/account/register`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          username: credentials.value.username,
          password: credentials.value.password,
          referralPass: credentials.value.referralPass,
        },
      }
    );

    console.log("Response", response);

    if (apiError.value) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value?.data ?? "Sign up failed",
      });
    }

    sechatStore.showSuccessSnackbar("User created");
    navigateTo("/user/login");
  } catch (error) {
    console.log("Sign in error", error);
    buttonText.value = "Try Again";
    buttonColor.value = "error";
    sechatStore.showErrorSnackbar(error.statusMessage);
    error.value = null;
  }
};
</script>

<style scoped></style>
