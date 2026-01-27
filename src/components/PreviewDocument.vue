<template>
  <div class="preview-panel">
    <!-- <el-button
        style="position: absolute; top: 1em; right: 1em;opacity: 0;"
        type="primary"
        size="small"
        :loading="loadingPdf"
        :disabled="loadingPdf"
        @click="handleReloadPDF"
        >Reload Document</el-button
      > -->
    <div class="preview-content" id="previewContent">
      <div
        v-loading="loadingPdf"
        style="
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
          "
      >
        <embed :src="pdfBlobUrl" type="" style="height: 100%" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { refreshPDF } from "@/service/chatMangerApi.js";

const props = defineProps({
    sessionId: String,
  pdfBlobUrl: String,
  loadingPdf: Boolean,
});

const emit = defineEmits(["handleReloadPDF"]);


const handleReloadPDF = async()=>{
    alert("1")
    emit("handleReloadPDF",props.sessionId)
}
</script>

<style lang="scss" scoped>
.preview-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1em 1.5em;

    .preview-title-section {
      display: flex;
      flex-direction: column;

      .preview-title {
        font-size: 1.2em;
        font-weight: 600;
        color: #333;
        margin: 0;
      }

      .preview-subtitle {
        font-size: 0.9em;
        color: #888;
        margin-top: 0.3em;
      }
    }
  }

  .preview-content {
    flex: 1;
    overflow: hidden;
    background: #f5f5f5;
  }
}
</style>
