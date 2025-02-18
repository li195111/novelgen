import { SYSTEM_PROMPT } from "@/constant";
import { useChatSession } from "@/hooks/use-chat-session";
import { useChatStorage } from "@/hooks/use-chat-storage";
import { useLocalStorage } from "@/hooks/use-storage";
import { useToast } from "@/hooks/use-toast";
import { Chat, systemMessage } from "@/models/chat";
import { ChatCollection } from "@/models/chat-collection";
import { parseResponse } from "@/utils";
import { SetStateAction, useEffect, useState } from "react";
import { v4 } from "uuid";

export const useCurrentChatStorage = (historyRef?: React.RefObject<any>) => {
    const { toast } = useToast();
    const [chatState, setChatState] = useChatStorage();
    const [isDarkModeChat, setIsDarkModeChat] = useLocalStorage<boolean>('dark-mode-chat', false);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [currentChatCollectionId, setCurrentChatCollectionId] = useState<string | null>("unorganized");
    const [currentChatCollection, setCurrentChatCollection] = useState<ChatCollection | null>(null);

    const { chatSession, setChatSession, updateChatSession, resetChatSession,
        handleChatStory, handleRegenerate, handleChatTitle,
        handleStorySuggestion, handleStorySceneSuggestion,
        currentChatUid, setCurrentChatUid,
        updateChatSessionDarkMode,
        currentModel, setCurrentModel,
    } = useChatSession([systemMessage(SYSTEM_PROMPT(isDarkModeChat))], selectedChat, historyRef);

    const toggleIsDarkModeChat = () => {
        setIsDarkModeChat(!isDarkModeChat);
        updateChatSessionDarkMode(!isDarkModeChat);
    }

    const resetCurrentChatSession = () => {
        resetChatSession();
        setSelectedChat(null);
        setCurrentChatCollectionId("unorganized");
        setCurrentChatUid("");
    }

    const updateSelectedChat = async (update: Partial<Chat>) => {
        const selectChat: Chat = await new Promise((resolve) => {
            setSelectedChat((prev) => {
                resolve(prev ? { ...prev, ...update } : new Chat({ uid: v4(), messages: chatSession.messages, title: chatSession.title }))
                return prev;
            });
        })
        setSelectedChat(selectChat);
        setCurrentChatUid(selectChat.uid);
    }

    const handleDeleteCurrentChatCollection = () => {
        setChatState(prev => {
            const collection = prev.collections.find(c => c.id === currentChatCollection?.id);
            if (!collection) return prev;

            return {
                ...prev,
                unorganizedStories: [...prev.unorganizedStories, ...collection.chats],
                collections: prev.collections.filter(c => c.id !== currentChatCollection?.id)
            };
        });
        toast({
            title: `已刪除故事集 ${currentChatCollection?.name}`,
            duration: 2000,
        })
        setCurrentChatUid("");
    }

    const handleDeleteSelectedChat = () => {
        if (!selectedChat) return;
        setChatState((prev) => {
            let chat = null;
            let otherChats: Chat[] = [];
            let collectionId = "unorganized";
            let chatCollection: ChatCollection = { id: "", name: "unorganized", chats: [] };
            let otherCollections: ChatCollection[] = [];
            const foundUnorganizedChat = prev.unorganizedStories.find((story) => story.uid === selectedChat.uid);
            if (!foundUnorganizedChat) {
                const foundCollection = chatState.collections.find((collection) =>
                    collection.chats.some((chat) => chat.uid === selectedChat.uid)
                );
                if (foundCollection) {
                    chatCollection = foundCollection;
                    collectionId = foundCollection.id;
                    otherCollections = prev.collections.filter((col) => col.id !== collectionId) || [];
                    chat = foundCollection.chats.find((chat) => chat.uid === selectedChat.uid)!;
                    otherChats = foundCollection.chats.filter((chat) => chat.uid !== selectedChat.uid);
                }
            }
            else {
                chat = foundUnorganizedChat;
                otherChats = prev.unorganizedStories.filter((chat) => chat.uid !== selectedChat.uid);
            }
            if (chat) {
                if (collectionId === "unorganized") {
                    return { ...prev, unorganizedStories: [...otherChats] };
                }
                else {
                    return { ...prev, collections: [...otherCollections, { ...chatCollection, chats: [...otherChats] }] };
                }
            }
            return prev;
        })
        toast({
            title: `已刪除故事 ${selectedChat.title}`,
            duration: 2000,
        })
        setCurrentChatUid("");
    }

    useEffect(() => {
        if (chatSession.title && !chatSession.isTitleStreaming) {
            updateSelectedChat({ title: chatSession.title });
        }
    }, [chatSession.title, chatSession.isTitleStreaming]);

    useEffect(() => {
        if (chatSession.messages.some(mes => mes.role === 'user')) {
            updateSelectedChat({ messages: chatSession.messages });
        }
    }, [chatSession.messages, chatSession.title]);

    useEffect(() => {
        let chat: SetStateAction<Chat | null> = null;
        let collectionId = "unorganized";
        let chatCollection: ChatCollection | null = null;
        if (currentChatUid) {
            chatCollection = { id: "", name: "unorganized", chats: [] };
            const foundUnorganizedChat = chatState.unorganizedStories.find((chat) => chat.uid === currentChatUid);
            if (!foundUnorganizedChat) {
                const foundCollection = chatState.collections.find((collection) =>
                    collection.chats.some((chat) => chat.uid === currentChatUid)
                );
                if (foundCollection) {
                    chatCollection = foundCollection;
                    collectionId = foundCollection.id;
                    chat = foundCollection.chats.find((chat) => chat.uid === currentChatUid)!;
                }
            }
            else {
                chat = foundUnorganizedChat;
            }

            if (chat) {
                setSelectedChat(chat);
                setCurrentChatCollectionId(collectionId);
                setCurrentChatCollection(chatCollection);
            }
        }
        else {
            setSelectedChat(chat);
            setCurrentChatCollectionId(collectionId);
            setCurrentChatCollection(chatCollection);
        }
    }, [currentChatUid, chatState]);


    useEffect(() => {
        if (!selectedChat) return;
        if (chatSession.uid === selectedChat.uid) return;

        setChatState((prev) => {
            const unorganizedChat = prev.unorganizedStories.find(chat => chat.uid === selectedChat.uid);
            const foundCollection = prev.collections.find(col => col.chats.some(chat => chat.uid === selectedChat.uid));
            if (unorganizedChat || !foundCollection) {
                // If the chat is in unorganized or not found in any collection
                if (unorganizedChat) {
                    // If the chat is found in unorganized, update the chat
                    return { ...prev, unorganizedStories: prev.unorganizedStories.map((chat) => chat.uid === selectedChat.uid ? selectedChat : chat) };
                }
                // If the chat is not found in unorganized, add it to unorganized
                return { ...prev, unorganizedStories: [...prev.unorganizedStories, selectedChat] };
            }
            if (!foundCollection) return prev;
            const foundCollectionId = foundCollection.id;
            const otherCollections = prev.collections.filter((col) => col.id !== foundCollectionId) || [];
            const foundChat = foundCollection.chats.find(chat => chat.uid === selectedChat.uid);
            // If the chat is found in a collection, update the chat
            if (foundChat) {
                const updatedChats = foundCollection.chats.map(chat => chat.uid === selectedChat.uid ? selectedChat : chat);
                return { ...prev, collections: [...otherCollections, { ...foundCollection, chats: updatedChats }] };
            }
            // If the chat is not found in a collection, add it to the collection
            const updatedChats = [...foundCollection.chats, selectedChat];
            const updatedChatState = { ...prev, collections: [...otherCollections, { ...foundCollection, chats: updatedChats }] };
            return updatedChatState;
        });

        const lastAssistantMessage = selectedChat.messages?.filter(mes => mes.role === 'assistant').at(-1)?.content ?? '';
        const parsedResponse = parseResponse(lastAssistantMessage, ['think']);
        if (parsedResponse.response && selectedChat.title) {
            setChatSession((prev) => {
                let update = {
                    ...prev,
                    uid: selectedChat.uid,
                    title: selectedChat.title ?? '',
                    messages: selectedChat.messages ?? [],
                    think: parsedResponse.think,
                    responseResult: parsedResponse.response,
                }
                if (!prev.titleResponse) {
                    update = {
                        ...update,
                        titleResponse: `<title>${selectedChat.title}</title>`
                    }
                }
                if (!prev.currentResponse) {
                    update = {
                        ...update,
                        currentResponse: `<think>${parsedResponse.think}</think>${parsedResponse.response}`
                    }
                }
                return update;
            })
        }
    }, [selectedChat]);

    return {
        chatSession,
        resetCurrentChatSession, updateChatSession,
        handleChatStory, handleRegenerate, handleChatTitle,
        handleStorySuggestion, handleStorySceneSuggestion,
        chatState, setChatState,
        currentChatUid, setCurrentChatUid,
        currentChatCollection, setCurrentChatCollection,
        selectedChat, setSelectedChat,
        currentChatCollectionId, setCurrentChatCollectionId,
        isDarkModeChat, toggleIsDarkModeChat,
        handleDeleteCurrentChatCollection,
        handleDeleteSelectedChat,
        currentModel, setCurrentModel,
    }
}