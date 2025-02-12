export interface ChatMessage {
  uid: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: number;
}
