<template>
  <v-list-item>
    <v-form v-model="form" @submit.prevent="onSubmit">
      <v-text-field
        class="mt-2"
        append-inner-icon="mdi-send"
        @click:append-inner="onSubmit"
        v-model="emailForm.email"
        :rules="emailForm.emailRules"
        variant="outlined"
      >
        <template v-slot:append>
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
      </v-text-field>
    </v-form>
  </v-list-item>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const form = ref(false);
const config = useRuntimeConfig();
const appStore = useSechatAppStore();

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
  console.warn("--> Updating email...", emailForm.value);

  const { error: apiError, data: response } = await useFetch(
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
    appStore.showErrorSnackbar(apiError.value.data);
    return;
  }
  appStore.showSuccessSnackbar(
    `Confirmation request sent to ${emailForm.value.email}`
  );
};
</script>

<style scoped></style>
