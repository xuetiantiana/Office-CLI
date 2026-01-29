<template>
  <div class="home-template">
    <ChatSidebar class="chat-sidebar" />
    <div
      style="
        display: flex;
        flex-direction: row;
        justify-content: center;
        flex: 1;
        background-color: #fafafa;
      "
    >
      <div
        style="
          width: calc((100vw - 300px) * 0.75);
          min-width: 800px;
          max-width: 1000px;
          padding-bottom: 2em;
        "
      >
        <div
          style="
            min-height: calc(45vh - 7em);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
          "
        >
          <h2>Welcome! What can I help you with today?</h2>
        </div>
        <div style="">
          <ChatInput
            ref="chatInputRef"
            :chatHistory="[]"
            class="chat-box"
            @sendMessage="sendMessage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import ChatSidebar from "@/components/ChatSidebar.vue";
import ChatInput from "../components/ChatInput.vue";
import { useFileStore } from "@/stores/fileStore.js";
import { useSessionStore } from "@/stores/sessionStore.js";
import { v4 as uuidv4 } from "uuid";

const router = useRouter();
const route = useRoute();
const sessionStore = useSessionStore();

function generateId() {
  // return crypto.randomUUID();
  return uuidv4();
}
const chatHistory = ref([]);
const session_id = ref(null);
const chatInputRef = ref(null);

const sendMessage = async (text) => {
  if (!text || text.trim().length == 0) {
    return;
  }
  const messageText = text.trim();

  // ① push user 消息
  chatHistory.value.push({
    role: "user",
    text: messageText,
    // data: { role: "user", content: messageText },
  });

  if (route.path === "/") {
    // 如果是在首页send，跳转到chat/:session_id页面
    if (!session_id.value) {
      session_id.value = generateId();
    }
    save();
    // 使用Pinia store存储待传递的文件
    const fileStore = useFileStore();
    fileStore.setPendingFiles(chatInputRef.value.selectFilesObjsArray);

    // 跳转到聊天页面
    router.push(`/chat/${session_id.value}`);
  } else {
    // 在chat页面
  }
};

// ---- 保存 session 到 localStorage ----
function save() {
  const session = sessionStore.getSessionById(session_id.value);

  if (session) {
    sessionStore.updateChatHistoryById(session_id.value, chatHistory.value);
  } else {
    // 首条消息放入 session
    sessionStore.addSession({
      session_id: session_id.value,
      chatHistory: chatHistory.value,
    });
  }
}

onMounted(() => {
  // 加载 sessions 到 store
  sessionStore.loadSessions();
});
</script>

<style lang="scss" scoped>
.home-template {
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

  h2 {
    padding: 1em;
    text-align: center;
    font-weight: 600;
    font-size: 2em;
    letter-spacing: 1px;
  }
}
</style>