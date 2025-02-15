import "@/App.css";
import { ChatContent } from "@/components/ChatCard/chat-content";
import { ChatCardHeader } from "@/components/ChatCard/chat-header";
import { StoryChatForm } from "@/components/story-chat-form";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { SYSTEM_PROMPT } from "@/constant";
import { useChatSession } from "@/hooks/use-chat-session";
import { useChatStorage } from "@/hooks/use-chat-storage";
import { useCurrentStoryStorage } from "@/hooks/use-current-story-storage";
import { useStoryStorage } from "@/hooks/use-story-storage";
import { assistantMessage, Chat, systemMessage } from "@/models/chat";
import { ChatCollection } from "@/models/chat-collection";
import { Story } from "@/models/story";
import { StoryCollection } from "@/models/story-collection";
import { parseResponse } from "@/utils";
import { Separator } from "@radix-ui/react-separator";
import { AnimatePresence, motion } from 'framer-motion';
import { BotMessageSquareIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";

interface ChatCardProps {
}

export const ChatCard: React.FC<ChatCardProps> = ({ }) => {
    const { chatUid } = useParams();
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [currentChatCollectionId, setCurrentChatCollectionId] = useState<string | null>("unorganized");
    const [chatState, setChatState] = useChatStorage();
    const {
        chatSession, resetChatSession, updateChatSession,
        handleChatStory, handleRegenerate, handleChatTitle
    } = useChatSession([systemMessage(SYSTEM_PROMPT)]);

    const [currentStoryUid, setCurrentStoryUid] = useCurrentStoryStorage();
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [currentStoryCollectionId, setCurrentStoryCollectionId] = useState<string | null>("unorganized");
    const [currentStoryCollection, setCurrentStoryCollection] = useState<StoryCollection | null>(null);
    const [storyState, setStoryState] = useStoryStorage();

    const historyRef = useRef<HTMLDivElement>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleNewChatSession = () => {
        resetChatSession();

        setSelectedChat(null);
        setCurrentChatCollectionId("unorganized");
    }

    const handleStopChat = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            updateChatSession({ isStreaming: false });
        }
    };

    const scrollToBottom = useCallback(() => {
        if (historyRef.current) {
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
        const unorganizedChat = chatState.unorganizedStories.find(chat => chat.uid === chatUid);
        const foundCollection = chatState.collections.find(col => col.chats.some(chat => chat.uid === chatUid));
        const foundChat = foundCollection?.chats.find(chat => chat.uid === chatUid) || unorganizedChat;
        if (foundChat && (selectedChat?.uid !== foundChat.uid)) {
            setSelectedChat(foundChat);
            setCurrentChatCollectionId(foundCollection?.id ?? "unorganized");
            updateChatSession({
                title: foundChat.title ?? '',
                messages: foundChat.messages ?? [systemMessage(SYSTEM_PROMPT)]
            });
        }
    }, [chatUid, chatState, selectedChat]);

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

    useEffect(() => {
        if (currentStoryUid) {
            let story = null;
            let collectionId = "unorganized";
            const unorganizedStory = storyState.unorganizedStories.find((story) => story.uid === currentStoryUid);
            if (unorganizedStory) {
                story = unorganizedStory;
            }

            storyState.collections.forEach((collection) => {
                const findStory = collection.stories.find((story) => story.uid === currentStoryUid);
                if (findStory) {
                    story = findStory;
                    collectionId = collection.id;
                }
            })

            if (story) {
                setSelectedStory(story);
                setCurrentStoryCollectionId(collectionId);
                let storyCollection: StoryCollection = { id: "", name: "unorganized", stories: [] };
                let storyCollectionStories = storyState.unorganizedStories;
                if (collectionId !== "unorganized") {
                    const collection = storyState.collections.find((col) => col.id === collectionId);
                    if (collection) {
                        storyCollection = collection;
                        storyCollectionStories = collection.stories;
                    }
                }
                setCurrentStoryCollection(storyCollection);
            }

        }
        else {
            setSelectedStory(null);
            setCurrentStoryCollectionId("unorganized");
            setCurrentStoryCollection(null);
        }
    }, [currentStoryUid, storyState]);

    return (
        <AnimatePresence>
            {isCollapsed ? (
                <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="fixed bottom-6 right-10 z-50"
                >
                    <Button
                        className="rounded-full w-9 h-9 bg-slate-800 hover:bg-slate-500 text-white shadow-lg"
                        onClick={toggleCollapse}
                    >
                        <BotMessageSquareIcon className="w-6 h-6" />
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="fixed bottom-4 right-8 flex justify-center p-0 m-0 w-[48rem]"
                >
                    <Card className="w-full h-full bg-slate-50 shadow-lg">
                        <ChatCardHeader chatSession={chatSession} toggleCollapse={toggleCollapse} handleNewChatSession={handleNewChatSession} currentStoryCollectionId={currentStoryCollectionId} currentStoryCollection={currentStoryCollection} selectedStory={selectedStory} />
                        <ChatContent historyRef={historyRef} chatSession={chatSession} handleRegenerate={handleRegenerate} />
                        {/* 輸入表單 */}
                        <Separator orientation="horizontal" className="border" />
                        <CardFooter className="p-2">
                            <StoryChatForm chatSession={chatSession} handleStop={handleStopChat} handleSubmit={handleChatStory} />
                        </CardFooter>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    )
}