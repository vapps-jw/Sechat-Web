<template>
  <v-dialog v-model="dialog" persistent>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" color="error" variant="flat">Delete Account</v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h6 text-center">
        Are you really sure ???
      </v-card-title>
      <v-card-actions>
        <v-btn color="success" variant="flat" @click="dialog = false">
          No
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="flat" @click="() => deleteAccount()">
          Yes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);

const emit = defineEmits(["accountDeleteRequested"]);

const deleteAccount = () => {
  emit("accountDeleteRequested");
  dialog.value = false;
};
</script>

<style scoped></style>
