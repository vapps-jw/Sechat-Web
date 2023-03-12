<template>
  <v-card>
    <v-card-item
      :class="
        isActiveUser(message)
          ? 'flex-end bg-blue-darken-4 rounded-xl rounded-be-0'
          : 'flex-start bg-grey-darken-3 rounded-xl rounded-bs-0'
      "
    >
      <v-card-subtitle
        v-if="userData.getUsername.value === props.message.nameSentBy"
        :class="isActiveUser(message) ? 'text-right' : ''"
        class="text-xs"
      >
        {{
          new Date(props.message.created).toLocaleString(
            appStore.localLanguage.value
          )
        }}</v-card-subtitle
      >
      <v-card-subtitle
        v-else
        :class="isActiveUser(message) ? 'text-right' : ''"
        class="text-xs"
      >
        <strong> {{ props.message.nameSentBy }}</strong>
        {{
          new Date(props.message.created).toLocaleString(
            appStore.localLanguage.value
          )
        }}
      </v-card-subtitle>
      <v-card-text class="px-0 py-0">
        <p
          class="text--primary text-sm"
          :class="isActiveUser(message) ? 'text-right' : ''"
        >
          {{ props.message.text }}
        </p>
      </v-card-text>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
const userData = useUserData();
const appStore = useAppStore();

interface PropsModel {
  message: IMessage;
}

const props = defineProps<PropsModel>();

const isActiveUser = (message: IMessage) => {
  return message.nameSentBy === userData.getUsername.value;
};
</script>

<style scoped></style>
