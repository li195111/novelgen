import { ChatMessage } from "@/models/chat";

export const handleOllamaChat = async (
  messages: ChatMessage[],
  signal?: AbortSignal,
  model?: string
) => {
  return await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model ?? "deepseek-r1:32b",
      messages: messages.map((mes) => ({
        role: mes.role,
        content: mes.content,
      })),
    }),
    signal: signal,
  });
};
