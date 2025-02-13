import { ChatMessage } from "@/models/chat";
import { Dispatch, SetStateAction } from "react";

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

export const handleChat = async (
  messages: ChatMessage[],
  errorDescription: string,
  streamingCallback?: Dispatch<SetStateAction<boolean>>,
  responseCallback?: Dispatch<SetStateAction<string>>,
  toastCallback?: (props: any) => {},
  abortControllerRef?: React.MutableRefObject<AbortController | null>
) => {
  try {
    if (streamingCallback) {
      streamingCallback(true);
    }
    if (responseCallback) {
      responseCallback("");
    }

    // Create new AbortController
    if (abortControllerRef) {
      abortControllerRef.current = new AbortController();
    }

    const response = await handleOllamaChat(
      messages,
      abortControllerRef?.current?.signal
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Reader not available");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Convert the chunk to text
      const chunk = new TextDecoder().decode(value);

      // Parse the JSON lines
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const parsedLine = JSON.parse(line);
          if (parsedLine.message?.content) {
            if (responseCallback) {
              responseCallback((prev) => prev + parsedLine.message.content);
            }
          }
        } catch (e) {
          console.error("Error parsing JSON line:", e);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    if (toastCallback) {
      toastCallback({
        title: "錯誤",
        description: errorDescription,
        variant: "destructive",
        duration: 5000,
      });
    }
  } finally {
    if (streamingCallback) {
      streamingCallback(false);
    }
    if (abortControllerRef) {
      abortControllerRef.current = null;
    }
  }
};
