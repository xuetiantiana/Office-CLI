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
                :placeholder="
                  chatHistory.length == 0
                    ? 'You can choose one of the examples above or enter your own requirements.'
                    : 'Enter your own requirements'
                "
                rows="1"
              ></textarea>
              <button
                class="send-btn"
                id="sendBtn"
                @click="sendMessage"
                :disabled="chatLoading || textareaValue.trim().length == 0"
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
                    font-size: .9em;
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

            <div v-else-if="chatLoading" class="empty-state">
              <i class="fas fa-file-word empty-icon"></i>
              <p class="empty-text">Generating your document...</p>
              <p class="empty-hint">
                Please wait while we process your request
              </p>
            </div>

            <div v-else></div>
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
import { escapeHtml, mapIcon, highlightJavaScript } from "@/utils/common.js";
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

const previewTitle = ref("Document Preview");
const previewSubtitle = ref("Waiting for generation...");

const seeeion_id = ref(null);
const chatHistory = ref([]);

const textareaValue = ref("");
const chatLoading = ref(false);

const scrollbarRef = ref(null);

const documentResult = ref();

const expandedCodeBlocks = ref({}); // 追踪代码块展开/折叠状态

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

const sendExample = (caseText) => {
  if (chatLoading.value) {
    return;
  }
  chatLoading.value = true;
  loadDemoConversation(caseText);
};

const sendMessage = () => {
  if (textareaValue.value.trim().length == 0) {
    return;
  }
  chatLoading.value = true;
  chatHistory.value.push({
    role: "user",
    data: { role: "user", content: textareaValue.value.trim() },
  });
  // textareaValue.value = "";

  chatStream(textareaValue.value.trim());

  setTimeout(() => {
    chatLoading.value = false;
  }, 1000);
};
function generateId() {
  return "msg-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

const chatStream = async (text) => {
  if (!seeeion_id.value) {
    seeeion_id.value = generateId();
  }

  // --- 1. 创建可取消控制器（支持手动取消 & 超时取消） ---
  const controller = new AbortController();

  // 自动超时：20 秒后中断流式请求
  // setTimeout(() => controller.abort(), 20000);

  // --- 2. 前端发送的 payload ---
  const payload = {
    messages: [{ role: "user", content: text }],
    model: "gpt-4o-mini",
    stream: true,
    max_tokens: 2048,
    temperature: 0.7,
    metadata: { session_id: seeeion_id.value },
  };

  // --- 3. 发起请求 ---
  fetch("http://localhost:3001/api/chat/stream", {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      console.log("连接成功:", res);
      // --- 4. 处理非 200 错误（如 403 / 404 / 500）---
      if (!res.ok) {
        const text = await res.text();

        try {
          const err = JSON.parse(text).error;
          console.error("❌ API Error:", err.code, err.message);
        } catch {
          console.error("❌ Unknown Error:", text);
        }
        return;
      }

      // --- 5. 开始读取流 ---
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      console.log("decoder", decoder);

      let buffer = "";
      let finalText = ""; // 最终 AI 回复内容

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // 解码 chunk（可能不完整）
        buffer += decoder.decode(value, { stream: true });
        console.log("buffer", buffer);
        // 按 SSE 标准：每条事件之间是空行
        const events = buffer.split("\n\n");

        // 最后一段可能是不完整 chunk，留着下次处理
        buffer = events.pop();

        for (const event of events) {
          if (!event.startsWith("data:")) continue;

          const jsonStr = event.replace(/^data:\s*/, "");

          let data;
          try {
            data = JSON.parse(jsonStr);
          } catch {
            console.warn("Invalid JSON chunk:", jsonStr);
            continue;
          }

          // --- 6. 根据 type 处理不同事件 ---
          switch (data.type) {
            case "message_start":
              console.log("📢 Message Start:", data);
              break;

            case "message_chunk":
              const text = data.delta?.text || "";
              finalText += text;
              console.log("🔹 Chunk:", text);
              break;

            case "message_end":
              console.log("🏁 Message End. Usage:", data.usage);
              break;
          }
        }
      }

      chatLoading.value = false;
      // --- 7. 最终结果输出 ---
      console.log("✨ Full Response:", finalText);
    })
    .catch((err) => {
      if (err.name === "AbortError") {
        console.warn("⚠️ Request aborted (timeout or manual).");
      } else {
        console.error("❌ Network Error:", err);
      }
      chatLoading.value = false;
    });
};

// Toggle Code Block Display
function toggleCodeBlock(msgIdx, actionIndex) {
  const key = `${msgIdx}-${actionIndex}`;
  // console.log("!!", key);
  expandedCodeBlocks.value[key] = !expandedCodeBlocks.value[key];
}
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  /* ==================== Left Chat Panel ==================== */
  .chat-panel {
    width: 40%;
    min-width: 400px;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
    border-right: 1px solid var(--border-color);
    transition: background-color var(--transition-speed);
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--bg-primary);
      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        .app-title {
          font-size: 1.4em;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }

    /* ==================== Message Area ==================== */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }

  /* Conversation Item Styles (for demo page) */
  .conversation-item {
    margin-bottom: 16px;
    animation: fadeIn 0.3s ease-in;
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
      font-size: .9em;
      font-weight: 600;
    }

    .conv-avatar.user {
      background: #0078d4;
      color: #fff;
    }

    .conv-avatar.assistant {
      background: #7e3ff2;
      color: #fff;
    }

    .conv-role {
      font-size: 1em;
      font-weight: 600;
      color: #333;
    }

    .conv-content {
      background: transparent;
      padding: 0;
      border: none;
      line-height: 1.6;
      font-size: 1em;
      margin-left: 0;
    }

    .conv-content.user-content {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
      margin-left: 32px;
    }

    .conv-content pre {
      background: #fff;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
      font-size: .9em;
      font-family: "Consolas", "Monaco", "Courier New", monospace;
      border: 1px solid #e0e0e0;
    }

    .conv-content code {
      background: #fff;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: "Consolas", "Monaco", "Courier New", monospace;
      font-size: .9em;
      color: #d63384;
      border: 1px solid #f0e5ea;
    }
  }

  /* Tool Call Styles (matching replay.html) */
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
      font-size: .9em;
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

  
  

  /* Loading Animation */
  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
  }

  .typing-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--text-tertiary);
    animation: typing 1.4s infinite;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.7;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }

  /* ==================== Input Area ==================== */
  .chat-input-container {
    padding: 16px 24px 24px;
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-primary);

    .input-wrapper {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      margin-bottom: 12px;
    }

    .chat-input {
      flex: 1;
      min-height: 44px;
      max-height: 120px;
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: 3px;
      font-size: 1em;
      font-family: var(--font-family);
      background-color: #fff;
      color: var(--text-primary);
      resize: none;
      transition: all var(--transition-speed);
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

    .send-btn {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--primary-color);
      border: 1px solid var(--primary-color);
      border-radius: 3px;
      color: white;
      font-size: 1.1em;
      cursor: pointer;
      transition: all var(--transition-speed);
      flex-shrink: 0;
    }

    .send-btn:hover {
      background-color: var(--primary-hover);
      border-color: var(--primary-hover);
    }

    .send-btn:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      background-color: var(--text-tertiary);
      border-color: var(--text-tertiary);
    }

    .send-btn:disabled:hover {
      background-color: var(--text-tertiary);
      border-color: var(--text-tertiary);
    }

    .send-btn:active {
      transform: none;
    }
  }

  /* ==================== Right Preview Panel ==================== */
  .preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-secondary);

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background-color: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
    }

    .preview-title-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .preview-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .preview-subtitle {
      font-size: .9em;
      color: var(--text-secondary);
    }

    .preview-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .preview-content {
      flex: 1;
      overflow: auto;
      padding: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      color: var(--text-tertiary);
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 1.2em;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--text-secondary);
    }

    .empty-hint {
      font-size: 1em;
    }

    /* Document Container */
    .document-container {
      width: 100%;
      max-width: 900px;
      background-color: var(--bg-primary);
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
      padding: 60px 80px;
      margin: 0 auto;
      animation: fadeIn 0.5s ease-out;
    }

    .document-title {
      font-size: 2em;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
      text-align: center;
    }

    .document-meta {
      text-align: center;
      color: var(--text-secondary);
      font-size: 1em;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid var(--border-color);
    }

    .document-body {
      font-size: 1.1em;
      line-height: 1.8;
      color: var(--text-primary);
    }

    .document-body h2 {
      font-size: 2em;
      font-weight: 600;
      margin: 32px 0 16px 0;
      color: var(--text-primary);
    }

    .document-body h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 24px 0 12px 0;
      color: var(--text-primary);
    }

    .document-body p {
      margin-bottom: 16px;
    }

    .document-body ul,
    .document-body ol {
      margin: 16px 0;
      padding-left: 32px;
    }

    .document-body li {
      margin-bottom: 8px;
    }

    .document-body strong {
      font-weight: 600;
      color: var(--primary-color);
    }
  }

  /* ==================== Animations ==================== */
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

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* ==================== Responsive Design ==================== */
  @media (max-width: 1024px) {
    .chat-panel {
      width: 50%;
      min-width: 350px;
    }

    .document-container {
      padding: 40px 50px;
    }
  }

  @media (max-width: 768px) {
    .app-container {
      flex-direction: column;
    }

    .chat-panel {
      width: 100%;
      min-width: auto;
      max-width: none;
      height: 50vh;
      border-right: none;
      border-bottom: 1px solid var(--border-color);
    }

    .preview-panel {
      height: 50vh;
    }

    .document-container {
      padding: 32px 24px;
    }

    .message-content {
      max-width: 85%;
    }

    .toast-container {
      right: 16px;
      left: 16px;
    }

    .toast {
      min-width: auto;
    }
  }

  @media (max-width: 480px) {
    .chat-header {
      padding: 16px;
    }

    .app-title {
      font-size: 1.2em;
    }

    .chat-messages {
      padding: 16px;
    }

    .chat-input-container {
      padding: 12px 16px 16px;
    }

    .document-container {
      padding: 24px 16px;
    }

    .document-title {
      font-size: 24px;
    }

    .document-body {
      font-size: 15px;
    }
  }

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
}
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



<style lang="scss">
  /* Collapsible Code Block */
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
    }

    .action-code-header:hover {
      background: var(--bg-primary);
    }

    .action-code-header i.fa-play-circle {
      color: var(--success-color);
      font-size: 1em;
    }

    .action-code-header span {
      flex: 1;
      font-size: 1em;
      font-weight: 500;
      color: var(--text-primary);
    }

    .action-code-header .collapse-icon {
      font-size: .9em;
      color: var(--text-tertiary);
      transition: transform var(--transition-speed);
    }

    .action-code-content {
      margin-top: 8px;
      background: #fff;
      border-radius: 4px;
      overflow: hidden;
      height: 300px;
      overflow-y: auto;
      border: 1px solid var(--border-color);
    }

    .action-code-content pre {
      margin: 0;
      padding: 12px;
      font-family: Consolas, Monaco, "Courier New", monospace;
      font-size: .9em;
      line-height: 1.6;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .action-code-content code {
      font-family: inherit;
    }

    /* JavaScript Syntax Highlighting */
    .action-code-content .keyword {
      color: #569cd6;
      font-weight: 500;
    }

    .action-code-content .string {
      color: #ce9178;
    }

    .action-code-content .comment {
      color: #6a9955;
      font-style: italic;
    }

    .action-code-content .function {
      color: #dcdcaa;
    }

    .action-code-content .number {
      color: #b5cea8;
    }

    .action-code-content .property {
      color: #9cdcfe;
    }

    .action-code-content .operator {
      color: #d4d4d4;
    }

    .action-code-content .punctuation {
      color: #d4d4d4;
    }
  }
</style>
