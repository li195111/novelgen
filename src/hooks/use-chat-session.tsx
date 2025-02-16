import { handleChat } from "@/api/chat";
import { StoryChatSchema } from "@/components/story-chat-form";
import { SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "@/constant";
import { useToast } from "@/hooks/use-toast";
import { assistantMessage, ChatMessage, systemMessage, userMessage } from "@/models/chat";
import { parseResponse } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

export interface ChatSessionState {
    messages: ChatMessage[];
    currentResponse: string;
    isStreaming: boolean;
    thinking: string;
    isThinking: boolean;
    title: string;
    titleResponse: string;
    isTitleStreaming: boolean;
    responseResult: string;
}

export const useChatSession = (initialMessages: ChatMessage[], historyRef?: React.RefObject<any>) => {
    const { toast } = useToast();
    const abortControllerRef = useRef<AbortController | null>(null);
    const [chatSession, setChatSession] = useState<ChatSessionState>({
        messages: initialMessages,
        currentResponse: '',
        isStreaming: false,
        thinking: '',
        isThinking: false,
        title: '',
        titleResponse: '',
        isTitleStreaming: false,
        responseResult: '',
    });

    const resetChatSession = () => {
        setChatSession({
            messages: initialMessages,
            currentResponse: '',
            isStreaming: false,
            thinking: '',
            isThinking: false,
            title: '',
            titleResponse: '',
            isTitleStreaming: false,
            responseResult: '',
        })
    }

    const updateChatSession = (updates: Partial<ChatSessionState>) => {
        setChatSession((prev) => ({ ...prev, ...updates }));
    };

    const updateCurrentResponse = (text: string) => {
        setChatSession((prev) => ({ ...prev, currentResponse: text }));
    }

    const appendCurrentResponse = (text: string) => {
        setChatSession((prev) => ({
            ...prev,
            currentResponse: prev.currentResponse + text,
        }));
    };

    const updateTitleResponse = (text: string) => {
        setChatSession((prev) => ({ ...prev, titleResponse: text }));
    }

    const appendTitleResponse = (text: string) => {
        setChatSession((prev) => ({
            ...prev,
            titleResponse: prev.titleResponse + text,
        }));
    }

    const handleChatStory = async (values: z.infer<typeof StoryChatSchema>) => {
        const userChatMessage = userMessage(values.chatMessage);
        const newMessages = [...chatSession.messages, userChatMessage];
        updateChatSession({ messages: newMessages });
        handleChat(newMessages, "與 AI 對話時發生錯誤",
            (isStreaming: boolean) => updateChatSession({ isStreaming }),
            updateCurrentResponse,
            appendCurrentResponse,
            toast,
            abortControllerRef
        );
    }

    const handleRegenerate = async (messageUid?: string) => {
        if (chatSession.messages.length < 2) return;
        let toUid = -1;
        if (messageUid) {
            toUid = chatSession.messages.findIndex(mes => mes.uid === messageUid);
        }
        const newMessages = chatSession.messages.slice(0, toUid);
        updateChatSession({ messages: newMessages });
        handleChat(newMessages, "重新產生對話時發生錯誤",
            (isStreaming: boolean) => updateChatSession({ isStreaming }),
            updateCurrentResponse,
            appendCurrentResponse,
            toast,
            abortControllerRef
        );
    };

    const handleChatTitle = async () => {
        const conversationContent = `<query>${JSON.stringify(chatSession.messages.filter(mes => mes.role === 'user').map(mes => mes.content))}</query>`;
        const genChatTitleMessages = [
            systemMessage(SYSTEM_PROMPT + TITLE_GENERATOR_SYSTEM_PROMPT),
            userMessage(conversationContent),
        ]
        handleChat(genChatTitleMessages, "讓 AI 產生對話Title時發生錯誤",
            (isTitleStreaming: boolean) => updateChatSession({ isTitleStreaming }),
            updateTitleResponse,
            appendTitleResponse,
            toast
        );
    }

    const scrollToBottom = useCallback(() => {
        if (historyRef?.current) {
            historyRef.current.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();

        if (!chatSession.currentResponse) return;

        const parsed = parseResponse(chatSession.currentResponse);
        if (parsed) {
            updateChatSession({
                thinking: parsed.thinking,
                responseResult: parsed.response,
                isThinking: parsed.isThinking
            });
        }

        if (!chatSession.isStreaming && chatSession.messages.at(-1)?.role === 'user') {
            // AI 回應完畢, 儲存 AI 的完整回應
            const newAssistantMessage = assistantMessage(chatSession.currentResponse);
            const newMessages = [...chatSession.messages, newAssistantMessage];
            updateChatSession({ messages: newMessages });

            // 給予對話標題
            if (!chatSession.title && !chatSession.isTitleStreaming) {
                handleChatTitle()
            }
        }
    }, [chatSession.messages, chatSession.currentResponse, chatSession.isStreaming, chatSession.isTitleStreaming, chatSession.title]);

    useEffect(() => {
        if (!chatSession.titleResponse) return;
        const parsed = parseResponse(chatSession.titleResponse);
        if (parsed) {
            updateChatSession({ title: parsed.title });
        }
    }, [chatSession.titleResponse]);

    return {
        chatSession,
        resetChatSession,
        handleChatStory,
        handleRegenerate,
        handleChatTitle,
        updateChatSession,
    };
};