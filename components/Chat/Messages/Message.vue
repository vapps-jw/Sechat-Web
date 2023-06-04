<template>
  <v-list-item :key="props.message.id" class="mx-0 px-0">
    <template v-slot:title>
      <v-card-subtitle class="tiny-font mx-0 px-0">
        <p
          class="sender-details d-inline text-subtitle-2"
          :style="`color: ${props.message.colorSentBy}`"
        >
          {{ props.message.nameSentBy }}
        </p>
        {{
          new Date(props.message.created).toLocaleString(appStore.localLanguage)
        }}
      </v-card-subtitle>
      <v-card-subtitle class="tiny-font mx-0 px-0">
        <v-chip
          variant="text"
          v-for="seenBy in props.message.messageViewers.filter(
            (mv) =>
              mv.user !== userStore.getUserName &&
              mv.user !== props.message.nameSentBy
          )"
          class="ma- 0 pa-1"
          size="x-small"
          append-icon="mdi-eye-check-outline"
        >
          {{ seenBy.user }}
        </v-chip>
      </v-card-subtitle>
    </template>
    <template v-slot:subtitle>
      <v-card-text class="px-0 py-0">
        <div
          class="text--primary text-sm mb-3"
          v-html="props.message.text"
        ></div>
      </v-card-text>
    </template>
    <template v-slot:prepend>
      <v-avatar :color="props.message.colorSentBy" class="mx-2">
        {{ props.message.initialsSentBy }}</v-avatar
      >
    </template>
  </v-list-item>

  <!-- <div class="d-flex flex-row align-center my-3">
          <v-avatar color="surface-variant" class="mx-2"></v-avatar>

          <div class="d-flex flex-column">
            <div class="d-flex flex-row align-center">
              <div class="text-subtitle-2 mx-1">{{ item.nameSentBy }}</div>
              <div class="tiny-font">
                {{
                  new Date(item.created).toLocaleString(appStore.localLanguage)
                }}
              </div>
            </div>

            <div class="mx-2" v-html="item.text"></div>
          </div>
        </div> -->

  <!-- <v-card>
    <v-card-item>
      <v-card-subtitle
        v-if="userStore.getUserName === props.message.nameSentBy"
        class="tiny-font"
      >
        {{
          new Date(props.message.created).toLocaleString(appStore.localLanguage)
        }}</v-card-subtitle
      >
      <v-card-subtitle v-else class="tiny-font">
        <p class="sender-details d-inline">{{ props.message.nameSentBy }}</p>
        {{
          new Date(props.message.created).toLocaleString(appStore.localLanguage)
        }}
      </v-card-subtitle>
      <v-card-text class="px-0 py-0">
        <div
          class="text--primary text-sm mb-3"
          v-html="props.message.text"
        ></div>

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
      </v-card-text>
    </v-card-item>
  </v-card> -->
</template>

<script setup lang="ts">
const appStore = useSechatAppStore();
const userStore = useUserStore();

interface PropsModel {
  message: IMessage;
}

const props = defineProps<PropsModel>();
</script>

<style scoped>
.tiny-font {
  font-size: x-small;
}
.sender-details {
  font-weight: bold;
}
</style>
