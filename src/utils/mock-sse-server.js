import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json()); // 解析 POST JSON body

app.post("/api/chat/stream", (req, res) => {
  console.log("收到 payload:", req.body);

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const messageId = "mock-123";
  const model = "mock-model";

  // 1️⃣ message_start
  res.write(`data: ${JSON.stringify({ type: "message_start", id: messageId, model })}\n\n`);

  // 2️⃣ message_chunk
  const chunks = ["Hel", "lo"];
  let i = 0;
  const timer = setInterval(() => {
    if (i < chunks.length) {
      res.write(
        `data: ${JSON.stringify({ type: "message_chunk", id: messageId, delta: { text: chunks[i] } })}\n\n`
      );
      i++;
    } else {
      clearInterval(timer);

      // 3️⃣ message_end
      res.write(
        `data: ${JSON.stringify({ type: "message_end", usage: { prompt_tokens: 12, completion_tokens: 30 } })}\n\n`
      );

      res.end();
    }
  }, 2000); // 每 500ms 输出一个 chunk
});

app.listen(3001, () => console.log("SSE Mock Server running at http://localhost:3001"));
