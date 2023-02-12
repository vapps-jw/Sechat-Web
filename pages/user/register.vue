<template>
  <v-sheet class="bg-transparent pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="344">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="credentials.username"
          :readonly="loading"
          :rules="[credentials.nameRules]"
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
          :rules="[credentials.passwordRules]"
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
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
const userData = useUserData();
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
const buttonText = ref<string>("Sign Up");
const buttonColor = ref<string>("success");

const onSubmit = async () => {
  try {
    await userData.signIn(
      credentials.value.username,
      credentials.value.password
    );
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
  nameRules: [(v) => !!v || "Name is required"],
  passwordRules: [(v) => !!v || "Password is required"],
});
</script>

<style scoped></style>
