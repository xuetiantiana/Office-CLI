

export const ensureHttps = (url) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
};



export const getCurrentDateTime = () => {
  var now = new Date();
  var year = now.getFullYear(); // 获取完整的年份
  var month = now.getMonth() + 1; // 获取当前月份，需要加1因为月份是从0开始的
  var day = now.getDate(); // 获取当前日
  var hours = now.getHours(); // 获取当前小时数
  var minutes = now.getMinutes(); // 获取当前分钟数
  var seconds = now.getSeconds(); // 获取当前秒数

  // 补零函数
  function addZero(i) {
    return (i < 10 ? "0" : "") + i;
  }

  // 格式化输出
  return year + "-" + addZero(month) + "-" + addZero(day) + " " +
    addZero(hours) + ":" + addZero(minutes) + ":" + addZero(seconds);
}


// Helpers
export const escapeHtml = (text) => {
  if (!text && text !== 0) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export const mapIcon = (icon) => {
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



// JavaScript Syntax Highlighting
export const highlightJavaScript = (code) => {
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



// 这里仅做演示，实际应根据 selectedQuery 加载对应 JSON
export const loadDemoConversation = async(query)=> {
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