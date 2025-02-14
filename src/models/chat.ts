import { v4 } from "uuid";

export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface IChatMessage {
  uid: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export class ChatMessage implements IChatMessage {
  uid: string;
  role: ChatRole;
  content: string;
  timestamp: number;

  constructor(props: IChatMessage) {
    this.uid = props.uid;
    this.role = props.role;
    this.content = props.content;
    this.timestamp = props.timestamp;
  }
}

export interface IChat {
  uid: string;
  title?: string;
  messages?: ChatMessage[];
  createTimestamp?: number;
}

export class Chat {
  uid: string;
  title?: string;
  messages?: ChatMessage[];
  createTimestamp?: number;

  constructor(props: IChat) {
    this.uid = props.uid;
    this.title = props.title ?? "";
    this.messages = props.messages ?? [];
    this.createTimestamp = props.createTimestamp ?? Date.now();
  }
}

export const handleChatMessage = (role: ChatRole, content: string) => {
  return new ChatMessage({
    uid: v4(),
    role: role,
    content: content,
    timestamp: Date.now(),
  });
};

export const systemMessage = (content: string) => {
  return handleChatMessage("system", `${content.trim()}`); // 將系統訊息包裹在 <system> 標籤中
};

export const userMessage = (content: string) => {
  return handleChatMessage("user", `${content.trim()}`); // 將使用者輸入的內容包裹在 <query> 標籤中
};

export const assistantMessage = (content: string) => {
  return handleChatMessage("assistant", `${content.trim()}`); // 將助理回應的內容包裹在 <response> 標籤中
};

export const toolMessage = (content: string) => {
  return handleChatMessage("tool", content.trim());
};
