<template>
  <div class="sidebar-content">
    <el-button @click="create" style="font-size: 1em;">+ New Chat</el-button>
    <p class="chat-list-h2">我的聊天</p>
    <ul>
      <li
        v-for="(item, index) in sessions"
        :key="item.session_id"
        class="item"
        @click="go(item.session_id)"
        :class="{ active: route.params.sessionId == item.session_id }"
      >
        <span>{{ item.title || "Chat " + (index + 1) }}</span>

        <!-- 删除按钮 -->
        <el-button
          type="text"
          size="small"
          class="delete-btn"
          @click.stop="confirmRemove(item.session_id)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElIcon } from "element-plus";
import { Close } from "@element-plus/icons-vue"; // Element Plus 图标

const route = useRoute(); // 必须！
const router = useRouter();
const sessions = ref([]);

const reversedSessions = computed(() => sessions.value.slice().reverse());

function load() {
  sessions.value = JSON.parse(
    localStorage.getItem("session_id_chat_history_list") || "[]"
  );
}

function save() {
  localStorage.setItem(
    "session_id_chat_history_list",
    JSON.stringify(sessions.value)
  );
}

function create() {
  router.push("/");
}

function go(id) {
  router.push(`/chat/${id}`);
}

// 删除某个聊天
function remove(id) {
  sessions.value = sessions.value.filter((item) => item.session_id !== id);
  save();
  // 如果当前页面正在查看被删除的聊天，跳回首页
  if (route.params.sessionId === id) {
    router.push("/");
  }
}

// 删除前确认
function confirmRemove(id) {
  ElMessageBox.confirm(
    '确定要删除这个聊天吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    remove(id);
    ElMessage({
      type: 'success',
      message: '删除成功'
    });
  }).catch(() => {
    // 用户取消删除
  });
}

onMounted(load);
</script>

<style lang="scss" scoped>
.sidebar-content {
  padding: 10px;
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
  font-size: 1rem;
  color: #000;
  .chat-list-h2 {
    margin-top: 0.2em;
    font-size: 1.1em;
    padding: 0.4em 0.8em;
    opacity: 0.9;
  }
  ul {
    .item {
      padding: 0.4em 1em;
      position: relative;
      cursor: pointer;
      border-radius: 6px;
      &:hover {
        background: #0000000a;
      }
      &.active {
        background: rgba(0, 0, 0, 0.06);
      }
      .delete-btn {
        position: absolute;
        right: 0em;
        color: rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>
