import { StoryChatSchema } from '@/components/story-chat-form';
import { ChatSessionState } from '@/hooks/use-chat-session';
import { useChatStorage } from '@/hooks/use-chat-storage';
import { Chat } from '@/models/chat';
import { ChatCollection, RootChatState } from '@/models/chat-collection';
import { createContext, ReactNode, useContext, useRef } from 'react';
import { z } from 'zod';

interface ChatContextType {
    // State
    chatSession: ChatSessionState;
    chatState: RootChatState;
    currentChatCollection: ChatCollection | null;
    selectedChat: Chat | null;
    currentChatCollectionId: string | null;
    isDarkModeChat: boolean;
    currentModel: string;

    // Actions
    resetCurrentChatSession: () => void;
    updateChatSession: (update: any) => void; // 替換為實際的 update 類型
    handleChatStory: (values: z.infer<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => Promise<void>;
    handleRegenerate: (messageUid?: string, model?: string) => Promise<void>;
    handleChatTitle: (model?: string) => Promise<void>;
    handleStorySuggestion: (values: z.infer<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => Promise<void>;
    handleStorySceneSuggestion: (values: z.infer<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => Promise<void>;
    handleStoryContentModifyAndExtend: (values: z.infer<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => Promise<void>;
    handleStoryContentExtend: (values: z.infer<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => Promise<void>;
    setChatState: (state: RootChatState | ((prev: RootChatState) => RootChatState)) => void;
    setCurrentChatCollection: (collection: ChatCollection | null) => void;
    handleSelectedChat: (chat: Chat | null, update?: Partial<Chat>, nullUpdate?: Chat) => void;
    setCurrentChatCollectionId: (id: string | null) => void;
    toggleIsDarkModeChat: () => void;
    handleDeleteCurrentChatCollection: () => void;
    handleDeleteSelectedChat: () => void;
    setCurrentModel: (model: string) => void;

    historyRef: React.RefObject<HTMLDivElement>;
    handleAbortControllerRef: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const historyRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const chatStorage = useChatStorage(historyRef, abortControllerRef);

    const handleAbortControllerRef = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }

    return (
        <ChatContext.Provider value={{ ...chatStorage, historyRef, handleAbortControllerRef }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
}
