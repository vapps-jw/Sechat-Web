<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Referral Pass"
      text="Referall pass is required if someone wants to register, you can create referral pass and share it"
    ></v-alert>
    <v-form v-model="form" @submit.prevent="onSubmit" ref="referralChangeForm">
      <v-text-field
        :loading="isBusy"
        class="mt-2"
        v-model="referralPassForm.referralPass"
        :rules="referralPassForm.referralRules"
        variant="outlined"
      >
        <template v-slot:append-inner>
          <v-icon v-if="userStore.getReferralPass" color="success"
            >mdi-check-bold</v-icon
          >
          <v-icon v-else color="tertiary"
            >mdi-checkbox-blank-off-outline</v-icon
          >
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
const referralChangeForm = ref<HTMLFormElement>();
const isBusy = ref<boolean>(false);

interface IReferralPass {
  valid: boolean;
  referralPass: string;
  referralRules: any;
}

const referralPassForm = ref<IReferralPass>({
  valid: true,
  referralPass: userStore.getReferralPass,
  referralRules: [
    (v) => !!v || "Referall is required",
    (v) => (v && v.length <= 20) || "Max 20 characters",
    (v) => (v && v.length > 8) || "Min 8 characters",
  ],
});

const onSubmit = async () => {
  console.warn("Updating referrall...", referralPassForm.value);

  const { valid } = await referralChangeForm.value?.validate();
  if (!valid) {
    console.warn("Form not valid", valid);
    return;
  }

  if (referralPassForm.value.referralPass == userStore.getReferralPass) {
    return;
  }

  isBusy.value = true;

  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/account/referral-pass`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        passPhrase: referralPassForm.value.referralPass,
      },
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    isBusy.value = false;
    return;
  }
  userStore.userProfile.referralPass = referralPassForm.value.referralPass;
  sechatStore.showSuccessSnackbar("Referral Pass updated");
  isBusy.value = false;
};
</script>

<style scoped></style>
