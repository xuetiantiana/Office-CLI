<template>
  <div :class="['light-theme', 'demo-page']" id="app">
    <!-- Demo Execution Page -->
    <div id="demoPage">
      <div class="app-container">
        <!-- Left: Chat Panel -->
        <div class="chat-panel">
          <div class="chat-header">
            <div class="header-left">
              <h1 class="app-title">Office CLI</h1>
            </div>
          </div>
          <!-- chat message list -->
          <div class="chat-messages" id="chatMessages" ref="scrollbarRef">
            <div
              v-for="(msg, idx) in chatHistory"
              :key="idx"
              class="conversation-item"
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
                  <div v-text="msg.text" style="white-space: pre-line"></div>
                </template>

                <template v-else>
                  <div
                    style="margin-bottom: 8px; white-space: pre-line"
                    v-text="msg.text"
                  ></div>
                </template>
                <template
                  v-if="
                    msg.data &&
                    msg.data.actions &&
                    msg.data &&
                    msg.data.actions.length > 0
                  "
                >
                  <div
                    v-for="(action, index) in msg.data && msg.data.actions"
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
                      v-if="
                        action.previewType === 'code' && action.previewContent
                      "
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
          <!-- chat input -->
          <div class="chat-input-container" style="position: relative">
            <ul v-if="chatHistory.length == 0" class="example-ul" style="">
              <li
                v-for="item in scratchItems"
                :key="item.query"
                :data-query="item.query"
                @click="sendExample(item)"
              >
                <span class="query-text">{{ item.text }}</span>
              </li>
            </ul>
            <div class="input-wrapper">
              <textarea
                v-model="textareaValue"
                id="userInput"
                class="chat-input"
                :placeholder="
                  chatHistory.length == 0
                    ? 'You can choose one of the examples above or enter your own requirements.'
                    : 'Enter your own requirements'
                "
                rows="1"
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.shift.enter
              ></textarea>
              <button
                class="send-btn"
                id="sendBtn"
                @click="sendMessage"
                :disabled="chatLoading || textareaValue.trim().length == 0"
              >
                <i v-if="!chatLoading" class="fas fa-paper-plane"></i>
                <i v-else class="fas fa-spinner fa-spin"></i>
              </button>
            </div>
          </div>
        </div>
        <!-- Right: Preview/Detail Panel -->
        <div class="preview-panel">
          <div class="preview-header">
            <div class="preview-title-section">
              <h2 class="preview-title" id="previewTitle">
                Document Preview
              </h2>
              <span class="preview-subtitle" id="previewSubtitle">Waiting for generation...</span>
            </div>
          </div>
          <div class="preview-content" id="previewContent">
            <div
              v-if="true"
              style="
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
              "
            >
              <div
                style="
                  padding: 10px;
                  background: #f8f9fa;
                  border-bottom: 1px solid #e0e0e0;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <span style="font-weight: 600; color: #0078d4"
                  >Microsoft Word Document</span
                >
                <!-- <a
                  :href="documentResult.previewContent"
                  download="Document.docx"
                  style="
                    padding: 6px 12px;
                    background: #0078d4;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    font-size: 12px;
                  "
                  >⬇ Download Document</a
                > -->
              </div>
              <!-- <iframe
                :src="`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                  documentResult.previewContent
                )}`"
                style="width: 100%; flex: 1; border: none; background: #fff"
              ></iframe> -->
              <embed src="http://20.1.170.90:2233/files/test.pdf" type="" style="height: 100%;">
            </div>

            <div v-else-if="chatLoading" class="empty-state">
              <i class="fas fa-file-word empty-icon"></i>
              <p class="empty-text">Generating your document...</p>
              <p class="empty-hint">
                Please wait while we process your request
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
    <!-- Toast notification container -->
    <div class="toast-container" id="toastContainer"></div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from "vue";
import { useRouter } from "vue-router";

import { onMounted } from "vue";
import { escapeHtml, mapIcon, highlightJavaScript } from "@/utils/common.js";
import axios from "axios";
import { chatStream } from "@/utils/chatManger.js";
const props = defineProps({
  sessionId: String,
});
const router = useRouter();

const previewTitle = ref("Document Preview");
const previewSubtitle = ref("Waiting for generation...");

const seeeion_id = ref(null);
const chatHistory = ref([]);

const textareaValue = ref("");
const chatLoading = ref(false);

const scrollbarRef = ref(null);

const documentResult = ref();

const expandedCodeBlocks = ref({}); // 追踪代码块展开/折叠状态

function loadSession(sessionId) {
  if (!sessionId) {
    return;
  }
  const chatHistoryList = JSON.parse(
    localStorage.getItem("session_id_chat_history_list") || "[]"
  );
  const session = chatHistoryList.find((s) => s.session_id === sessionId);

  if (session) {
    chatHistory.value = session.chatHistory;

    // 如果只有一条用户消息，需要自动请求 AI
    if (chatHistory.value.length === 1) {
      console.log("请求接口");
      //   await callAPI(messages.value[0].content);
    }
  } else {
    alert("该session_id无历史记录");
    router.push("/");
  }
}
// 页面首次进入
onMounted(async () => {
  seeeion_id.value = props.sessionId;
  loadSession(props.sessionId);
});
// 切换 session_id
watch(
  () => props.sessionId,
  (newId) => {
    seeeion_id.value = newId;
    loadSession(newId);
  }
);

watch(
  chatHistory,
  async () => {
    // 当 chatHistory 更新后，等待 DOM 更新（nextTick）再滚动到底部。
    // 兼容三种情况：
    // 1) scrollbarRef.value 是自定义滚动组件实例，含 wrapRef 与 setScrollTop 方法
    // 2) scrollbarRef.value 是直接指向 DOM 元素（例如 div），可使用 element.scrollTop
    // 3) scrollbarRef.value 未定义 -> 安全地跳过
    await nextTick();

    const sb = scrollbarRef.value;

    if (!sb) return;

    // 优先处理自定义组件：有 wrapRef 或 setScrollTop
    const wrap = sb.wrapRef || sb.wrap || null;

    if (
      typeof sb.setScrollTop === "function" &&
      wrap &&
      wrap.scrollHeight != null
    ) {
      // 自定义组件提供了 setScrollTop，使用它（传入目标高度）
      try {
        sb.setScrollTop(wrap.scrollHeight);
      } catch (e) {
        // 回退到直接修改 DOM
        if (wrap && typeof wrap.scrollTop !== "undefined")
          wrap.scrollTop = wrap.scrollHeight;
      }
      return;
    }

    // 如果 scrollbarRef 本身就是 DOM 元素
    const el = sb instanceof Element ? sb : wrap;
    if (el && typeof el.scrollTop !== "undefined") {
      // 将滚动位置设置为内容高度，确保滚到底部
      el.scrollTop = el.scrollHeight;
    }
  },
  { deep: true }
);

const sendMessage = async () => {
  if (textareaValue.value.trim().length == 0) {
    return;
  }
  const text = textareaValue.value.trim();
  textareaValue.value = "";
  chatLoading.value = true;

  // ① push user 消息
  chatHistory.value.push({
    role: "user",
    text: text,
    // data: { role: "user", content: text },
  });

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

  if (!seeeion_id.value) {
    seeeion_id.value = generateId();
  }
  await chatStream(
    {
      session_id: seeeion_id.value,
      messages: chatHistory.value,
    },
    {
      onStart: () => {
        console.log("🔵 onStart");
      },

      onDelta: (delta) => {
        console.log("onDelta", delta);
        assistantMsg.text += delta; // 🔥 实时流式显示
      },

      onEnd: (final) => {
        // assistantMsg.streaming = false;
        console.log("🏁 完成:", final);
        chatLoading.value = false;
      },

      onError: (err) => {
        // assistantMsg.streaming = false;
        assistantMsg.text += "\n[出错了]";
        console.error("❌ error:", err);
        chatLoading.value = false;
      },
    }
  );

  save();
};

// ---- 保存 session 到 localStorage ----
function save() {
  const chatHistoryList = JSON.parse(
    localStorage.getItem("session_id_chat_history_list") || "[]"
  );
  const idx = chatHistoryList.findIndex(
    (s) => s.session_id === seeeion_id.value
  );

  if (idx !== -1) {
    chatHistoryList[idx].chatHistory = chatHistory.value;
    localStorage.setItem(
      "session_id_chat_history_list",
      JSON.stringify(chatHistoryList)
    );
  } else {
    // 首条消息放入 session

    chatHistoryList.push({
      session_id: seeeion_id.value,
      chatHistory: chatHistory.value,
    });

    localStorage.setItem(
      "session_id_chat_history_list",
      JSON.stringify(chatHistoryList)
    );
  }
}

function generateId() {
  return "msg-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

// Toggle Code Block Display
function toggleCodeBlock(msgIdx, actionIndex) {
  const key = `${msgIdx}-${actionIndex}`;
  // console.log("!!", key);
  expandedCodeBlocks.value[key] = !expandedCodeBlocks.value[key];
}

const sendExample = (item) => {
  if (chatLoading.value) {
    return;
  }
  chatLoading.value = true;
  //   loadDemoConversation(item.query);
  console.log(`${item.text} \n ${queryDefaultInfo[item.query]}`);

  textareaValue.value = `${item.text} \n ${queryDefaultInfo[item.query]}`;
  sendMessage();
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

// 默认信息（可根据需要扩展）
const queryDefaultInfo = {
  "microsoft-report": `Company: Microsoft Corporation\nFiscal Quarter: Q1 FY2026\nKey Focus Areas: Cloud revenue growth, AI services impact, Azure performance, Office 365 adoption\nComparison Period: Q1 FY2025 and Q4 FY2025\nInclude: Revenue breakdown by segment, year-over-year growth rates, operating margins, strategic initiatives\nTone: Professional financial analysis for investors and stakeholders`,
  "meeting-minutes": `Meeting: Product Strategy Planning Session\nDate: October 22, 2024\nAttendees: Sarah Chen (CEO), Mike Johnson (CTO), Lisa Park (CPO), Tom Wilson (CFO)\nDuration: 2 hours\nKey Decisions:\n- Approved $2M budget for AI feature development\n- Q1 2025 product roadmap finalized\n- New pricing strategy for enterprise tier\nAction Items:\n- Mike to hire 3 ML engineers by November\n- Lisa to conduct user research on proposed features\n- Tom to prepare financial projections for board meeting\nFollow-up: Weekly sync meetings starting next Monday`,
  proposal: `Meeting: Product Strategy Planning Session\nDate: October 22, 2024\nAttendees: Sarah Chen (CEO), Mike Johnson (CTO), Lisa Park (CPO), Tom Wilson (CFO)\nDuration: 2 hours\nKey Decisions:\n- Approved $2M budget for AI feature development\n- Q1 2025 product roadmap finalized\n- New pricing strategy for enterprise tier\nAction Items:\n- Mike to hire 3 ML engineers by November\n- Lisa to conduct user research on proposed features\n- Tom to prepare financial projections for board meeting\nFollow-up: Weekly sync meetings starting next Monday. Please read "reports/proposal.md" for more detail informations.`,
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

<style scoped lang="scss">
.example-ul {
  background: #fff;
  padding: 0;
  margin: 0;
  z-index: 3;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 80px;
  padding: 10px 24px;
  li {
    padding: 10px 14px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #e0e0e0;
    margin: 5px 0;

    &:hover {
      border-left-color: var(--primary-color);
      border-left: 3px solid var(--primary-color);
      transform: translateX(2px);
      background: #f0f0f0;
    }
  }
}
</style>
