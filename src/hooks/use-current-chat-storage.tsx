import { SYSTEM_PROMPT } from "@/constant";
import { useChatSession } from "@/hooks/use-chat-session";
import { useChatStorage } from "@/hooks/use-chat-storage";
import { Chat, systemMessage } from "@/models/chat";
import { ChatCollection } from "@/models/chat-collection";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

export const useCurrentChatStorage = (historyRef?: React.RefObject<any>) => {
    const [chatState, setChatState] = useChatStorage();
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [currentChatCollectionId, setCurrentChatCollectionId] = useState<string | null>("unorganized");
    const { chatSession, updateChatSession, resetChatSession,
        handleChatStory, handleRegenerate, handleChatTitle, handleStorySuggestion,
        currentChatUid, setCurrentChatUid
    } = useChatSession([systemMessage(SYSTEM_PROMPT)], historyRef);

    const resetCurrentChatSession = () => {
        resetChatSession();
        setSelectedChat(null);
        setCurrentChatCollectionId("unorganized");
        setCurrentChatUid("");
    }

    useEffect(() => {
        if (chatSession.title && !chatSession.isTitleStreaming) {
            setSelectedChat((prev) => prev ? { ...prev, title: chatSession.title } : new Chat({ uid: v4(), messages: chatSession.messages, title: chatSession.title }));
        }
    }, [chatSession.title, chatSession.isTitleStreaming]);

    useEffect(() => {
        if (chatSession.messages.some(mes => mes.role === 'user')) {
            setSelectedChat((prev) => prev ? { ...prev, messages: chatSession.messages } : new Chat({ uid: v4(), messages: chatSession.messages, title: chatSession.title }));
        }
    }, [chatSession.messages, chatSession.title]);

    useEffect(() => {
        const unorganizedChat = chatState.unorganizedStories.find(chat => chat.uid === currentChatUid);
        const foundCollection = chatState.collections.find(col => col.chats.some(chat => chat.uid === currentChatUid));
        const foundChat = foundCollection?.chats.find(chat => chat.uid === currentChatUid) || unorganizedChat;
        if (foundChat && (selectedChat?.uid !== foundChat.uid)) {
            setSelectedChat(foundChat);
            setCurrentChatCollectionId(foundCollection?.id ?? "unorganized");
            updateChatSession({
                title: foundChat.title ?? '',
                messages: foundChat.messages ?? [systemMessage(SYSTEM_PROMPT)]
            });
        }
    }, [currentChatCollectionId, chatState, selectedChat]);

    useEffect(() => {
        if (!selectedChat) return;
        let chatCollection: ChatCollection = { id: "", name: "unorganized", chats: [] };
        let chatCollectionChats = chatState.unorganizedStories;
        if (currentChatCollectionId !== "unorganized") {
            const collection = chatState.collections.find((col) => col.id === currentChatCollectionId);
            if (collection) {
                chatCollection = collection;
                chatCollectionChats = collection.chats;
            }
        }
        const otherCollections = chatState.collections.filter((col) => col.id !== currentChatCollectionId) || [];
        const otherChats = chatCollectionChats.filter(chat => chat.uid !== selectedChat?.uid);
        const updatedChats = [...otherChats, selectedChat];
        const updatedChatState = currentChatCollectionId === "unorganized"
            ? { ...chatState, unorganizedStories: updatedChats }
            : { ...chatState, collections: [...otherCollections, { ...chatCollection, chats: updatedChats }] };

        setChatState(updatedChatState);
    }, [selectedChat, currentChatCollectionId]);

    return {
        chatSession,
        resetCurrentChatSession, updateChatSession,
        handleChatStory, handleRegenerate, handleChatTitle, handleStorySuggestion,
        chatState, setChatState,
        currentChatUid, setCurrentChatUid,
        selectedChat, setSelectedChat,
        currentChatCollectionId, setCurrentChatCollectionId,
    }
}