<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent width="auto">
      <v-card>
        <v-card-title primary-title class="justify-center d-flex align-center">
          <Icon name="noto:cookie" />
          <div class="mx-2">
            <h3 class="headline pink--text text--accent-2">Cookie Time</h3>
          </div>
          <Icon name="noto:cookie" />
        </v-card-title>
        <v-card-text class="py-1"
          >This App uses cookies to store user preferences, user e2e keys, login
          state and monitor site activity.
        </v-card-text>
        <v-card-text class="py-1"
          >We do not use any third-party services. We do not want to have
          anything in common with any big tech company.
        </v-card-text>
        <v-card-text class="py-1"
          >At any time you can remove all of the cookies. Accept it or leave
          this page</v-card-text
        >
        <v-card-actions class="justify-center">
          <v-btn variant="tonal" size="large" color="success" @click="approved">
            I Accept Cookies
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { CustomCookies } from "~~/utilities/globalEnums";

const dialog = ref<boolean>(false);
const gdprCookie = useCookie(CustomCookies.GDPR, {
  maxAge: 30000000,
});

onMounted(async () => {
  console.warn("GDPR onMounted");
  console.warn("GDPR Cookie value:", gdprCookie.value);
  if (gdprCookie.value) {
    dialog.value = false;
    return;
  }
  dialog.value = true;
});

const approved = () => {
  console.warn("Cookies Approved");
  gdprCookie.value = "approved";
  dialog.value = false;
};
</script>

<style scoped></style>
