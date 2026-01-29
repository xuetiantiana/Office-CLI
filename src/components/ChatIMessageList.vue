<template>
  <div class="chat-messages" id="chatMessages" ref="scrollbarRef">
    <div
      v-for="(msg, idx) in chatHistory"
      :key="idx"
      class="conversation-item"
      :class="
        msg.role === 'user'
          ? 'conversation-item-user'
          : 'conversation-item-model'
      "
      :ref="(el) => setItemRef(el, idx)"
    >
      <el-tooltip
        :content="collapsedMessages[idx] ? 'Expand' : 'Collapse'"
        placement="bottom"
      >
        <button
          v-if="contentHeights[idx] > COLLAPSE_HEIGHT_THRESHOLD"
          @click="toggleCollapse(idx)"
          class="collapse-button-top"
        >
          <el-icon v-if="collapsedMessages[idx]"><ArrowDownBold /></el-icon>
          <el-icon v-else><ArrowUpBold /></el-icon>
        </button>
      </el-tooltip>
      <div v-if="msg.role === 'user'" class="conv-header">
        <div class="conv-avatar user">U</div>
        <span class="conv-role">User</span>
      </div>
      <div
        v-if="
          msg.role === 'model' &&
          idx > 0 &&
          chatHistory[idx - 1].role != 'model'
        "
        class="conv-header assistant-header"
      >
        <img
          src="@/assets/OfficeCLI.jpg"
          alt="Office CLI"
          style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
          "
        />
        <span
          class="conv-role"
          style="font-size: 15px; font-weight: 700; color: #0078d4"
          >Office CLI for Word</span
        >
      </div>
      <div
        class="conv-content"
        :class="[
          msg.role == 'user' ? 'user-content' : '',
          collapsedMessages[idx] ? 'collapsed' : '',
        ]"
      >
        <template v-if="msg.role === 'user'">
          <div v-html="msg.text" style="white-space: pre-line"></div>
        </template>

        <template v-else>
          <div class="loading-container" v-if="chatLoading && !msg.text">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div
            style="margin-bottom: 8px; white-space: pre-line"
            v-if="
              msg.text.includes('Failed to load the document') ||
              msg.text.includes('PDF 文件不存在')
            "
          >
            <i
              >[❌ Failed to load the document. Please manually click
              <button
                @click="emit('reloadDocument', props.sessionId)"
                style="
                  margin-left: 8px;
                  padding: 2px 8px;
                  background: #0078d4;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                "
              >
                Reload Document
              </button>
              to try again.] ]</i
            >
          </div>
          <div
            style="margin-bottom: 8px; white-space: pre-line"
            v-else
            v-html="msg.text"
          ></div>
        </template>
        <template
          v-if="msg.data && msg.data.actions && msg.data.actions.length > 0"
        >
          <div
            v-for="(action, index) in msg.data.actions"
            :key="index"
            class="tool-call"
            style="opacity: 1"
          >
            <div class="tool-call-header">
              <span class="tool-icon">{{ mapIcon(action.icon) }}</span
              ><span class="tool-name">{{ action.title }}</span
              ><span class="tool-goal">{{ action.description }}</span
              ><span class="tool-chevron">›</span>
            </div>
            <div
              v-if="action.previewType === 'code' && action.previewContent"
              class="action-code-collapsible"
            >
              <div
                class="action-code-header"
                @click="toggleCodeBlock(idx, index)"
              >
                <i class="fas fa-play-circle"></i>
                <span>Execute Code</span>
                <i
                  :class="[
                    'fas',
                    'collapse-icon',
                    expandedCodeBlocks[`${idx}-${index}`]
                      ? 'fa-chevron-down'
                      : 'fa-chevron-right',
                  ]"
                ></i>
              </div>
              <div
                v-show="expandedCodeBlocks[`${idx}-${index}`]"
                class="action-code-content"
              >
                <pre><code v-html="highlightJavaScript(action.previewContent)"></code></pre>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onBeforeUnmount } from "vue";
import { mapIcon, highlightJavaScript } from "@/utils/common.js";
import { ArrowDownBold, ArrowUpBold } from "@element-plus/icons-vue";

const props = defineProps({
  sessionId: String,
  chatLoading: Boolean,
  chatHistory: Array,
});

const emit = defineEmits(["reloadDocument"]);

const scrollbarRef = ref(null);

// 折叠相关状态管理
const expandedCodeBlocks = ref({});
const collapsedMessages = ref({});
const contentHeights = ref({});
const itemRefs = ref({});
const prevChatHistoryLength = ref(0);
const isInitialLoad = ref(true);

// 折叠高度阈值（像素）
const COLLAPSE_HEIGHT_THRESHOLD = 148;

// 存储 ResizeObserver 实例
const resizeObservers = ref({});

const setItemRef = (el, index) => {
  if (el) {
    itemRefs.value[index] = el;
    const content = el.querySelector(".conv-content");
    if (content && !contentHeights.value[index]) {
      console.log("content 元素存在");
      // 初始计算高度
      contentHeights.value[index] = content.scrollHeight;

      // 使用 ResizeObserver 监听高度变化
      if (!resizeObservers.value[index]) {
        console.log("创建 ResizeObserver 实例");
        const observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const newHeight = entry.target.scrollHeight;
            if (contentHeights.value[index] !== newHeight) {
              console.log(
                `高度变化：${contentHeights.value[index]} -> ${newHeight}`
              );
              contentHeights.value[index] = newHeight;
            }
          }
        });
        observer.observe(content);
        resizeObservers.value[index] = observer;
      }
    }
  }
};

const toggleCollapse = (index) => {
  collapsedMessages.value[index] = !collapsedMessages.value[index];
};

// 监听sessionId变化，切换页面时清空所有状态
watch(
  () => props.sessionId,
  () => {
    // 清理所有 ResizeObserver
    Object.values(resizeObservers.value).forEach((observer) => {
      observer.disconnect();
    });
    resizeObservers.value = {};

    expandedCodeBlocks.value = {};
    collapsedMessages.value = {};
    contentHeights.value = {};
    itemRefs.value = {};
    prevChatHistoryLength.value = 0;
    isInitialLoad.value = true;
  }
);

// 组件卸载时清理所有观察者
onBeforeUnmount(() => {
  Object.values(resizeObservers.value).forEach((observer) => {
    observer.disconnect();
  });
  resizeObservers.value = {};
});

// 监听chatLoading变化，当流式请求结束时自动收起最后一条model消息
// watch(
//   () => props.chatLoading,
//   (newLoading, oldLoading) => {
//     if (oldLoading === true && newLoading === false) {
//       // 流式请求结束，找到最后一条model消息并收起
//       const lastModelIndex = props.chatHistory.map((msg, idx) => ({ msg, idx }))
//         .filter(item => item.msg.role === 'model')
//         .pop();

//       if (lastModelIndex && contentHeights.value[lastModelIndex.idx] > COLLAPSE_HEIGHT_THRESHOLD) {
//         collapsedMessages.value[lastModelIndex.idx] = true;
//       }
//     }
//   }
// );

watch(
  () => props.chatHistory,
  async (newHistory, oldHistory) => {
    await nextTick();

    const sb = scrollbarRef.value;

    if (!sb) return;

    const wrap = sb.wrapRef || sb.wrap || null;

    if (
      typeof sb.setScrollTop === "function" &&
      wrap &&
      wrap.scrollHeight != null
    ) {
      try {
        sb.setScrollTop(wrap.scrollHeight);
      } catch (e) {
        if (wrap && typeof wrap.scrollTop !== "undefined")
          wrap.scrollTop = wrap.scrollHeight;
      }
      return;
    }

    const el = sb instanceof Element ? sb : wrap;
    if (el && typeof el.scrollTop !== "undefined") {
      el.scrollTop = el.scrollHeight;
    }

    // 处理折叠状态
    if (isInitialLoad.value) {
      // 初始加载时，所有消息都折叠，但前提是高度大于阈值
      newHistory.forEach((msg, idx) => {
        if (
          !collapsedMessages.value[idx] &&
          contentHeights.value[idx] > COLLAPSE_HEIGHT_THRESHOLD
        ) {
          collapsedMessages.value[idx] = true;
        }
      });
      isInitialLoad.value = false;
    } else if (newHistory.length > prevChatHistoryLength.value) {
      // 新增消息时，根据role设置默认状态
      const newMessages = newHistory.slice(prevChatHistoryLength.value);
      newMessages.forEach((msg, idx) => {
        const actualIdx = prevChatHistoryLength.value + idx;
        if (msg.role === "user") {
          // user消息默认折叠，但前提是高度大于阈值
          if (contentHeights.value[actualIdx] > COLLAPSE_HEIGHT_THRESHOLD) {
            collapsedMessages.value[actualIdx] = true;
          }
        } else if (msg.role === "model") {
          // model消息默认打开
          collapsedMessages.value[actualIdx] = false;
        }
      });
    }
    prevChatHistoryLength.value = newHistory.length;
  },
  { deep: true }
);

function toggleCodeBlock(msgIdx, actionIndex) {
  const key = `${msgIdx}-${actionIndex}`;
  expandedCodeBlocks.value[key] = !expandedCodeBlocks.value[key];
}
</script>

<style scoped lang="scss">
/* ==================== 折叠按钮样式 ==================== */
.conversation-item-model {
  .collapse-button-top {
    right: auto;
    left: 13em;
    top: 0.3em;
  }
}
.collapse-button-top {
  position: absolute;
  top: 0;
  right: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
  z-index: 10;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conversation-item {
  position: relative;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-in;
  &.conversation-item-user {
    align-self: flex-end;
    max-width: 80%;
    .conv-header {
      display: none;
    }
  }

  .conv-header {
    display: flex;
    align-items: center;
    gap: 8px;
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

    &.user {
      background: #0078d4;
      color: #fff;
    }

    &.assistant {
      background: #7e3ff2;
      color: #fff;
    }
  }

  .conv-role {
    font-size: 1em;
    font-weight: 600;
    color: #333;
  }

  .conv-content {
    background: transparent;
    padding: 12px 0 12px 2em;
    border: none;
    line-height: 1.6;
    font-size: 1em;
    margin-left: 0;

    &.user-content {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 10px;
      padding-right: 30px;
    }

    &.collapsed {
      & > div {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 5;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    pre {
      background: #fff;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
      font-size: 0.9em;
      font-family: "Consolas", "Monaco", "Courier New", monospace;
      border: 1px solid #e0e0e0;
    }

    code {
      background: #fff;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: "Consolas", "Monaco", "Courier New", monospace;
      font-size: 0.9em;
      color: #d63384;
      border: 1px solid #f0e5ea;
    }
  }

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

  .loading-container {
    display: flex;
    align-items: center;
    height: 2em;
    gap: 0.5em;
    padding-left: 2em;

    span {
      content: "";
      width: 0.8em;
      height: 0.8em;
      border-radius: 50%;
      background-color: #05408c;
      opacity: 0.4;
      animation: loadingBounce 1.4s infinite ease-in-out both;
      display: inline-block;
    }

    span:nth-child(1) {
      animation-delay: -2s;
    }

    span:nth-child(2) {
      animation-delay: -4s;
    }
  }
}

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

<style lang="scss">
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

    &:hover {
      background: var(--bg-primary);
    }

    i.fa-play-circle {
      color: var(--success-color);
      font-size: 1em;
    }

    span {
      flex: 1;
      font-size: 1em;
      font-weight: 500;
      color: var(--text-primary);
    }

    .collapse-icon {
      font-size: 0.9em;
      color: var(--text-tertiary);
      transition: transform var(--transition-speed);
    }
  }

  .action-code-content {
    margin-top: 8px;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
    height: 300px;
    overflow-y: auto;
    border: 1px solid var(--border-color);

    pre {
      margin: 0;
      padding: 12px;
      font-family: Consolas, Monaco, "Courier New", monospace;
      font-size: 0.9em;
      line-height: 1.6;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    code {
      font-family: inherit;
    }

    .keyword {
      color: #569cd6;
      font-weight: 500;
    }

    .string {
      color: #ce9178;
    }

    .comment {
      color: #6a9955;
      font-style: italic;
    }

    .function {
      color: #dcdcaa;
    }

    .number {
      color: #b5cea8;
    }

    .property {
      color: #9cdcfe;
    }

    .operator {
      color: #d4d4d4;
    }

    .punctuation {
      color: #d4d4d4;
    }
  }
}
</style>
