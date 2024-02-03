<template>
  <v-sheet class="bg-transparent pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="344">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          data-cy="sign-in-username"
          v-model="formData.referralPass"
          :readonly="loading"
          :rules="formData.referralRules"
          class="mb-2"
          clearable
          :counter="20"
          label="Referral Pass"
          hint="You can get referral from a registered user"
          persistent-hint
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
  middleware: ["authenticated", "referral-page-middleware"],
});

interface IFormData {
  valid: boolean;
  referralPass: string;
  referralRules: any;
}

const buttonText = ref<string>("Apply Referral");
const buttonColor = ref<string>("warning");
const config = useRuntimeConfig();
const userStore = useUserStore();
const appStore = useSechatAppStore();

const onSubmit = async () => {
  try {
    loading.value = true;
    const { error: apiError, data: claims } = await useFetch<string[]>(
      `${config.public.apiBase}/account/ask-for-chat`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: {
          PassPhrase: formData.value.referralPass.trim(),
        },
      }
    );

    if (!apiError.value) {
      console.log("Claims updated", claims);
      userStore.userProfile.claims = claims.value;
      console.log("Navigating to Chat");
      navigateTo("/chat");
    }

    if (apiError.value && apiError.value.statusCode !== 405) {
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data
          ? apiError.value.data
          : "Connection Error, check you browser settings or internet connection",
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

const formData = ref<IFormData>({
  valid: true,
  referralPass: "",
  referralRules: [
    (v) => !!v || "Referall is required, ask registered user for a referral",
    (v) => (v && v.length <= 20) || "Max 20 characters",
    (v) => (v && v.length > 8) || "Min 8 characters",
  ],
});
</script>

<style scoped></style>
