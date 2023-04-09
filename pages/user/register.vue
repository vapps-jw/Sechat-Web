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
const userData = useUserData();
const form = ref(false);
const loading = ref(false);
const appStore = useSechatApp();

interface ICredentials {
  valid: boolean;
  username: string;
  password: string;
  usernameRules: any;
  passwordRules: any;
}

const showPassword = ref<boolean>(true);
const buttonText = ref<string>("Sign Up");
const buttonColor = ref<string>("warning");

const onSubmit = async () => {
  try {
    await userData.signUp(
      credentials.value.username,
      credentials.value.password
    );
    appStore.showSuccessSnackbar("User created");
    navigateTo("/user/login");
  } catch (error) {
    console.log("--> Sign in error", error);
    buttonText.value = "Try Again";
    buttonColor.value = "error";
    error.value = null;
  }
};

const credentials = ref<ICredentials>({
  valid: true,
  username: "",
  password: "",
  usernameRules: [
    (v) => !!v || "Username is required",
    (v) => (v && v.length <= 10) || "Max 10 characters",
  ],
  passwordRules: [
    (v) => !!v || "Password is required",
    (v) => (v && v.length <= 20) || "Max 20 characters",
    (v) => (v && v.length > 8) || "Min 8 characters",
    (v) => (v && /[A-Z]/.test(v)) || "At least one Uppercase character",
    (v) => (v && /[0-9]/.test(v)) || "At least one number",
    (v) => (v && /\W/.test(v)) || "At least one special character",
  ],
});
</script>

<style scoped></style>
