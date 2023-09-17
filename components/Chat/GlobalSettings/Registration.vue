<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Allow new Users"
    ></v-alert>
    <v-card>
      <v-card-actions>
        <v-switch
          color="primary"
          :disabled="busy"
          :loading="busy ? 'primary' : false"
          :true-value="RegistrationStatus.Allowed"
          :false-value="RegistrationStatus.Forbidden"
          v-model="invitationsAllowed"
          hide-details
          :label="invitationsAllowed"
        ></v-switch>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import {
  RegistrationStatus,
  SettingName,
} from "~/utilities/sechatGlobalSettings";
const userStore = useUserStore();
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();

const busy = ref<boolean>(false);
const invitationsAllowed = ref<string>(
  userStore.globalSettings.find((s) => s.id === SettingName.RegistrationStatus)
    .value
);

watch(
  invitationsAllowed,
  async (newVal, oldVal) => {
    console.log("Invitations Permission update", newVal, oldVal);
    if (newVal === oldVal) {
      return;
    }

    if (newVal && !busy.value) {
      console.log("Invitations Permission patch", newVal);
      await updateSetting(newVal);
    }
    console.log(invitationsAllowed.value);
  },
  { deep: true }
);

const updateSetting = async (value: string) => {
  busy.value = true;
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/admin/global-setting`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      credentials: "include",
      body: {
        id: SettingName.RegistrationStatus,
        value: value,
      },
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    busy.value = false;
    return;
  }

  userStore.globalSettings.find(
    (s) => s.id === SettingName.RegistrationStatus
  ).value = value;
  busy.value = false;
  sechatStore.showSuccessSnackbar("Profile updated");
};
</script>

<style scoped></style>
