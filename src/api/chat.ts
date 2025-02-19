import { ChatMessage } from "@/models/chat";
import { invoke } from "@tauri-apps/api/core";
import { Event, listen, UnlistenFn } from "@tauri-apps/api/event";
import { Dispatch, SetStateAction } from "react";

interface Payload {
  role: string;
  content: string;
}

export const handleBackendChat = async (
  messages: ChatMessage[],
  setResponseCallback?:
    | Dispatch<SetStateAction<string>>
    | ((value: string) => void),
  appendResponseCallback?:
    | Dispatch<SetStateAction<string>>
    | ((value: string) => void),
  toastCallback?: (props: any) => {},
  model?: string
) => {
  if (setResponseCallback) {
    setResponseCallback("");
  }
  // 監聽事件
  const unlisten: UnlistenFn = await listen(
    "ollama_chat_stream_event",
    (event: Event<Payload>) => {
      if (appendResponseCallback) {
        appendResponseCallback(event.payload.content);
      }
    }
  );

  // 呼叫 Rust API
  const response = await invoke("handle_ollama_chat", {
    messages: messages.map((mes) => ({
      role: mes.role,
      content: mes.content,
    })),
    model: model ?? "deepseek-r1:32b",
  });

  // 解除監聽放在回應後
  unlisten();

  return response;
};

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
  setResponseCallback?:
    | Dispatch<SetStateAction<string>>
    | ((value: string) => void),
  appendResponseCallback?:
    | Dispatch<SetStateAction<string>>
    | ((value: string) => void),
  toastCallback?: (props: any) => {},
  abortControllerRef?: React.MutableRefObject<AbortController | null> | null,
  model?: string
): Promise<string> => {
  return new Promise<string>(async (resolve) => {
    try {
      if (setResponseCallback) {
        setResponseCallback("");
      }

      // Create new AbortController
      if (abortControllerRef) {
        abortControllerRef.current = new AbortController();
      }

      const response = await handleOllamaChat(
        messages,
        abortControllerRef?.current?.signal,
        model
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Reader not available");
      }

      let responseText = "";
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
              if (appendResponseCallback) {
                appendResponseCallback(parsedLine.message.content);
                responseText += parsedLine.message.content;
              }
            }
          } catch (e) {
            console.error("Error parsing JSON line:", e);
          }
        }
      }
      resolve(responseText);
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
      if (abortControllerRef) {
        abortControllerRef.current = null;
      }
    }
  });
};
