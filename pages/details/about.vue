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
          title="Is my messages encrypted?"
          text="Messages are stored encrypted on the server by default, we use TLS 1.3, we do not store any personal data, when you delete a Room all messages are being purged along with the key used to encrypt them. E2E encryption can be chosen during Room creation. It`s open source so you can check the code."
        ></v-expansion-panel>
        <v-expansion-panel
          title="What about video calls?"
          text="We have our own TURN server, communication is encrtpted. There is a screen share feature."
        ></v-expansion-panel>
        <v-expansion-panel
          title="Is it open source?"
          text="It is and it will be"
        ></v-expansion-panel>
        <v-expansion-panel
          title="Where are data being stored?"
          text="In a data center in the UK (Akamai/Linode)"
        ></v-expansion-panel>
        <v-expansion-panel
          title="Can I share my opinion about Sechat?"
          text="You will be able to do this soon, I`m working on a contact form for users to report bugs/opinions"
        ></v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-container>
</template>

<script setup lang="ts"></script>

<style scoped></style>
