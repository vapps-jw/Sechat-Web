<template>
  <v-list-item :key="props.message.id">
    <template v-if="showHeader" v-slot:title>
      <div class="d-flex align-center">
        <ChatUserAvatar
          class="ma-2"
          :active="userStore.getUserName === props.message.nameSentBy"
          :user-name="props.message.nameSentBy"
          :picture="props.image"
          size="default"
        />
        <chat-messages-direct-message-options
          :message="props.message"
          :disabled="userStore.getUserName !== props.message.nameSentBy"
        />
        <v-card-subtitle class="tiny-font mx-0 px-0">
          <p class="d-inline text-subtitle-2 font-weight-bold text-white">
            {{ props.message.nameSentBy }}
          </p>
          {{
            new Date(props.message.created).toLocaleString(
              appStore.localLanguage
            )
          }}
        </v-card-subtitle>
      </div>
    </template>
    <template v-slot:subtitle>
      <v-card-text class="px-0 py-0">
        <v-badge
          offset-x="5"
          offset-y="3"
          v-if="props.message.loaded"
          location="bottom start"
          color="transparent"
        >
          <template v-slot:badge>
            <v-icon
              v-if="
                props.message.wasViewed &&
                props.message.nameSentBy === userStore.getUserName
              "
              color="success"
              >mdi-eye-check-outline</v-icon
            >
          </template>
          <div
            class="text--primary text-sm mb-3"
            :class="props.message.error ? 'error-font' : ''"
            v-html="props.message.text"
          ></div>
        </v-badge>
        <v-skeleton-loader v-else type="paragraph"></v-skeleton-loader>
      </v-card-text>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
const appStore = useSechatAppStore();
const userStore = useUserStore();

interface PropsModel {
  message: IDirectMessage;
  image?: string;
  showHeader?: boolean;
}

const props = defineProps<PropsModel>();
</script>

<style scoped>
.tiny-font {
  font-size: x-small;
}
</style>
