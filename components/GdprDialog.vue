<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent width="auto">
      <v-card>
        <v-card-title class="text-h5"> Cookies Consent </v-card-title>
        <v-card-text
          >Chat use cookies for storing user preferences and login</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green-darken-1" variant="text" @click="approved">
            Agree
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { CustomCookies } from "~~/utilities/globalEnums";

const dialog = ref<boolean>(false);
const gdprCookie = useCookie(CustomCookies.GDPR);

console.warn("--> Cookie", gdprCookie.value);

onMounted(async () => {
  console.warn("--> GDPR onMounted");
  console.warn("--> Cookie", gdprCookie.value);
  if (gdprCookie.value) {
    dialog.value = false;
    return;
  }
  dialog.value = true;
});

const approved = () => {
  console.warn("--> Cookies Approved");
  gdprCookie.value = "approved";
  dialog.value = false;
};
</script>

<style scoped></style>
