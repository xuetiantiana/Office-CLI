<template>
  <div class="sidebar-content">

    <button @click="create">+ New Chat</button>

    <div
      v-for="s in sessions"
      :key="s.id"
      class="item"
      @click="go(s.id)"
    >
      {{ s.title || "New Chat" }}
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const sessions = ref([])

function load() {
  sessions.value = JSON.parse(localStorage.getItem("sessions") || "[]")
}

function save() {
  localStorage.setItem("sessions", JSON.stringify(sessions.value))
}

function create() {
  const id = crypto.randomUUID()
  sessions.value.push({ id, title: "New Chat" })
  save()
  router.push(`/chat/${id}`)
}

function go(id) {
  router.push(`/chat/${id}`)
}

onMounted(load)
</script>

<style scoped>
.sidebar-content {
  padding: 10px;
  height: 100%;
  overflow-y: auto;
}
.item {
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
}
.item:hover {
  background: #f0f0f0;
}
</style>
