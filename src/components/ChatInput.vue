<template>
  <div>
    <!-- chat input -->
    <div class="chat-input-container" style="position: relative">
      <div class="content">
        <!-- 文件列表 -->
        <div class="file-list" v-if="selectFilesObjsArray.length > 0">
          <div
            class="file-item"
            v-for="(item, index) in selectFilesObjsArray"
            :key="item.id"
          >
            <button class="delete-btn" @click="removeImage(index)">
              <el-icon><Close /></el-icon>
            </button>
            <div class="file-preview">
              <el-image
                fit="cover"
                v-if="item.isImage"
                :src="item.url"
                :preview-src-list="[item.url]"
                class="file-image"
              />
              <div v-else class="file-icon-wrapper">
                <i
                  v-if="item.fileType === 'word'"
                  class="fas fa-file-word file-icon word"
                ></i>
                <i
                  v-else-if="item.fileType === 'excel'"
                  class="fas fa-file-excel file-icon excel"
                ></i>
                <i
                  v-else-if="item.fileType === 'txt'"
                  class="fas fa-file-alt file-icon txt"
                ></i>
                <i
                  v-else-if="item.fileType === 'pdf'"
                  class="fas fa-file-pdf file-icon pdf"
                ></i>
                <i v-else class="fas fa-file file-icon other"></i>
              </div>
            </div>
            <div class="info">
              <span class="name">{{ item.file.name }}</span>
            </div>
          </div>
        </div>

        <div style="min-height: 4.3em; padding: 1em 0.2em 0.3em">
          <div v-if="!isListening" class="input-wrapper">
            <el-input
              v-model="textareaValue"
              type="textarea"
              id="userInput"
              class="chat-input"
              :placeholder="
                chatHistory.length == 0
                  ? 'You can choose an example above or enter your own.'
                  : 'Enter your own requirements'
              "
              :autosize="{ minRows: 2, maxRows: 5 }"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.shift.enter
              @paste="onPaste"
              @dragover.prevent
              @drop="onDrop"
            />
          </div>
          <div v-else class="listening-result-div">{{ fullText }} ...</div>
        </div>

        <!-- 按钮 -->
        <div class="btn-box">
          <div class="image-uploader">
            <el-dropdown trigger="click" placement="bottom-start">
              <el-button plain>
                <el-icon><Plus /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="triggerFileUpload">
                    <el-icon><Upload /></el-icon>
                    <span style="margin-left: 8px"
                      >Upload images and files</span
                    >
                  </el-dropdown-item>
                  <!-- <el-dropdown-item>
                    <el-icon><Cloud /></el-icon>
                    <span style="margin-left: 8px;">附加云文件</span>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-icon><ChatLineRound /></el-icon>
                    <span style="margin-left: 8px;">与代理聊天</span>
                  </el-dropdown-item> -->
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/plain"
              multiple
              @change="onFileChange"
              style="display: none"
            >
              <div style="display: none">上传按钮</div>
            </el-upload>
          </div>

          <div v-if="!isListening" class="right">
            <!-- <el-button class="audio-btn" @click="startRecognition">
              <el-icon><Microphone /></el-icon>
            </el-button> -->

            <template v-if="!chatLoading">
              <el-button
                class="send-btn"
                id="sendBtn"
                @click="sendMessage"
                :disabled="chatLoading || textareaValue.trim().length == 0"
              >
                <el-icon><Right /></el-icon>
              </el-button>
            </template>
            <template v-else>
              <el-button
                class="send-btn"
                id="sendBtn"
                @click="StopBtnClick"
                :disabled="chatLoading"
              >
                <i class="fas fa-spinner fa-spin"></i>
              </el-button>
            </template>
          </div>

          <div v-else class="right">
            <el-button :disabled="!isListening">
              <el-icon @click="cancelRecognition"><Close /></el-icon>
            </el-button>
            <el-button :disabled="!isListening">
              <el-icon @click="confirmRecognition"><Check /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="chatHistory.length == 0" class="example-container">
        <p>✨ Quick starts:</p>
        <!-- <p>👉 Try these:</p>  -->
        <ul class="example-ul" style="">
          <li
            v-for="item in newCase"
            :key="item.query"
            :data-query="item.query"
            @click.stop="sendExample(item)"
          >
            <span class="query-text">{{ item.text }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
  Plus,
  Microphone,
  Check,
  Close,
  Right,
  Upload,
} from "@element-plus/icons-vue";
import { v4 as uuidv4 } from "uuid";

const props = defineProps({
  sessionId: String,
  chatHistory: Array,
  chatLoading: Boolean,
});

const uploadRef = ref(null);
const textareaValue = ref("");
const selectFilesObjsArray = ref([]);
const isInputFocused = ref(false);

function generateId() {
  // return crypto.randomUUID();
  return uuidv4();
}

const onFileChange = (uploadFile, uploadFiles) => {
  // selectFilesObjsArray.value = [];

  uploadFiles.forEach((item) => {
    const file = item.raw;
    if (!file) return;
    processFile(file);
  });

  // 清空上传组件
  uploadRef.value?.clearFiles();
};

// 处理单个文件的辅助函数
const processFile = (file) => {
  console.log(file);

  // 确定文件类型
  let fileType = "other";
  if (file.type.startsWith("image/")) {
    fileType = "image";
  } else if (
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    fileType = "word";
  } else if (
    file.type === "application/vnd.ms-excel" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    fileType = "excel";
  } else if (file.type === "text/plain") {
    fileType = "txt";
  } else if (file.type === "application/pdf") {
    fileType = "pdf";
  }

  selectFilesObjsArray.value.push({
    id: generateId(),
    file,
    url: URL.createObjectURL(file),
    fileType,
    isImage: fileType === "image",
  });
};

// 粘贴文件（支持图片、Word、Excel、TXT等文档）
const onPaste = (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      processFile(file);
      e.preventDefault(); // 阻止文件内容变成乱码文字
    }
  }
};

// 拖拽文件（支持图片、Word、Excel、TXT等文档）
const onDrop = (e) => {
  e.preventDefault();

  const filesLL = e.dataTransfer?.files;
  if (!filesLL || !filesLL.length) return;

  // 处理所有拖拽的文件
  for (let i = 0; i < filesLL.length; i++) {
    const file = filesLL[i];
    processFile(file);
  }
};

const sendExample = (item) => {
  if (props.chatLoading) {
    return;
  }
  //   loadDemoConversation(item.query);
  console.log(`${item.text} \n ${queryDefaultInfo[item.query]}`);

  textareaValue.value = `${item.text} \n ${queryDefaultInfo[item.query]}`;
  sendMessage();
};

function removeImage(index) {
  URL.revokeObjectURL(selectFilesObjsArray.value[index].url);
  selectFilesObjsArray.value.splice(index, 1);
}

const emit = defineEmits(["sendMessage"]);
const sendMessage = () => {
  if (props.chatLoading) {
    return;
  }
  if (textareaValue.value.trim() === "") return;
  const message = textareaValue.value.trim();
  textareaValue.value = "";
  // 发送消息到服务器
  // 这里可以添加实际的发送逻辑
  console.log("Sending message:", message);
  emit("sendMessage", message);
};

const StopBtnClick = () => {
  emit("StopBtnClick");
};

const triggerFileUpload = () => {
  // 触发隐藏的上传按钮
  const uploadElement =
    uploadRef.value?.$el?.querySelector('input[type="file"]');
  if (uploadElement) {
    uploadElement.click();
  }
};

defineExpose({
  selectFilesObjsArray,
});

// 录音 语音转文字
const isListening = ref(false);
const finalText = ref(""); // 已确认的文本
const interimText = ref(""); // 临时文本
const fullText = ref(""); // 最终 + 临时拼接

let recognition = null;

onMounted(() => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("当前浏览器不支持 Web Speech API，请使用 Chrome / Edge / Safari");
    return;
  }

  recognition = new SpeechRecognition();
  // recognition.lang = props.lang || "en-US"; // 'en-US'   // 英文
  // recognition.lang = "en-US";   // 英语
  // recognition.lang = "zh-CN"; // 中文普通话
  // recognition.lang = "ja-JP"; // 日语

  console.log("recognition.lang====", recognition.lang);
  recognition.interimResults = true; // 实时返回中间结果
  recognition.continuous = true; // 连续识别

  recognition.onstart = () => {
    console.log("recognition start");
    isListening.value = true;
    finalText.value = "";
    interimText.value = "";
    fullText.value = "";
  };

  recognition.onresult = (event) => {
    console.log("onresult event====", event);
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText.value += transcript;
      } else {
        interim += transcript;
      }
    }
    interimText.value = interim;
    console.log("interimText.value====", interimText.value);
    // 拼接成一段
    fullText.value = finalText.value + interimText.value;
    console.log("finalText.value====", finalText.value);
  };

  recognition.onend = () => {
    console.log("recognition end");
    isListening.value = false;
    textareaValue.value = finalText.value;
  };

  recognition.onerror = (e) => {
    console.error("语音识别出错：", e);
    isListening.value = false;
    ElMessage.error("语音识别出错");
  };
});

onBeforeUnmount(() => {
  stopRecognition();
});

function startRecognition() {
  if (recognition && !isListening.value) {
    recognition.start();
  }
}

function stopRecognition() {
  if (recognition && isListening.value) {
    recognition.stop();
  }
  isListening.value = false;
}

const cancelRecognition = () => {
  stopRecognition();
};

const confirmRecognition = () => {
  stopRecognition();
  textareaValue.value = finalText.value;
};

// 数据与逻辑
const scratchItems = [
  {
    query: "microsoft-report",
    method: "scratch",
    text: '"Research and write analysis report on Microsoft\'s latest earnings"',
  },
  {
    query: "meeting-minutes",
    method: "scratch",
    text: '"Create meeting minutes from recorded discussion"',
  },
  {
    query: "proposal",
    method: "scratch",
    text: '"Write project proposal with timeline, budget, and deliverables"',
  },
  {
    query: "daily-schedule",
    method: "scratch",
    text: '"Create a comprehensive and well-organized daily schedule"',
  },
];
const templateItems = [
  {
    query: "architecture-newsletter",
    method: "template",
    text: '"Create an October 2025 client newsletter for our architecture studio"',
  },
  {
    query: "back-to-school-newsletter",
    method: "template",
    text: '"Design back-to-school newsletter for elementary school families"',
  },
  {
    query: "basic-menu",
    method: "template",
    text: '"Create polished menu for backyard birthday dinner with three courses"',
  },
  {
    query: "architecture-brochure",
    method: "template",
    text: '"Design professional brochure for architecture firm showcasing projects"',
  },
];
const editItems = [
  {
    query: "rewrite",
    text: '"Rewrite this section to be more professional and concise"',
  },
  {
    query: "summarize",
    text: '"Summarize this 20-page report into 2-page executive summary"',
  },
  {
    query: "translate",
    text: '"Translate document to English while preserving all formatting"',
  },
  { query: "add-toc", text: '"Add table of contents"' },
];

const newCase = [
  {
    query: "meeting-minutes",
    method: "scratch",
    text: '"Create meeting minutes from recorded discussion"',
  },
  {
    query: "proposal",
    method: "scratch",
    text: '"Write project proposal with timeline, budget, and deliverables"',
  },
  {
    query: "daily-schedule",
    method: "scratch",
    text: '"Create a comprehensive and well-organized daily schedule"',
  },
  {
    query: "basic-menu",
    method: "template",
    text: '"Create polished menu for backyard birthday dinner with three courses"',
  },
];
// 默认信息（可根据需要扩展）
const queryDefaultInfo = {
  "microsoft-report": `Company: Microsoft Corporation\nFiscal Quarter: Q1 FY2026\nKey Focus Areas: Cloud revenue growth, AI services impact, Azure performance, Office 365 adoption\nComparison Period: Q1 FY2025 and Q4 FY2025\nInclude: Revenue breakdown by segment, year-over-year growth rates, operating margins, strategic initiatives\nTone: Professional financial analysis for investors and stakeholders`,
  "meeting-minutes": `Meeting: Product Strategy Planning Session\nDate: October 22, 2024\nAttendees: Sarah Chen (CEO), Mike Johnson (CTO), Lisa Park (CPO), Tom Wilson (CFO)\nDuration: 2 hours\nKey Decisions:\n- Approved $2M budget for AI feature development\n- Q1 2025 product roadmap finalized\n- New pricing strategy for enterprise tier\nAction Items:\n- Mike to hire 3 ML engineers by November\n- Lisa to conduct user research on proposed features\n- Tom to prepare financial projections for board meeting\nFollow-up: Weekly sync meetings starting next Monday`,
  proposal: `Meeting: Product Strategy Planning Session\nDate: October 22, 2024\nAttendees: Sarah Chen (CEO), Mike Johnson (CTO), Lisa Park (CPO), Tom Wilson (CFO)\nDuration: 2 hours\nKey Decisions:\n- Approved $2M budget for AI feature development\n- Q1 2025 product roadmap finalized\n- New pricing strategy for enterprise tier\nAction Items:\n- Mike to hire 3 ML engineers by November\n- Lisa to conduct user research on proposed features\n- Tom to prepare financial projections for board meeting\nFollow-up: Weekly sync meetings starting next Monday.`,
  rewrite: `None`,
  summarize: `Key sections to focus on:\n- Strategic objectives and business value proposition\n- Budget breakdown by phase and resource allocation\n- Critical milestones and timeline dependencies\n- Risk mitigation strategies and contingency plans\n- ROI projections and success metrics (35% cost reduction, 50% processing improvement)\n- Technology stack and infrastructure decisions\n- Resource requirements and team composition`,
  translate: `None`,
  "add-toc": `None`,
  "architecture-newsletter": `Studio: Skyline Atelier Architects\nMain Story: City greenlights North Pier Community Library; groundbreaking set for Oct 28\nSections to Include:\n- Library milestone & neighborhood impact\n- Market snapshot: office-to-residential conversions in top 5 US metros\n- Design trend: mass timber + carbon benefits\n- Practical guide: harnessing natural light in buildings\n- Team spotlight: Maya Ortega, AIA Chicago Emerging Professionals Award winner\n- Events: open studio, ribbon cutting, breakfast talk\nTone: Professional, approachable, client-facing`,
  "back-to-school-newsletter": `School: Roosevelt Middle School\nIssue: September 2025 "Back to School" edition\nPrincipal: Dr. Elena Alvarez\nSections to Include:\n- Welcome message with campus updates\n- Upcoming events calendar\n- Recent school highlights\n- Counselors' updates and resources\n- Monthly focus: Attendance & Kindness\n- Book recommendation\n- Inspirational quote\nContact Info: office: 718-555-0145 | ealvarez@rooseveltrms.org | rooseveltrms.org | @RMSRockets\nTone: Friendly, informative, community-oriented`,
  "basic-menu": `Event: Mia's 30th Candlelight Supper\nVibe: Cozy early-autumn; backyard string lights; 14 guests\nDietary: No peanuts; Jess is vegetarian\n\nSelected Courses:\n✓ First bite: Roasted squash + apple soup\n  - butternut and Honeycrisp roasted with sage and nutmeg\n  - blended with coconut milk; swirl of maple-coconut cream\n  - finish with toasted pepitas for crunch\n\n✓ The big plate: Red wine–braised short ribs on parmesan polenta\n  - slow 4-hour braise with garlic, thyme, and a strip of orange peel\n  - glossy pan sauce over creamy polenta\n  - side: charred broccolini with lemon zest\n  - veg backup: wild mushroom risotto with herbs (for Jess)\n\n✓ Sweet ending: Brown butter apple crisp + vanilla bean ice cream\n  - Granny Smith and Honeycrisp; cinnamon and cardamom\n  - oat-almond crumble; warm salted caramel drizzle\n  - serve with a scoop of vanilla bean ice cream\n\nStyle: Warm, tempting descriptions that match the cozy autumn atmosphere`,
  "architecture-brochure": `Firm: Harborline Design — Architecture + Interiors\nTagline: Design for coasts and communities\nBackground: Founded in 2014, minority-owned studio in Boston's Seaport focusing on adaptive reuse and waterfront projects\nKey Differentiators:\n- 70+ projects in New England\n- Licensed in MA, RI, NH; MBE certified\n- Energy models on every project; 32% lower EUI than code baseline\n- Community-first engagement process\nSections Needed:\n- Company background\n- Featured projects with images\n- Services offered\n- Design process\n- Team/hiring information\n- Awards & recognition\n- Contact information\nStyle: Clean, modern, professional with coastal influence`,
  "daily-schedule": `Person: Alex Kim\nRole: Graduate student and part-time software developer\nDate: Monday, October 28, 2025\nSchedule Requirements:\n\nWake up time: 6:30 AM\nWork hours: Remote software development (2:00 PM - 6:00 PM)\nClass schedule: Two graduate classes (Database Systems 9:00-10:30 AM, Machine Learning 11:00 AM-12:30 PM)\nGym session: 7:00-8:00 AM\nMeal times: Breakfast, lunch, dinner with specific time blocks\nStudy/homework blocks: 2-3 hours distributed throughout the day\nPersonal time: 1 hour for hobbies/relaxation\nSleep target: 11:00 PM\n\nAdditional Elements to Include:\n\nMorning routine (meditation, breakfast prep)\nCommute times if applicable\nShort breaks between activities\nEvening wind-down routine\nImportant reminders (team meeting at 3 PM, assignment due Wednesday)\nOptional buffer time for flexibility\n\nTone: Practical, motivating, balanced between productivity and self-care\nFormat: Clean visual layout with time blocks, easy to scan, includes priority markers or notes where helpful`,
};

// 这里仅做演示，实际应根据 selectedQuery 加载对应 JSON
async function loadDemoConversation(query) {
  // 这里只做简单模拟
  // chatHistory.value = [
  //   { role: 'user', content: `<div>${modalDetails.value.replace(/\n/g, '<br>')}</div>` },
  //   { role: 'agent', content: '<div>I understand your needs. Let me generate the document for you...</div>' },
  //   { role: 'agent', content: '<div><b>Document generated successfully!</b><br>This is a demo preview.</div>' }
  // ];
  // previewTitle.value = 'Custom Document';
  // previewSubtitle.value = 'Generated on ' + new Date().toISOString().split('T')[0];
  try {
    const res = await axios.get(
      `/data/conversations/${query}.json?t=${Date.now()}`
    );
    console.log(res);
    const demo = res.data;

    // Iterate messages and render progressively
    for (let i = 0; i < demo.conversation.length; i++) {
      const msg = demo.conversation[i];
      const delay = 1000;
      if (delay > 0) await new Promise((r) => setTimeout(r, delay));

      if (msg.role === "user") {
        chatHistory.value.push({
          role: "user",
          data: msg,
          html: `<div>${escapeHtml(msg.content).replace(/\n/g, "<br>")}</div>`,
        });
      } else {
        chatHistory.value.push({
          role: "agent",
          data: msg,
          html: `<div>${escapeHtml(msg.content || "")}</div>`,
        });
      }

      if (msg.actions && msg.actions.length > 0) {
        let action = msg.actions[msg.actions.length - 1];
        if (action.previewType == "document") {
          const docUrl = action.previewContent;
          if (docUrl.endsWith(".md")) {
          } else {
            documentResult.value = action;
          }
        }
      }
    }

    chatLoading.value = false;

    // documentResult.value = demo.document
  } catch (err) {
    // show an error message in chat area and preview
    // chatHistory.value = [{ role: 'agent', html: `<div style="color:#ef4444;">❌ Failed to load conversation: ${escapeHtml(err.message)}</div>` }];
    // previewHtml.value = `<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon" style="color:#ef4444"></i><p class="empty-text">Failed to load conversation</p></div>`;
    // isProcessing.value = false;
    // showToast('Failed to load demo conversation', 'error');
    console.log(err);
    chatLoading.value = false;
    return;
  }
}
</script>


<style lang="scss" scoped>
/* ==================== Input Area ==================== */
.chat-input-container {
  padding: 16px 24px 50px;

  .content {
    background: #fff;
    border: 1px solid rgba(13, 13, 13, 0.1);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
    padding: 0 1em 0.8em;
    border-radius: 20px;
    .listening-result-div {
      padding: 0 1em;
      line-height: 1.5;
      min-height: 2em;
      max-height: 120px;
    }
    .input-wrapper {
      display: flex;
      gap: 12px;
      align-items: flex-end;

      :deep(.el-textarea) {
        font-size: 1em;
        .el-textarea__inner {
          box-shadow: none;
          min-height: 2em;
          padding: 0 0em;
          border: 0;

          line-height: 1.5;
          font-family: var(--font-family);
          background-color: #fff;
          color: var(--text-primary);
          resize: none;
          transition: all var(--transition-speed);
        }
      }

      .chat-input:focus {
        outline: none;
        border-color: var(--primary-color);
        background-color: #fff;
      }

      .chat-input:disabled {
        cursor: not-allowed;
        opacity: 0.6;
        background-color: var(--bg-secondary);
        color: var(--text-tertiary);
      }
    }

    .btn-box {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      button {
        width: 2.4em;
        height: 2.4em;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        border: 1px solid transparent;
        border-radius: 3px;
        color: #333;
        font-size: 1em;
        .el-icon,
        .fas {
          font-size: 1.5em;
        }
      }
      .right {
        display: flex;
        gap: 4px;
        .el-button {
          margin: 0;
          border-radius: 50%;
          &:hover {
            background: #0d0d0d05;
          }
        }
        .send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #000;
          border: 1px solid #000;
          color: white;
          cursor: pointer;
          transition: all var(--transition-speed);
          flex-shrink: 0;
          &:hover {
            background-color: var(--primary-hover);
            border-color: var(--primary-hover);
          }

          &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
            background-color: var(--text-tertiary);
            border-color: var(--text-tertiary);
          }

          &:disabled:hover {
            background-color: var(--text-tertiary);
            border-color: var(--text-tertiary);
          }

          &:active {
            transform: none;
          }
        }
      }
    }
  }

  .file-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 1em;
    .file-item {
      width: 80px;
      height: 80px;
      border-radius: 6px;
      text-align: center;
      position: relative;
    }

    .delete-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #000;
      color: white;
      border: none;
      cursor: pointer;
      // font-size: 14px;
      line-height: 1;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      z-index: 1;

      &:hover {
        transform: scale(1.1);
      }
    }

    .file-preview {
      width: 100%;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      overflow: hidden;
      background-color: #f5f5f5;
    }

    .file-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }

    .file-icon-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .file-icon {
      font-size: 40px;
    }

    .file-icon.word {
      color: #2b579a;
    }

    .file-icon.excel {
      color: #1e7145;
    }

    .file-icon.pdf {
      color: #d63638;
    }

    .file-icon.txt {
      color: #333;
    }

    .file-icon.other {
      color: #666;
    }

    .info {
      margin-top: 6px;
      display: none;
    }

    .name {
      display: block;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .example-container {
    // background: #fff;
    padding: 0;
    margin: 0;
    z-index: 3;
    // position: absolute;
    // left: 0;
    // right: 0;
    top: calc(100% - 12px);
    padding: 10px 24px;
    border-radius: 20px;
    & > p {
      font-size: 1em;
      font-weight: 500;
      color: #333;
      margin-bottom: 10px;
    }
    ul {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px;
    }
    ul li {
      border: 1px solid #f1f1f1;
      background: #fff;
      padding: 10px 14px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      // margin: 5px 0;
      width: calc(50% - 5px);
      &:hover {
        // border-left-color: var(--primary-color);
        // border-left: 3px solid var(--primary-color);
        transform: translateX(2px);
        // background: #f0f0f0;
        transform: scale(1.02);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
