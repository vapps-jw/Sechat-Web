<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-phone-log" variant="outlined"></v-btn>
    </template>

    <v-card class="sechat-v-card-full-h">
      <v-toolbar>
        <v-toolbar-title>Call Logs</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="pa-2">
        <v-virtual-scroll class="log-list" :items="chatStore.callLogs">
          <template v-slot:default="{ item }">
            <div class="d-flex justify-right align-center my-3">
              <v-icon
                color="success"
                v-if="item.videoCallResult === VideoCallLogResult.Answered"
                >mdi-phone</v-icon
              >
              <v-icon
                color="error"
                v-if="item.videoCallResult === VideoCallLogResult.Rejected"
                >mdi-phone-remove</v-icon
              >
              <v-icon
                color="warning"
                v-if="item.videoCallResult === VideoCallLogResult.Unanswered"
                >mdi-phone-missed</v-icon
              >
              <v-avatar
                class="mx-3"
                size="small"
                :color="
                  stringToColor(
                    item.calleeName == userStore.getUserName
                      ? item.phonerName
                      : item.calleeName
                  )
                "
              >
                {{
                  getInitials(
                    item.calleeName == userStore.getUserName
                      ? item.phonerName
                      : item.calleeName
                  )
                }}
              </v-avatar>
              <div class="d-flex justify-start align-start flex-column">
                <div class="tiny-font">
                  {{
                    new Date(item.created).toLocaleString(
                      appStore.localLanguage
                    )
                  }}
                </div>

                <div class="small-font">
                  {{
                    item.calleeName == userStore.getUserName
                      ? item.phonerName
                      : item.calleeName
                  }}
                </div>
              </div>
            </div>
          </template>
        </v-virtual-scroll>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { VideoCallLogResult } from "~/utilities/globalEnums";
import { getInitials, stringToColor } from "~/utilities/stringFunctions";

const dialog = ref<boolean>(false);
const chatStore = useSechatChatStore();
const userStore = useUserStore();
const appStore = useSechatAppStore();
const videoCall = useVideoCall();

watch(dialog, async (newVal, oldVal) => {
  if (!newVal) {
    chatStore.loadCallLogs(await videoCall.getCallLogs());
    return;
  }
  await videoCall.callLogsViewed();
});
</script>

<style scoped>
.log-list {
  height: 78dvh;
}
</style>
