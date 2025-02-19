import { SYSTEM_PROMPT } from "@/constant";
import { useChatSession } from "@/hooks/use-chat-session";
import { useLocalStorage } from "@/hooks/use-storage";
import { useToast } from "@/hooks/use-toast";
import { Chat, systemMessage } from "@/models/chat";
import { ChatCollection, RootChatState } from "@/models/chat-collection";
import { parseResponse } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";

export const useChatStorage = (historyRef?: React.RefObject<any>) => {
    const { toast } = useToast();
    const [chatState, setChatState] = useLocalStorage<RootChatState>('chat-state', {
        unorganizedStories: [],
        collections: []
    });
    const [isDarkModeChat, setIsDarkModeChat] = useLocalStorage<boolean>('dark-mode-chat', false);
    const [currentModel, setCurrentModel] = useLocalStorage<string>('current-model', 'deepseek-r1:32b');

    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [currentChatUid, setCurrentChatUid] = useLocalStorage<string>('current-chat', selectedChat?.uid ?? '');
    const [currentChatCollectionId, setCurrentChatCollectionId] = useState<string | null>("unorganized");
    const [currentChatCollection, setCurrentChatCollection] = useState<ChatCollection | null>(null);

    const reTitleStreamingRef = useRef(false);

    const { chatSession, setChatSession, updateChatSession, resetChatSession,
        handleChatStory, handleRegenerate, handleChatTitle, handleChatTitleSingle,
        handleStorySuggestion, handleStorySceneSuggestion,
        handleStoryContentModifyAndExtend, handleStoryContentExtend,
    } = useChatSession([systemMessage(SYSTEM_PROMPT(isDarkModeChat))], selectedChat, historyRef);

    const toggleIsDarkModeChat = () => {
        setIsDarkModeChat(!isDarkModeChat);
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

    const updateChatState = (updateChat: Chat, update: Partial<Chat>) => {
        if (!updateChat) return;
        setChatState((prev) => {
            // Try to find chat in unorganized stories
            const unorganizedIndex = prev.unorganizedStories.findIndex(chat => chat.uid === updateChat.uid);
            if (unorganizedIndex !== -1) {
                const updatedUnorganized = [...prev.unorganizedStories];
                updatedUnorganized[unorganizedIndex] = { ...updateChat, ...update };
                return { ...prev, unorganizedStories: updatedUnorganized };
            }

            // Try to find chat in collections
            const collectionIndex = prev.collections.findIndex(col =>
                col.chats.some(chat => chat.uid === updateChat.uid)
            );

            if (collectionIndex === -1) {
                // Chat not found anywhere, add to unorganized
                return {
                    ...prev,
                    unorganizedStories: [...prev.unorganizedStories, { ...updateChat, ...update }]
                };
            }

            // Update chat in collection
            const updatedCollections = [...prev.collections];
            const chatIndex = updatedCollections[collectionIndex].chats
                .findIndex(chat => chat.uid === updateChat.uid);

            if (chatIndex !== -1) {
                updatedCollections[collectionIndex] = {
                    ...updatedCollections[collectionIndex],
                    chats: [...updatedCollections[collectionIndex].chats]
                };
                updatedCollections[collectionIndex].chats[chatIndex] = { ...updateChat, ...update };
            } else {
                updatedCollections[collectionIndex] = {
                    ...updatedCollections[collectionIndex],
                    chats: [...updatedCollections[collectionIndex].chats, { ...updateChat, ...update }]
                };
            }

            return { ...prev, collections: updatedCollections };
        });
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

    const findChat = useCallback((chatUid: string) => {
        // Check unorganized stories first
        const foundUnorganizedChat = chatState.unorganizedStories.find(
            (chat) => chat.uid === chatUid
        );
        if (foundUnorganizedChat) {
            return {
                chat: foundUnorganizedChat,
                collection: { id: "unorganized", name: "unorganized", chats: [] },
                collectionId: "unorganized"
            };
        }

        // Check collections
        const foundCollection = chatState.collections.find((collection) =>
            collection.chats.some((chat) => chat.uid === chatUid)
        );
        if (foundCollection) {
            const chat = foundCollection.chats.find((chat) => chat.uid === chatUid)!;
            return {
                chat,
                collection: foundCollection,
                collectionId: foundCollection.id
            };
        }

        return {
            chat: null,
            collection: null,
            collectionId: "unorganized"
        };
    }, [chatState]);

    useEffect(() => {
        if (currentChatUid) {
            const { chat, collection, collectionId } = findChat(currentChatUid);
            setSelectedChat(chat);
            setCurrentChatCollection(collection);
            setCurrentChatCollectionId(collectionId);
        } else {
            setSelectedChat(null);
            setCurrentChatCollection(null);
            setCurrentChatCollectionId("unorganized");
        }
    }, [currentChatUid]);


    useEffect(() => {
        if (!selectedChat || chatSession.uid === selectedChat.uid) return;

        const handleChatWithoutTitle = async () => {
            if (!selectedChat.messages || reTitleStreamingRef.current || chatSession.isStreaming || chatSession.isTitleStreaming) return;

            console.debug('Selected chat without title, trying to re-title');
            reTitleStreamingRef.current = true;

            const titleResponse = await handleChatTitleSingle(selectedChat.messages, () => { }, () => { });
            const parsed = parseResponse(titleResponse, ["title"]);

            if (parsed?.title) {
                const lastAssistantMessage = selectedChat.messages?.filter(mes => mes.role === 'assistant').at(-1)?.content ?? '';
                const parsedResponse = parseResponse(lastAssistantMessage, ['think']);

                if (parsedResponse.response) {
                    updateChatState(selectedChat, { title: parsed.title });
                    reTitleStreamingRef.current = false;
                }
            }
        };

        const updateChatSessionWithSelectedChat = () => {
            const lastAssistantMessage = selectedChat.messages?.filter(mes => mes.role === 'assistant').at(-1)?.content ?? '';
            const parsedResponse = parseResponse(lastAssistantMessage, ['think']);

            if (parsedResponse.response) {
                setChatSession(prev => ({
                    ...prev,
                    uid: selectedChat.uid,
                    title: selectedChat.title ?? '',
                    messages: selectedChat.messages ?? [],
                    think: parsedResponse.think,
                    responseResult: parsedResponse.response,
                    titleResponse: prev.titleResponse || `<title>${selectedChat.title}</title>`,
                    currentResponse: prev.currentResponse || `<think>${parsedResponse.think}</think>${parsedResponse.response}`
                }));
            }
        };

        if (!selectedChat.title && selectedChat.messages && selectedChat.messages.at(-1)?.role === 'assistant') {
            handleChatWithoutTitle();
            return;
        }
        if (chatSession.isStreaming || (chatSession.isTitleStreaming)) return;

        updateChatState(selectedChat, {});
        updateChatSessionWithSelectedChat();
    }, [selectedChat]);

    return {
        chatSession,
        resetCurrentChatSession, updateChatSession,
        handleChatStory, handleRegenerate, handleChatTitle,
        handleStorySuggestion, handleStorySceneSuggestion,
        handleStoryContentModifyAndExtend,
        handleStoryContentExtend,
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