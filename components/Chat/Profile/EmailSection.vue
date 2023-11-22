<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Email"
      text="Add email if you want to reset your password if you forget it"
    ></v-alert>
    <v-form v-model="form" @submit.prevent="onSubmit" ref="htmlForm">
      <v-text-field
        class="mt-2"
        v-model="emailForm.email"
        :rules="emailForm.emailRules"
        variant="outlined"
      >
        <template v-slot:append-inner>
          <v-icon
            v-if="userStore.getUserEmail && userStore.isEmailConfirmed"
            color="success"
            >mdi-check-bold</v-icon
          >
          <v-icon
            v-else-if="userStore.getUserEmail && !userStore.isEmailConfirmed"
            color="warning"
            >mdi-check-bold</v-icon
          >
          <v-icon v-else color="tertiary">mdi-email-off-outline</v-icon>
        </template>
        <template v-slot:append>
          <v-icon @click="onSubmit" color="warning">mdi-send</v-icon>
        </template>
      </v-text-field>
    </v-form>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const form = ref(false);
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const htmlForm = ref<HTMLFormElement>();

interface IEmail {
  valid: boolean;
  email: string;
  emailRules: any;
}

const emailForm = ref<IEmail>({
  valid: true,
  email: userStore.getUserEmail,
  emailRules: [(v) => /.+@.+/.test(v) || "Invalid Email address"],
});

const onSubmit = async () => {
  console.warn("Updating email...", emailForm.value);

  const { valid } = await htmlForm.value?.validate();
  if (!valid) {
    console.warn("Form not valid", valid);
    return;
  }

  if (emailForm.value.email == userStore.getUserEmail) {
    return;
  }

  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/account/update-email`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        email: emailForm.value.email,
      },
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    return;
  }
  sechatStore.showSuccessSnackbar(
    `Confirmation request sent to ${emailForm.value.email}`
  );
};
</script>

<style scoped></style>
