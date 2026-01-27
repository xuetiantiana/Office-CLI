<template>
  <div class="chat-messages" id="chatMessages" ref="scrollbarRef">
    <div
      v-for="(msg, idx) in chatHistory"
      :key="idx"
      class="conversation-item"
      :class="msg.role === 'user' ? 'conversation-item-user' : ''"
    >
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
        style="margin-bottom: 12px"
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
        :class="msg.role == 'user' ? 'user-content' : ''"
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
import { ref, nextTick, watch } from "vue";
import { mapIcon, highlightJavaScript } from "@/utils/common.js";

const props = defineProps({
  sessionId: String,
  chatLoading: Boolean,
  chatHistory: Array,
});

const emit = defineEmits(["reloadDocument"]);

const scrollbarRef = ref(null);
const expandedCodeBlocks = ref({});

watch(
  () => props.chatHistory,
  async () => {
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
  },
  { deep: true }
);

function toggleCodeBlock(msgIdx, actionIndex) {
  const key = `${msgIdx}-${actionIndex}`;
  expandedCodeBlocks.value[key] = !expandedCodeBlocks.value[key];
}
</script>

<style scoped lang="scss">
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conversation-item {
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
    padding: 0 0 0 2em;
    border: none;
    line-height: 1.6;
    font-size: 1em;
    margin-left: 0;

    &.user-content {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 6px;
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
