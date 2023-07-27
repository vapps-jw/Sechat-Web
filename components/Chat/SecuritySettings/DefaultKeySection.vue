<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="warning"
      variant="tonal"
      title="Default Encryption Key"
      text="Reset the unique server encryption key, all data encrypted with the previous key will be removed"
    ></v-alert>
    <v-card>
      <v-card-actions>
        <v-btn color="success" variant="outlined"> Reset Key </v-btn>
      </v-card-actions>
    </v-card>
  </div>
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
