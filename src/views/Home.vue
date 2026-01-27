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
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import ChatSidebar from "@/components/ChatSidebar.vue";
import ChatInput from "../components/ChatInput.vue";
import { useFileStore } from "@/stores/fileStore.js";
import { v4 as uuidv4 } from "uuid";

const router = useRouter();
const route = useRoute();

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
  const chatHistoryList = JSON.parse(
    localStorage.getItem("session_id_chat_history_list") || "[]"
  );
  const idx = chatHistoryList.findIndex(
    (s) => s.session_id === session_id.value
  );

  if (idx !== -1) {
    chatHistoryList[idx].session_title = sessionTitle.value;
    chatHistoryList[idx].chatHistory = chatHistory.value;
    localStorage.setItem(
      "session_id_chat_history_list",
      JSON.stringify(chatHistoryList)
    );
  } else {
    // 首条消息放入 session

    chatHistoryList.push({
      session_id: session_id.value,
      chatHistory: chatHistory.value,
    });

    localStorage.setItem(
      "session_id_chat_history_list",
      JSON.stringify(chatHistoryList)
    );
  }
}
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