<template>
  <div class="chat-template">
    <ChatSidebar class="chat-sidebar" />
    <ChatBox class="chat-box" :sessionId="sessionId" />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import ChatBox from "@/components/ChatBox.vue";
import ChatSidebar from "@/components/ChatSidebar.vue";

const route = useRoute();

// const sessionId = useRoute().params.sessionId;
const sessionId = ref(null);
sessionId.value = route.params.sessionId;

watch(
  () => route.params.sessionId,
  (newId, oldId) => {
    console.log("SessionId changed:", newId);
    sessionId.value = newId;
  }
);
</script>


<style lang="scss" scoped>
.chat-template {
  width: 100%;
  min-width: 1028px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  .chat-sidebar {
    width: 12em;
  }
  .chat-box {
    flex: 1;
  }
}
</style>