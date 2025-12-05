<template>
  <div
    :class="['light-theme', showDemo ? 'demo-page' : 'query-gallery-page']"
    id="app"
  >
    <!-- Query Gallery Page -->
    <div v-show="false" id="queryGalleryPage">
      <div class="gallery-header">
        <div class="header-brand">
          <h1 class="brand-title">Office CLI</h1>
        </div>
      </div>
      <div class="gallery-content">
        <div class="gallery-intro">
          <h2 class="gallery-title">
            Office CLI: Agentic Transformation for Productivity
          </h2>
          <p class="gallery-subtitle">
            Intelligent document workflows powered by AI agents
          </p>
        </div>
        <div class="query-list-container">
          <!-- Create & Generate -->
          <div class="query-section">
            <h3 class="section-title">📝 Create & Generate</h3>
            <div class="query-subsection">
              <h4 class="subsection-title">🚀 Create from Scratch</h4>
              <div class="query-items">
                <div
                  v-for="item in scratchItems"
                  :key="item.query"
                  class="query-item"
                  :data-query="item.query"
                  :data-method="item.method"
                  @click="openModal(item.query)"
                >
                  <span class="query-text">{{ item.text }}</span>
                </div>
              </div>
            </div>
            <div class="query-subsection">
              <h4 class="subsection-title">📋 Start with Template</h4>
              <div class="query-items">
                <div
                  v-for="item in templateItems"
                  :key="item.query"
                  class="query-item"
                  :data-query="item.query"
                  :data-method="item.method"
                  @click="openModal(item.query)"
                >
                  <span class="query-text">{{ item.text }}</span>
                </div>
              </div>
              <a
                href="http://www.office-cli.onl:8889/template-gallery.html"
                class="template-gallery-link"
                target="_blank"
              >
                Explore more professional templates in gallery →
              </a>
            </div>
          </div>
          <!-- Edit & Transform -->
          <div class="query-section">
            <h3 class="section-title">✏️ Edit & Transform</h3>
            <div class="query-items">
              <div
                v-for="item in editItems"
                :key="item.query"
                class="query-item"
                :data-query="item.query"
                @click="openModal(item.query)"
              >
                <span class="query-text">{{ item.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Query Details Modal -->
      <div class="modal-overlay" id="creationModal" v-show="showModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Provide Information for Your Document</h3>
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="query-details-section">
              <label class="query-details-label"
                >Example information that will be used for your document:</label
              >
              <p class="query-details-hint">
                This is sample data for demonstration purposes only.
              </p>
              <textarea
                class="query-details-textarea"
                v-model="modalDetails"
                placeholder="Example details will appear here..."
                rows="8"
                readonly
              ></textarea>
            </div>
            <div class="modal-actions">
              <button class="cancel-btn" @click="closeModal">Cancel</button>
              <button class="proceed-btn" @click="proceed">
                Create Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Demo Execution Page -->
    <div id="demoPage">
      <div class="app-container">
        <!-- Left: Chat Panel -->
        <div class="chat-panel">
          <div class="chat-header">
            <div class="header-left">
              <!-- <button
                class="icon-btn back-btn"
                @click="backToGallery"
                title="Back to gallery"
              >
                <i class="fas fa-arrow-left"></i>
              </button> -->
              <h1 class="app-title">Office CLI</h1>
            </div>
            <!-- <div class="header-actions">
              <div class="speed-control">
                <button
                  class="speed-btn"
                  v-for="speed in speeds"
                  :key="speed.value"
                  :class="{ active: speed.value === currentSpeed }"
                  @click="setSpeed(speed.value)"
                  :title="speed.title"
                >
                  <i :class="speed.icon" :style="speed.style"></i>
                </button>
              </div>
            </div> -->
          </div>
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
                  msg.role === 'agent' &&
                  idx > 0 &&
                  chatHistory[idx - 1].role != 'agent'
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
                  <div v-html="msg.data.content"></div>
                </template>

                <template v-else>
                  <div
                    style="margin-bottom: 8px"
                    v-html="msg.data.content"
                  ></div>
                </template>
                <template
                  v-if="msg.data.actions && msg.data.actions.length > 0"
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
                      v-if="
                        action.previewType === 'code' && action.previewContent
                      "
                      class="action-code-collapsible"
                    >
                      <div
                        class="action-code-header"
                        @click="toggleCodeBlock(msgIdx, index)"
                      >
                        <i class="fas fa-play-circle"></i>
                        <span>Execute Code</span>
                        <i
                          :class="[
                            'fas',
                            'collapse-icon',
                            expandedCodeBlocks[`${msgIdx}-${index}`]
                              ? 'fa-chevron-down'
                              : 'fa-chevron-right',
                          ]"
                        ></i>
                      </div>
                      <div
                        v-show="expandedCodeBlocks[`${msgIdx}-${index}`]"
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
          <div class="chat-input-container" style="position: relative;">
            <ul v-if="chatHistory.length == 0" class="example-ul" style="">
              <li
                v-for="item in scratchItems"
                :key="item.query"
                :data-query="item.query"
                @click="sendExample(item.query)"
              >
                <span class="query-text">{{ item.text }}</span>
              </li>
            </ul>
            <div class="input-wrapper">
              <textarea
                v-model="textareaValue"
                id="userInput"
                class="chat-input"
                :placeholder="chatHistory.length == 0 ? 'You can choose one of the examples above or enter your own requirements.': 'Enter your own requirements'"
                rows="1"
              ></textarea>
              <button
                class="send-btn"
                id="sendBtn"
                @click="sendMessage"
                :disabled="btnLoading || textareaValue.trim().length == 0"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
        <!-- Right: Preview/Detail Panel -->
        <div class="preview-panel">
          <div class="preview-header">
            <div class="preview-title-section">
              <h2 class="preview-title" id="previewTitle">
                {{ previewTitle }}
              </h2>
              <span class="preview-subtitle" id="previewSubtitle">{{
                previewSubtitle
              }}</span>
            </div>
            <div class="preview-actions">
              <button
                class="icon-btn"
                id="closeDetailBtn"
                title="Close detail view"
                v-show="showDetailClose"
                @click="closeDetail"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="preview-content" id="previewContent">
            <div
              v-if="documentResult && documentResult.previewContent"
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
                <a
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
                >
              </div>
              <iframe
                :src="`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                  documentResult.previewContent
                )}`"
                style="width: 100%; flex: 1; border: none; background: #fff"
              ></iframe>
            </div>

            <div v-else-if="btnLoading" class="empty-state">
              <i class="fas fa-file-word empty-icon"></i>
              <p class="empty-text">Generating your document...</p>
              <p class="empty-hint">
                Please wait while we process your request
              </p>
            </div>

            <div v-else>
            </div>
          </div>
          <!-- Action Detail View (hidden by default) -->
          <div
            class="action-detail-view"
            id="actionDetailView"
            v-show="showActionDetail"
          >
            <div class="detail-header">
              <div class="detail-title-section">
                <i class="fas fa-code detail-icon" id="detailIcon"></i>
                <div>
                  <h3 class="detail-title" id="detailTitle">Action Details</h3>
                  <p class="detail-subtitle" id="detailSubtitle">
                    Click on actions to view details
                  </p>
                </div>
              </div>
            </div>
            <div class="detail-content" id="detailContent">
              <!-- Action details will be shown here -->
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
import { onMounted } from "vue";
import axios from "axios";

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

const showModal = ref(false);
const showDemo = ref(false);
const showActionDetail = ref(false);
const showDetailClose = ref(false);
const modalDetails = ref("");
const selectedQuery = ref(null);
const previewTitle = ref("Document Preview");
const previewSubtitle = ref("Waiting for generation...");
const chatHistory = ref([]);
const documentResult = ref();

const expandedCodeBlocks = ref({}); // 追踪代码块展开/折叠状态



function openModal(query) {
  selectedQuery.value = query;
  modalDetails.value = queryDefaultInfo[query] || "";
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}
function proceed() {
  showModal.value = false;
  showDemo.value = true;
  // 加载演示对话

  console.log("selectedQuery.value==", selectedQuery.value);
  loadDemoConversation(selectedQuery.value);
}
function backToGallery() {
  showDemo.value = false;
  chatHistory.value = [];
  previewTitle.value = "Document Preview";
  previewSubtitle.value = "Waiting for generation...";
}
function setSpeed(val) {
  currentSpeed.value = val;
}
function closeDetail() {
  showActionDetail.value = false;
  showDetailClose.value = false;
}

const speedSettings = {
  slow: { message: 1500, action: 2000 },
  medium: { message: 800, action: 1000 },
  fast: { message: 300, action: 400 },
  instant: { message: 0, action: 0 },
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

    btnLoading.value = false;

    // documentResult.value = demo.document
  } catch (err) {
    // show an error message in chat area and preview
    // chatHistory.value = [{ role: 'agent', html: `<div style="color:#ef4444;">❌ Failed to load conversation: ${escapeHtml(err.message)}</div>` }];
    // previewHtml.value = `<div class="empty-state"><i class="fas fa-exclamation-triangle empty-icon" style="color:#ef4444"></i><p class="empty-text">Failed to load conversation</p></div>`;
    // isProcessing.value = false;
    // showToast('Failed to load demo conversation', 'error');
    console.log(err);
    btnLoading.value = false;
    return;
  }
}

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

onMounted(() => {
  // 可在此处做初始化
});

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


const scrollbarRef = ref(null);
const textareaValue = ref("");
const btnLoading = ref(false);

const sendExample = (caseText)=>{
  if(btnLoading.value){
    return
  }
  btnLoading.value = true
  loadDemoConversation(caseText);
}

const sendMessage = () => {
  if (textareaValue.value.trim().length == 0) {
    return;
  }
  btnLoading.value = true;
  chatHistory.value.push({
    role: "user",
    data: { role: "user", content: textareaValue.value.trim() },
  });
  textareaValue.value = "";

  setTimeout(() => {
    btnLoading.value = false;
  }, 1000);
};

// Helpers
function escapeHtml(text) {
  if (!text && text !== 0) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function mapIcon(icon) {
  const iconMap = {
    "fa-search-plus": "🔍",
    "fa-file-alt": "📄",
    "fa-plug": "🔌",
    "fa-file-word": "📝",
    "fa-pen": "✍️",
    "fa-brain": "🧠",
    "fa-file-lines": "📋",
    "fa-list-check": "✅",
    "fa-compress": "📊",
    "fa-magnifying-glass": "🔎",
    "fa-file": "📁",
    "fa-code": "💻",
    "fa-database": "🗄️",
    "fa-chart-bar": "📊",
  };
  return iconMap[icon] || "🔧";
}

// Toggle Code Block Display
function toggleCodeBlock(msgIdx, actionIndex) {
  const key = `${msgIdx}-${actionIndex}`;
  expandedCodeBlocks.value[key] = !expandedCodeBlocks.value[key];
}

// JavaScript Syntax Highlighting
function highlightJavaScript(code) {
  // Escape HTML first
  code = escapeHtml(code);

  // Use placeholders to protect strings and comments from other replacements
  const strings = [];
  const comments = [];

  // Extract and protect comments first
  code = code.replace(/(\/\/.*$)/gm, (match) => {
    const index = comments.length;
    comments.push(`<span class="comment">${match}</span>`);
    return `__COMMENT_${index}__`;
  });

  code = code.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => {
    const index = comments.length;
    comments.push(`<span class="comment">${match}</span>`);
    return `__COMMENT_${index}__`;
  });

  // Extract and protect strings
  code = code.replace(/(`[^`]*`)/g, (match) => {
    const index = strings.length;
    strings.push(`<span class="string">${match}</span>`);
    return `__STRING_${index}__`;
  });

  code = code.replace(/('[^']*')/g, (match) => {
    const index = strings.length;
    strings.push(`<span class="string">${match}</span>`);
    return `__STRING_${index}__`;
  });

  code = code.replace(/("[^"]*")/g, (match) => {
    const index = strings.length;
    strings.push(`<span class="string">${match}</span>`);
    return `__STRING_${index}__`;
  });

  // Now apply other highlighting
  // Keywords
  const keywords = [
    "const",
    "let",
    "var",
    "function",
    "async",
    "await",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "try",
    "catch",
    "finally",
    "throw",
    "new",
    "class",
    "extends",
    "import",
    "export",
    "from",
    "default",
    "typeof",
    "instanceof",
  ];
  const keywordPattern = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
  code = code.replace(keywordPattern, '<span class="keyword">$1</span>');

  // Numbers
  code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

  // Function calls
  code = code.replace(
    /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
    '<span class="function">$1</span>('
  );

  // Properties (after dot notation)
  code = code.replace(
    /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    '.<span class="property">$1</span>'
  );

  // Restore comments
  comments.forEach((comment, index) => {
    code = code.replace(`__COMMENT_${index}__`, comment);
  });

  // Restore strings
  strings.forEach((string, index) => {
    code = code.replace(`__STRING_${index}__`, string);
  });

  return code;
}
</script>

<style scoped lang="scss">
.example-ul{
  background: #fff;
  padding: 0;
  margin: 0;
  z-index: 3;
  position: absolute;left: 0;right: 0;bottom: 80px;padding: 10px 24px;
  li{
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
