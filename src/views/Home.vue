<template>
  <div class="home-template">
    <ChatSidebar class="chat-sidebar" />
    <ChatBox class="chat-box" />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import ChatBox from "@/components/ChatBox.vue";
import ChatSidebar from "@/components/ChatSidebar.vue";


</script>

<style lang="scss" scoped>
  .home-template{
    width: 100%;
    min-width: 1028px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    .chat-sidebar{
      width: 10em;
    }
    .chat-box{
      flex: 1;
    }
  }
</style>