<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        class="ma-0 pa-0"
        icon="mdi-dots-vertical"
        size="x-small"
        variant="text"
        v-bind="props"
      ></v-btn>
    </template>
    <v-list>
      <v-list-item v-if="handleMessageDelete">
        <v-btn @click="handleMessageDelete" color="error"
          >Delete</v-btn
        ></v-list-item
      >
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
const sechatStore = useSechatAppStore();
const config = useRuntimeConfig();

interface PropsModel {
  message: IMessage;
}
const props = defineProps<PropsModel>();

const handleMessageDelete = async () => {
  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/chat/message/${props.message.roomId}/${props.message.id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    return;
  }

  sechatStore.showSuccessSnackbar("Message deleted");
};
</script>

<style scoped></style>
