import { useLocalStorage } from "@/hooks/use-storage";
import { RootChatState } from "@/models/chat-collection";

export const useChatStorage = () => {
    return useLocalStorage<RootChatState>('chat-state', {
        unorganizedStories: [],
        collections: []
    });
};