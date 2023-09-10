<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Contact Requests"
      text="Choose if you want to receive contact invitations from other users"
    ></v-alert>
    <v-card>
      <v-card-actions>
        <v-switch
          color="primary"
          :disabled="busy"
          :loading="busy ? 'primary' : false"
          v-model="userProfile.invitationsAllowed"
          hide-details
          :label="userStore.invitationsPermission"
        ></v-switch>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();

const busy = ref<boolean>(false);

const { userProfile } = storeToRefs(userStore);
watch(
  userProfile,
  async (newVal, oldVal) => {
    console.log("Invitations Permission update", newVal.invitationsAllowed);
    if (newVal.invitationsAllowed && !busy.value) {
      console.log("Invitations Permission patch", true);
      await permissisonUpdate(true);
    } else {
      console.log("Invitations Permission patch", false);
      await permissisonUpdate(false);
    }
  },
  { deep: true }
);

const permissisonUpdate = async (flag: boolean) => {
  busy.value = true;
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/user/invitations-permission`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      credentials: "include",
      body: {
        Flag: flag,
      },
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    busy.value = false;
    return;
  }

  userStore.userProfile.invitationsAllowed = flag;
  busy.value = false;
};
</script>

<style scoped></style>
