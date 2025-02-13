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

export const handleChatMessage = (role: ChatRole, content: string) => {
  return new ChatMessage({
    uid: v4(),
    role: role,
    content: content,
    timestamp: Date.now(),
  });
};

export const systemMessage = (content: string) => {
  return handleChatMessage("system", content);
};

export const userMessage = (content: string) => {
  return handleChatMessage("user", content);
};

export const assistantMessage = (content: string) => {
  return handleChatMessage("assistant", content);
};

export const toolMessage = (content: string) => {
  return handleChatMessage("tool", content);
};
