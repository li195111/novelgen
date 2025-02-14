import { Chat } from "@/models/chat";

export interface ChatCollection {
  id: string;
  name: string;
  chats: Chat[];
}

export interface RootChatState {
  unorganizedStories: Chat[];
  collections: ChatCollection[];
}
