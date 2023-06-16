<template>
  <v-container>
    <div class="d-flex justify-center">
      <div class="text-h4">FAQ</div>
    </div>
    <v-col class="d-flex justify-center align-center">
      <v-expansion-panels variant="accordion">
        <v-expansion-panel
          title="Is it free?"
          text="Yes it is an it will be, but donations are welcome (there will be a button for that using Stripe in the future)"
        ></v-expansion-panel>
        <v-expansion-panel
          title="Why it is secure?"
          text="Messages are stored encrypted on the server, we use TLS 1.3, we do not store any personal data, when you delete a Room all messages are being purged along with a key used to encrypt them, thats it for now."
        ></v-expansion-panel>
        <v-expansion-panel
          title="Is it open source?"
          text="It is and it will be"
        ></v-expansion-panel>
        <v-expansion-panel
          title="Where are data being stored?"
          text="In a data center in the UK"
        ></v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-container>
</template>

<script setup lang="ts"></script>

<style scoped></style>
