<template>
  <v-card>
    <v-card-item
      :class="
        isActiveUser(props.message)
          ? 'flex-end bg-blue-darken-4 rounded-xl rounded-be-0'
          : 'flex-start bg-grey-darken-3 rounded-xl rounded-bs-0'
      "
    >
      <v-card-subtitle
        v-if="userStore.getUserName === props.message.nameSentBy"
        :class="isActiveUser(props.message) ? 'text-right' : ''"
        class="tiny-font"
      >
        {{
          new Date(props.message.created).toLocaleString(appStore.localLanguage)
        }}</v-card-subtitle
      >
      <v-card-subtitle
        v-else
        :class="isActiveUser(message) ? 'text-right' : ''"
        class="tiny-font"
      >
        <p class="sender-details d-inline">{{ props.message.nameSentBy }}</p>
        {{
          new Date(props.message.created).toLocaleString(appStore.localLanguage)
        }}
      </v-card-subtitle>
      <v-card-text class="px-0 py-0">
        <div
          class="text--primary text-sm mb-3"
          :class="isActiveUser(props.message) ? 'text-right' : ''"
          v-html="props.message.text"
        ></div>

        <div class="d-flex justify-end">
          <v-chip
            v-for="seenBy in props.message.messageViewers.filter(
              (mv) =>
                mv.user !== userStore.getUserName &&
                mv.user !== props.message.nameSentBy
            )"
            class="mt-1 ml-1"
            size="x-small"
            append-icon="mdi-eye-check-outline"
          >
            {{ seenBy.user }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
const appStore = useSechatAppStore();
const userStore = useUserStore();

interface PropsModel {
  message: IMessage;
}

const props = defineProps<PropsModel>();

const isActiveUser = (message: IMessage) => {
  return message.nameSentBy === userStore.getUserName;
};
</script>

<style scoped>
.tiny-font {
  font-size: x-small;
}
.sender-details {
  color: #ffc107;
  font-weight: bold;
}
</style>
