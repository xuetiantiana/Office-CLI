<template>
  <ChatBox :sessionId="sessionId" />
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import ChatBox from "@/components/ChatBox.vue";

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