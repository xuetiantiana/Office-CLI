<template>
  <div
    class="sidebar-content"
    :class="{ collapsed: !isExpanded }"
    :style="{ width: sidebarWidth }"
  >
    <div
      class="container"
      :style="{ width: expandedWidth }"
      style="position: relative"
    >
      <!-- 折叠/展开按钮 -->
      <div
        class="sidebar-toggle"
        @click="toggleSidebar"
        :class="{ collapsed: !isExpanded }"
        :style="{ left: !isExpanded ? '5px' : 'calc(100% - 3em)' }"
      >
        <!-- <el-icon>
          <component :is="isExpanded ? ArrowLeft : ArrowRight" />
        </el-icon> -->
        <img src="@/assets/silderBarBtn.svg" alt="" style="width: 1.5em;">
        <!-- <svg-icon name="silderBarBtn"></svg-icon> -->
      </div>

      <!-- 侧边栏标题和Logo -->
      <div
        class="sidebar-header"
        :style="{ transform: !isExpanded ? 'translateX(-100%)' : '' }"
      >
        <img src="@/assets/OfficeCLI.jpg" alt="Office CLI" class="logo" />
        <!-- <img style="width: 500px;" src="@/assets/image.png" alt="Office CLI" class="logo" /> -->
        <span class="title">Office CLI</span>
      </div>

      <div
        class="sidebar-main"
        :style="{ transform: !isExpanded ? 'translateX(-100%)' : '' }"
      >
        <div>
          <ul class="nav-ul">
            <li
              @click="create"
              :class="{
                active: route.path === '/',
                dropdownActive: activeDropdownSessionId === 'new-chat',
              }"
            >
              <el-icon><ChatRound /></el-icon>
              <span>New chat</span>
            </li>
          </ul>
        </div>
        <p class="chat-list-h2">Chat</p>
        <ul class="session-ul">
          <li
            v-for="(item, index) in reversedSessions"
            :key="item.session_id"
            @click="go(item.session_id, item.session_title || null)"
            :class="{
              active: route.params.sessionId == item.session_id,
              dropdownActive: activeDropdownSessionId === item.session_id,
            }"
            :style="{
              display: !item.session_title && index != 0 ? 'none' : '',
            }"
          >
            <el-tooltip
              placement="right-start"
              :disabled="!isTextOverflow(item.session_title || 'New Chat')"
              effect="light"
              :offset="40"
            >
              <template #content>
                <div style="width: 200px">
                  {{ item.session_title || "New Chat" }}
                </div>
              </template>
              <span>{{ item.session_title || "New Chat" }}</span>
            </el-tooltip>

            <!-- 更多选项按钮 -->
            <el-dropdown
              trigger="click"
              @command="
                handleDropdownCommand(
                  $event,
                  item.session_id,
                  item.session_title
                )
              "
              @visible-change="
                (visible) => handleDropdownVisible(visible, item.session_id)
              "
              placement="right-start"
            >
              <el-button type="text" class="more-btn" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="rename">
                    <el-icon><Edit /></el-icon>
                    <span>Rename</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" type="danger">
                    <el-icon><Delete /></el-icon>
                    <span>Delete</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ElIcon,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessageBox,
  ElInput,
  ElMessage,
  ElTooltip,
} from "element-plus";
import {
  Close,
  ArrowLeft,
  ArrowRight,
  ChatRound,
  More,
  Edit,
  Delete,
  MoreFilled,
} from "@element-plus/icons-vue"; // Element Plus 图标
import { useSidebarStore } from "@/stores/sidebarStore.js";

const route = useRoute(); // 必须！
const router = useRouter();
const sessions = ref([]);

// 侧边栏状态管理
const sidebarStore = useSidebarStore();
const isExpanded = computed(() => sidebarStore.isExpanded);
const sidebarWidth = computed(() => sidebarStore.sidebarWidth);
const expandedWidth = computed(() => sidebarStore.expandedWidth);

// 跟踪当前打开的下拉菜单的session_id
const activeDropdownSessionId = ref(null);

// 处理下拉菜单显示/隐藏事件
function handleDropdownVisible(visible, sessionId) {
  if (visible) {
    activeDropdownSessionId.value = sessionId;
  } else {
    activeDropdownSessionId.value = null;
  }
}

// 判断文本是否溢出
function isTextOverflow(text) {
  if (!text) return false;
  const span = document.createElement("span");
  span.style.visibility = "hidden";
  span.style.position = "absolute";
  span.style.whiteSpace = "nowrap";
  span.style.fontSize = "1em";
  span.style.fontFamily = "inherit";
  span.style.fontWeight = "inherit";
  document.body.appendChild(span);
  span.textContent = text;
  const textWidth = span.offsetWidth;
  document.body.removeChild(span);

  return textWidth > 180;
}

// 切换侧边栏状态
function toggleSidebar() {
  sidebarStore.toggleSidebar();
}

const reversedSessions = computed(() => sessions.value.slice().reverse());

function load() {
  sessions.value = JSON.parse(
    localStorage.getItem("session_id_chat_history_list") || "[]"
  );
  console.log("111111", sessions.value);
}

function saveSessions() {
  localStorage.setItem(
    "session_id_chat_history_list",
    JSON.stringify(sessions.value)
  );
}

function create() {
  router.push("/");
}

function go(id, title) {
  // router.push(`/chat/${id}`);
  router.push({
    path: `/chat/${id}`,
    query: {
      title,
    },
  });
}

// 删除某个聊天
function remove(id) {
  sessions.value = sessions.value.filter((item) => item.session_id !== id);
  saveSessions();
  // 如果当前页面正在查看被删除的聊天，跳回首页
  if (route.params.sessionId === id) {
    router.push("/");
  }
}

// 删除前确认
function confirmRemove(id) {
  ElMessageBox.confirm("Are you sure you want to delete this chat?", "Delete Confirmation", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      remove(id);
      ElMessage({
        type: "success",
        message: "Delete successful",
      });
    })
    .catch(() => {
      // 用户取消删除
    });
}

// 处理下拉菜单命令
function handleDropdownCommand(command, sessionId, sessionTitle) {
  if (command === "delete") {
    confirmRemove(sessionId);
  } else if (command === "rename") {
    renameSession(sessionId, sessionTitle);
  }
}

// 重命名会话
function renameSession(sessionId, currentTitle) {
  ElMessageBox.prompt("Please enter a new session name", "Rename Session", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    inputValue: currentTitle || "New Chat",
    inputPlaceholder: "Session name",
    inputValidator: (value) => {
      if (!value || value.trim() === "") {
        return "Session name cannot be empty";
      }
      return true;
    },
  })
    .then(({ value }) => {
      // 更新会话标题
      const sessionIndex = sessions.value.findIndex(
        (item) => item.session_id === sessionId
      );
      if (sessionIndex !== -1) {
        sessions.value[sessionIndex].session_title = value.trim();
        saveSessions();
        ElMessage({
          type: "success",
          message: "Rename successful",
        });
      }
    })
    .catch(() => {
      // 用户取消重命名
    });
}

onMounted(load);

defineExpose({
  load,
});
</script>

<style lang="scss" scoped>
.sidebar-content {
  background: #f5f5f5;
  padding: 0;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  font-size: 1rem;
  color: #0d0d0d;
  transition: width 0.3s ease;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;

  .container {
    height: 100%;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0 0 2em;

    .sidebar-toggle {
      transition: all 0.3s ease;
      position: absolute;
      top: 14px;
      right: 10px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;

      // &:hover {
      //   background-color: #e0e0e0;
      // }
    }

    .sidebar-header {
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      padding: 1em 1.5em;

      .logo {
        width: 2em;
        border-radius: 50%;
        margin-right: 0.6em;
        object-fit: cover;
      }

      .title {
        font-size: 1.3em;
        font-weight: 600;
        color: #0078d4;
      }
    }

    .nav-ul,
    .session-ul {
      padding: 0 0.8em;

      li {
        padding: 0.4em 0.2em 0.4em 2em;
        font-size: 1em;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        border-radius: 0.75em;
        margin-bottom: 0.375em;
        transition: all 0.2s ease;
        position: relative;
        line-height: 1.8;

        span {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 1em;
          margin-left: 0.6em;
        }

        .el-icon {
          font-size: 1em;
        }

        &:hover {
          background: #ffffff;
          box-shadow: 0 0.125em 0.375em rgba(0, 0, 0, 0.02);
        }

        &.dropdownActive {
          background: #ffffff;
          box-shadow: 0 0.125em 0.375em rgba(0, 0, 0, 0.02);
        }

        &.active {
          background: #ffffff;
          box-shadow: 0 0.125em 0.5em rgba(0, 0, 0, 0.02);
          font-weight: 600;

          &::after {
            content: "";
            position: absolute;
            left: -3px;
            top: 50%;
            transform: translateY(-50%);
            height: 1em;
            width: 3px;
            background: #0078d4;
            border-radius: 2px;
          }
        }

        .more-btn {
          color: rgba(0, 0, 0, 0.5);
          padding: 0.4em;
          font-size: 1em;
          opacity: 0;
          transition: opacity 0.2s ease;
          height: 1.5em;
          box-sizing: border-box;

          &:hover {
            color: #0078d4;
          }
        }

        &:hover .more-btn {
          opacity: 1;
        }
      }
    }

    .nav-ul {
      li {
        padding-left: 0.9em;
        .el-icon {
          font-size: 1.2em;
          color: #000;
        }
        span {
          font-size: 1.1em;
        }
      }
    }

    .session-ul {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .sidebar-main {
      transition: all 0.3s ease;
      margin-top: 0.625em;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow: hidden;

      .chat-list-h2 {
        font-size: 1.1em;
        padding: 0.4em 3.1em;
        opacity: 0.9;
        font-weight: bold;
        margin-top: 0.2em;
        color: #777;
      }
    }
  }

  // 折叠状态样式
  &.collapsed {
    // 折叠时不需要修改padding，因为padding已经在.container中设置
    background: #fff;
  }

  // 自定义tooltip样式
  :deep(.el-tooltip__popper) {
    background-color: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15) !important;
    color: #333333 !important;
    font-size: 14px !important;
    width: 200px !important;
    max-width: 200px !important;
  }

  // 自定义tooltip箭头样式
  :deep(.el-tooltip__popper.is-light) {
    background-color: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
  }

  :deep(.el-tooltip__arrow) {
    border-top-color: #ffffff !important;
    border-bottom-color: #ffffff !important;
    border-left-color: #ffffff !important;
    border-right-color: #ffffff !important;
  }
}
</style>