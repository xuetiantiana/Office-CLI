<template>
  <div class="sidebar-content">

    <el-button @click="create">+ New Chat</el-button>
    <p class="chat-list-h2">Chat List</p>
    <div
      v-for="(s,index) in reversedSessions"
      :key="index"
      class="item"
      @click="go(s.session_id)"
    >
      {{ s.title || "Chat "+ (index+1)}}
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const sessions = ref([])

const reversedSessions = computed(() => sessions.value.slice().reverse());

function load() {
  sessions.value = JSON.parse(localStorage.getItem("session_id_chat_history_list") || "[]")
}

function save() {
  localStorage.setItem("session_id_chat_history_list", JSON.stringify(sessions.value))
}

function create() {
  // const id = crypto.randomUUID()
  // sessions.value.push({ "session_id": id, title: "New Chat" })
  // save()
  // router.push(`/chat/${id}`)
  router.push("./")
}

function go(id) {
  router.push(`/chat/${id}`)
}

onMounted(load)
</script>

<style lang="scss" scoped>
.sidebar-content {
  padding: 10px;
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
  font-size: 1rem;
  color: #000;
  .chat-list-h2{
    margin-top: .2em;
    font-size: 1.1em;
    padding: .4em .8em;
    opacity: .9;
  }
  .item {
  padding: .4em 1em;
  cursor: pointer;
  border-radius: 6px;
}
.item:hover {
  background: #f0f0f0;
}
}

</style>
