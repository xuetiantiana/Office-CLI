const API_ROOT = "http://4.246.80.15:2233"

/**
 * chatStream - 使用 fetch + SSE 进行流式对话
 *
 * @param text 用户输入的文本
 * @param handlers 回调函数：onStart / onDelta / onEnd / onError
 */
export const chatStream = async (payload, {
  onStart,
  onDelta,
  onEnd,
  onError
}) => {

  // --- 1. session_id 确保存在 ---
//   if (!seeeion_id.value) {
//     seeeion_id.value = generateId();
//   }

  // --- 2. 创建可取消控制器（支持手动取消 & 超时取消） ---
  const controller = new AbortController();

  // 可选：20秒后超时自动取消
  // setTimeout(() => controller.abort(), 20000);

  // --- 3. 前端发送给后端的 payload ---
//   const payload = {
//     messages: [{ role: "user", content: text }],
//     model: "gpt-4o-mini",
//     stream: true,      // 🚀 必须为 true 才能流式返回
//     max_tokens: 2048,
//     temperature: 0.7,
//     metadata: { session_id: seeeion_id },
//   };

  try {
    // --- 4. 发送 fetch 请求 ---
    const res = await fetch(API_ROOT+"/chat", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json", // POST body 是 JSON
        Accept: "text/event-stream",        // 请求 SSE 流式返回
      },
      body: JSON.stringify(payload),
    });

    console.log("连接成功:", res);

    // --- 5. 处理非 200 错误 ---
    if (!res.ok) {
      const text = await res.text();
      try {
        const err = JSON.parse(text).error;
        console.error("❌ API Error:", err.code, err.message);
        onError?.(err);
      } catch {
        console.error("❌ Unknown Error:", text);
        onError?.(text);
      }
      return;
    }

    // --- 6. 调用开始回调 ---
    // onStart?.();

    // --- 7. 开始读取 SSE 流数据 ---
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";     // 保存碎片 chunk
    let finalText = "";  // 最终完整回答

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
        
      const chunk = decoder.decode(value, { stream: true });
 
        // SSE data 格式：  data: {"type":"delta","delta":"xxx"}
        chunk.split("\n").forEach((line) => {
            if (line.startsWith("data: ")) {
                const payload = JSON.parse(line.substring(6));
                if (payload.type === "delta") {
                    onDelta(payload.delta);
                }else if(payload.type === "end"){
                    onEnd()
                }
            }
        })
    }

  } catch (err) {
    // --- 10. 异常处理 ---
    if (err.name === "AbortError") {
      console.warn("⚠️ Request aborted");
    } else {
      console.error("❌ Network Error:", err);
    }
    onError?.(err);
  }
};



export const refreshPDF = (sessionId) =>{
    return `${API_ROOT}/export_pdf/${sessionId}?t=` + Date.now();
}


export const checkPdf = async(url) => {
  try {
    const res = await fetch(url, {
      method: "GET",
    });

    if (!res.ok) return false;

    // 判断 Content-Type
    const type = res.headers.get("content-type") || "";
    return type.includes("pdf");
  } catch (e) {
    return false;
  }
}