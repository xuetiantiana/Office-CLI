<template>
  <div class="chat-section-container app-container">
    <!-- Left: Chat Panel -->
    <div class="chat-panel">
      <div class="chat-header">
        <div class="header-left">
          <h1 style="min-height: 2em" class="app-title">{{ sessionTitle }}</h1>
        </div>
      </div>
      <!-- chat message list -->
      <ChatIMessageList
        :chatHistory="chatHistory"
        :chatLoading="chatLoading"
        :sessionId="sessionId"
        @reloadDocument="reLoadPDF"
      />
      <!-- chat input -->
      <ChatInput
        ref="chatInputRef"
        :chatHistory="chatHistory"
        :chatLoading="chatLoading"
        :newCase="newCase"
        @sendMessage="handleSendMessage"
        @StopBtnClick="StopBtnClick"
      />
    </div>
    <!-- Right: Preview/Detail Panel -->
    <div style="flex: 1">
      <PreviewDocument
        ref="previewDocumentRef"
        :sessionId="sessionId"
        :pdfBlobUrl="pdfBlobUrl"
        :loadingPdf="loadingPdf"
        @handleReloadPDF="reLoadPDF"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Plus, Microphone } from "@element-plus/icons-vue";
import PreviewDocument from "@/components/PreviewDocument.vue";
import ChatInput from "@/components/ChatInput.vue";
import ChatIMessageList from "@/components/ChatIMessageList.vue";

import { onMounted } from "vue";
import {
  chatStream,
  refreshPDF,
  getUpdatePdf,
} from "@/service/chatMangerApi.js";
import { ChatStop } from "@/service/api.ts";
import { v4 as uuidv4 } from "uuid";
import { useFileStore } from "@/stores/fileStore.js";

const props = defineProps({
  sessionId: String,
});
const router = useRouter();
const route = useRoute();
const chatInputRef = ref(null);

const session_id = ref(null);
const sessionTitle = ref(null);
const chatHistory = ref([]);
const pdfUrl = ref("");
const pdfBlobUrl = ref("");

const chatLoading = ref(false);

function loadSession(sessionId) {
  chatLoading.value = false;
  chatHistory.value = [];
  pdfBlobUrl.value = "";
  pdfUrl.value = "";

  if (!sessionId) {
    return;
  }
  const chatHistoryList = JSON.parse(
    localStorage.getItem("session_id_chat_history_list") || "[]"
  );
  const session = chatHistoryList.find((s) => s.session_id === sessionId);

  if (session) {
    sessionTitle.value = session.session_title;
    chatHistory.value = session.chatHistory;

    // 如果只有一条用户消息，需要自动请求chat接口
    if (chatHistory.value.length === 1) {
      callChatStreamApi();
      return;
    }
  } else {
    alert("该session_id无历史记录");
    router.push("/");
    return;
  }

  // 已存在直接复用
  console.log("pdfBlobMap", pdfBlobMap);
  if (pdfBlobMap.has(sessionId)) {
    pdfBlobUrl.value = pdfBlobMap.get(sessionId);
    return;
  } else {
    reLoadPDF(sessionId);
  }
}
// 页面首次进入
onMounted(async () => {
  session_id.value = props.sessionId;

  sessionTitle.value = route.query.title;
  // 使用Pinia store获取待传递的文件
  const fileStore = useFileStore();
  const pendingFiles = fileStore.getAndClearPendingFiles();

  if (pendingFiles.length > 0) {
    chatInputRef.value.selectFilesObjsArray = pendingFiles;
    console.log("onMounted: Received files from store", pendingFiles);
  }
  console.log("onMounted", chatInputRef.value.selectFilesObjsArray);

  loadSession(props.sessionId);
});
// 切换 session_id
watch(
  () => props.sessionId,
  (newId) => {
    session_id.value = newId;
    loadSession(newId);
  }
);

const sendMessage = async (text) => {
  if(chatLoading.value) {
    return;
  }
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
    callChatStreamApi();
  }
};

const handleSendMessage = (text) => {
  sendMessage(text);
};

const callChatStreamApi = async () => {
  chatLoading.value = true;
  // ② push assistant 空消息（准备流式填充）
  const assistantMsg = reactive({
    role: "model",
    text: "",
    // streaming: true,
    // data: { role: "user", content: "" },
  });
  setTimeout(() => {
    chatHistory.value.push(assistantMsg);
  }, 100);

  // ③ 调用 chatStream

  if (!session_id.value) {
    session_id.value = generateId();
  }

  const fd = new FormData();

  const payload = {
    session_id: session_id.value,
    messages: chatHistory.value,
  };
  fd.append("payload", payload);

  // 图片字段：全部放到 form.file -> file
  // selectedFiles.value.forEach(file => {
  //   fd.append("images", file);
  // });
  const sessionId = session_id.value;
  console.log("!", chatInputRef.value.selectFilesObjsArray);
  await chatStream(
    {
      payload: payload,
      images: chatInputRef.value.selectFilesObjsArray
        // .filter((item) => item.isImage)
        .map((item) => item.file),
    },
    {
      onStart: () => {
        console.log("🔵 onStart");
      },

      onDelta: (delta) => {
        console.log("onDelta", delta);
        if (sessionId !== session_id.value) {
          return;
        }
        assistantMsg.text += delta; // 🔥 实时流式显示
      },

      onEnd: (final) => {
        if (sessionId !== session_id.value) {
          return;
        }
        // assistantMsg.streaming = false;
        console.log("🏁 完成:", final);
        chatLoading.value = false;

        if (!sessionTitle.value) {
          setChatName();
        } else {
          reLoadPDF(session_id.value);
        }

        chatInputRef.value.selectFilesObjsArray = [];
      },

      onError: (err) => {
        // assistantMsg.streaming = false;
        if (sessionId !== session_id.value) {
          return;
        }
        assistantMsg.text +=
          "\n<i>[❌ An unexpected error occurred during the chat process. Please try again.]<i>";
        console.error("❌ error:", err);
        chatLoading.value = false;
      },
    }
  );

  save();
};

const emit = defineEmits(["updateSessionTitleList"]);
const setChatName = async () => {
  let title = "";
  const payload = {
    session_id: session_id.value,
    messages: [
      ...chatHistory.value,
      {
        role: "user",
        // 修改chat，使chat尽量总结出一个title 、、test
        text: 'Summarize our conversation into a chat title and return it as JSON, for example: {"name": "xxx", "has_name": true}. If no relevant name can be generated, return {"name": "NewChat", "has_name": false}. The title language must match the conversation language (for example, return Chinese for Chinese conversations and English for English conversations).',
      },
    ],
  };
  const sessionId = session_id.value;
  await chatStream(
    { payload: payload },
    {
      onStart: () => {
        console.log("🔵 onStart");
      },

      onDelta: (delta) => {
        if (sessionId !== session_id.value) {
          return;
        }
        console.log("onDelta", delta);
        title += delta; // 🔥 实时流式显示
      },

      onEnd: (final) => {
        if (sessionId !== session_id.value) {
          return;
        }
        // assistantMsg.streaming = false;
        console.log("🏁 完成:", final, title);

        const result = parseChatJson(title);
        if (result.has_name) {
          sessionTitle.value = result.name;
          reLoadPDF(session_id.value);
        }
        save();
        // 更新sessionList的title显示
        emit("updateSessionTitleList", { sessionId: session_id.value });
      },

      onError: (err) => {
        console.error("❌ error:", err);
      },
    }
  );
};

const loadingPdf = ref(false);
const pdfBlobMap = new Map(); // sessionId => blobUrl
const MAX_CACHE = 5;

async function reLoadPDF(sessionId) {
  if (!sessionId) {
    return;
  }

  loadingPdf.value = true;
  try {
    let url = refreshPDF(sessionId);
    const res = await fetch(url);

    if (sessionId !== session_id.value) {
      return;
    }

    if (!res.ok) {
      const error = new Error();
      error.status = res.status;
      if (res.status === 404) {
        error.message = "PDF 文件不存在 (404)";
      } else {
        error.message = `PDF 请求失败 (${res.status})`;
      }
      throw error;
    }
    console.log("sessionId", sessionId, session_id.value);
    if (sessionId !== session_id.value) {
      return;
    }
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    if (pdfBlobUrl.value) {
      URL.revokeObjectURL(pdfBlobUrl.value);
    }
    pdfBlobUrl.value = blobUrl;
    pdfBlobMap.set(sessionId, blobUrl);

    // ② 超过最大缓存数量 → 淘汰最早的
    if (pdfBlobMap.size > MAX_CACHE) {
      const [oldSessionId, oldBlobUrl] = pdfBlobMap.entries().next().value; //["最早插入的 sessionId", "对应的 blobUrl"]

      URL.revokeObjectURL(oldBlobUrl);
      pdfBlobMap.delete(oldSessionId);
    }
  } catch (e) {
    if (sessionId !== session_id.value) {
      return;
    }
    if (e.status === 404) {
      // chatHistory.value.push({
      //   role: "model",
      //   text: "<i>[❌ PDF 文件不存在 (404)。请检查文件是否已被删除或移动。]<i>",
      // });
    } else {
      chatHistory.value.push({
        role: "model",
        text: "<i>[❌ Failed to load the document. Please manually click <b>‘Reload Document’</b> to try again.]<i>",
      });
    }
    console.error(e);
  } finally {
    loadingPdf.value = false;
  }
}

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

function generateId() {
  // return crypto.randomUUID();
  return uuidv4();
}

const StopBtnClick = () => {
  if (session_id.value) {
    ChatStop({
      session_id: session_id.value,
      command: "stop",
    });
  }
};

function parseChatJson(text) {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);

  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch (err) {
    console.error("JSON parse error:", err);
    return null;
  }
}
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;

  /* ==================== Left Chat Panel ==================== */
  .chat-panel {
    width: calc(48vw - 150px);
    min-width: 500px;
    // max-width: 800px;
    display: flex;
    flex-direction: column;
    background-color: #fafafa;
    border-right: 1px solid var(--border-color);
    transition: background-color var(--transition-speed);
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1em;
      border-bottom: 1px solid #eee;
      background-color: var(--bg-primary);
      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        .app-title {
          font-size: 1.1em;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }

    /* ==================== Message Area ==================== */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }

  /* Conversation Item Styles (for demo page) */
  .conversation-item {
    margin-bottom: 16px;
    animation: fadeIn 0.3s ease-in;
    .conv-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .conv-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9em;
      font-weight: 600;
    }

    .conv-avatar.user {
      background: #0078d4;
      color: #fff;
    }

    .conv-avatar.assistant {
      background: #7e3ff2;
      color: #fff;
    }

    .conv-role {
      font-size: 1em;
      font-weight: 600;
      color: #333;
    }

    .conv-content {
      background: transparent;
      padding: 0;
      border: none;
      line-height: 1.6;
      font-size: 1em;
      margin-left: 0;
    }

    .conv-content.user-content {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
      margin-left: 32px;
    }

    .conv-content pre {
      background: #fff;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
      font-size: 0.9em;
      font-family: "Consolas", "Monaco", "Courier New", monospace;
      border: 1px solid #e0e0e0;
    }

    .conv-content code {
      background: #fff;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: "Consolas", "Monaco", "Courier New", monospace;
      font-size: 0.9em;
      color: #d63384;
      border: 1px solid #f0e5ea;
    }
  }

  /* Tool Call Styles (matching replay.html) */
  .tool-call {
    background: transparent;
    border: none;
    border-left: 3px solid #ff9800;
    padding: 8px 12px;
    padding-left: 12px;
    border-radius: 4px;
    margin: 6px 0;
    cursor: pointer;
    transition: all 0.2s;
    display: block;
    font-size: 1em;
    &:hover {
      background: #fff8f0;
      border-left-color: #f57c00;
    }

    &.active {
      background: #fff3e0;
      border-left-width: 4px;
      font-weight: 500;
    }

    .tool-call-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tool-icon {
      font-size: 1em;
      flex-shrink: 0;
    }

    .tool-name {
      font-weight: 600;
      color: #e65100;
      font-size: 1em;
    }

    .tool-goal {
      font-size: 0.9em;
      color: #666;
      font-style: italic;
      flex: 1;
    }

    .tool-chevron {
      color: #999;
      font-size: 11px;
      transition: transform 0.2s;
      margin-left: auto;
    }

    &:hover .tool-chevron {
      transform: translateX(2px);
    }
  }

  /* Loading Animation */
  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
  }

  .typing-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--text-tertiary);
    animation: typing 1.4s infinite;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.7;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }

  /* ==================== Animations ==================== */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* ==================== Responsive Design ==================== */
  @media (max-width: 1024px) {
    .chat-panel {
      width: 50%;
      min-width: 350px;
    }
  }

  @media (max-width: 768px) {
    .app-container {
      flex-direction: column;
    }

    .chat-panel {
      width: 100%;
      min-width: auto;
      max-width: none;
      height: 50vh;
      border-right: none;
      border-bottom: 1px solid var(--border-color);
    }

    .message-content {
      max-width: 85%;
    }

    .toast-container {
      right: 16px;
      left: 16px;
    }

    .toast {
      min-width: auto;
    }
  }

  @media (max-width: 480px) {
    .chat-header {
      padding: 16px;
    }

    .app-title {
      font-size: 1.2em;
    }

    .chat-messages {
      padding: 16px;
    }

    .chat-input-container {
      padding: 12px 16px 16px;
    }
  }
}
</style>



<style lang="scss">
/* Collapsible Code Block */
.action-code-collapsible {
  margin-top: 12px;
  border-top: 1px solid var(--border-color);
  padding-top: 8px;

  .action-code-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: var(--bg-tertiary);
    border-radius: 6px;
    cursor: pointer;
    transition: all var(--transition-speed);
    user-select: none;
  }

  .action-code-header:hover {
    background: var(--bg-primary);
  }

  .action-code-header i.fa-play-circle {
    color: var(--success-color);
    font-size: 1em;
  }

  .action-code-header span {
    flex: 1;
    font-size: 1em;
    font-weight: 500;
    color: var(--text-primary);
  }

  .action-code-header .collapse-icon {
    font-size: 0.9em;
    color: var(--text-tertiary);
    transition: transform var(--transition-speed);
  }

  .action-code-content {
    margin-top: 8px;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
    height: 300px;
    overflow-y: auto;
    border: 1px solid var(--border-color);
  }

  .action-code-content pre {
    margin: 0;
    padding: 12px;
    font-family: Consolas, Monaco, "Courier New", monospace;
    font-size: 0.9em;
    line-height: 1.6;
    color: var(--text-primary);
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .action-code-content code {
    font-family: inherit;
  }

  /* JavaScript Syntax Highlighting */
  .action-code-content .keyword {
    color: #569cd6;
    font-weight: 500;
  }

  .action-code-content .string {
    color: #ce9178;
  }

  .action-code-content .comment {
    color: #6a9955;
    font-style: italic;
  }

  .action-code-content .function {
    color: #dcdcaa;
  }

  .action-code-content .number {
    color: #b5cea8;
  }

  .action-code-content .property {
    color: #9cdcfe;
  }

  .action-code-content .operator {
    color: #d4d4d4;
  }

  .action-code-content .punctuation {
    color: #d4d4d4;
  }
}

.image-uploader {
  .select-btn {
    padding: 6px 14px;
    cursor: pointer;
  }
}

.loading-container {
  display: flex;
  align-items: center;
  height: 2em;
  gap: 0.5em;
  padding-left: 2em;
  & span {
    content: "";
    width: 0.8em;
    height: 0.8em;
    border-radius: 50%;
    background-color: #05408c;
    opacity: 0.4;
    animation: loadingBounce 1.4s infinite ease-in-out both;
  }

  & span:nth-child(1) {
    animation-delay: -2s;
  }

  & span:nth-child(2) {
    animation-delay: -4s;
  }

  & span {
    display: inline-block;
  }
}

@keyframes loadingBounce {
  0%,
  80%,
  100% {
    transform: scale(0.5);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
