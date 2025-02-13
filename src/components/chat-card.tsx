import { handleChat } from "@/api/chat";
import "@/App.css";
import { ChatMessageBlock, ResponseBlock } from "@/components/chat-message";
import { StoryChatForm, StoryChatSchema } from "@/components/story-chat-form";
import ThinkAccordion from "@/components/think-accordion";
import ThinkingAccordion from "@/components/thinking-accordion";
import { ThinkingDots } from "@/components/thinking-dots";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "@/constant";
import { useLocalStorage } from "@/hooks/use-storage";
import { useToast } from "@/hooks/use-toast";
import { assistantMessage, Chat, ChatMessage, systemMessage, userMessage } from "@/models/chat";
import { ChatCollection, RootChatState } from "@/models/chat-collection";
import { Story } from "@/models/story";
import { RootStoryState, StoryCollection } from "@/models/story-collection";
import { parseResponse } from "@/utils";
import { Separator } from "@radix-ui/react-separator";
import { AnimatePresence, motion } from 'framer-motion';
import { BotMessageSquareIcon, ChevronDownIcon, LucidePencilLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import { z } from "zod";

interface ChatCardProps {
}

export const ChatCard: React.FC<ChatCardProps> = ({ }) => {
    const { toast } = useToast();
    const { chatUid } = useParams();
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [currentChatCollectionId, setCurrentChatCollectionId] = useState<string | null>("unorganized");
    const [chatState, setChatState] = useLocalStorage<RootChatState>('chat-state', {
        unorganizedStories: [],
        collections: []
    });

    const [currentStoryUid, setCurrentStoryUid] = useLocalStorage<string>('current-story', '');
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [currentStoryCollectionId, setCurrentStoryCollectionId] = useState<string | null>("unorganized");
    const [currentStoryCollection, setCurrentStoryCollection] = useState<StoryCollection | null>(null);
    const [storyState, setStoryState] = useLocalStorage<RootStoryState>('story-state', {
        unorganizedStories: [],
        collections: []
    });

    const [messages, setMessages] = useState<ChatMessage[]>([systemMessage(SYSTEM_PROMPT)]);

    const [currentResponse, setCurrentResponse] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

    const [title, setTitle] = useState<string>('');
    const [titleResponse, setTitleResponse] = useState<string>('');
    const [titleStreaming, setTitleStreaming] = useState(false);

    const [thinking, setThinking] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [responseResult, setResponseResult] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleNewChatSession = () => {
        setMessages([systemMessage(SYSTEM_PROMPT)]);
        setCurrentResponse('');
        setIsStreaming(false);
        setThinking('');
        setTitle('');
        setResponseResult('');
        setIsThinking(false);

        setSelectedChat(null);
        setCurrentChatCollectionId("unorganized");
    }

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
        }
    };

    const handleChatStory = async (values: z.infer<typeof StoryChatSchema>) => {
        // 儲存使用者的訊息
        const userChatMessage = userMessage(values.chatMessage);
        const newMessages = [...messages, userChatMessage];
        setMessages(newMessages);
        handleChat(newMessages, "與 AI 對話時發生錯誤", setIsStreaming, setCurrentResponse, toast, abortControllerRef);
    }

    const handleRegenerate = async (messageUid?: string) => {
        if (messages.length < 2) return; // Need at least one user message to regenerate
        // Remove the last assistant message if it exists
        let toUid = -1;
        if (messageUid) {
            toUid = messages.findIndex(mes => mes.uid === messageUid);
        }
        const newMessages = messages.slice(0, toUid);
        setMessages(newMessages);
        handleChat(newMessages, "重新產生對話時發生錯誤", setIsStreaming, setCurrentResponse, toast, abortControllerRef);
    };

    const handleChatTitle = async () => {
        const conversationContent = `<query>${JSON.stringify(messages.filter(mes => mes.role === 'user').map(mes => mes.content))}</query>`;
        const genChatTitleMessages = [
            systemMessage(SYSTEM_PROMPT + TITLE_GENERATOR_SYSTEM_PROMPT),
            userMessage(conversationContent),
        ]
        handleChat(genChatTitleMessages, "讓 AI 產生對話Title時發生錯誤", setTitleStreaming, setTitleResponse, toast);
    }

    // 動態調整 textarea 高度
    useEffect(() => {
        if (currentResponse) {
            const parsed = parseResponse(currentResponse);
            if (parsed) {
                setThinking(parsed.thinking);
                setResponseResult(parsed.response);
                setIsThinking(parsed.isThinking);
            }
        }

        if (historyRef.current) {
            historyRef.current.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [currentResponse]);

    useEffect(() => {
        if (titleResponse) {
            const parsed = parseResponse(titleResponse);
            if (parsed) {
                setTitle(parsed.title);
            }
        }
    }, [titleResponse]);

    useEffect(() => {
        if (!isStreaming && currentResponse && messages[messages.length - 1]?.role === 'user') {
            // AI 回應完畢, 儲存 AI 的完整回應
            const newAssistantMessage = assistantMessage(currentResponse);
            const newMessages = [...messages, newAssistantMessage];
            setMessages(newMessages);

            // 給予對話標題
            if (!title && !titleStreaming) {
                handleChatTitle()
            }
        }
    }, [isStreaming, currentResponse, title, titleStreaming]);

    useEffect(() => {
        if (title && !titleStreaming) {
            const saveChat = selectedChat ? { ...selectedChat, title: title } : new Chat({ uid: v4(), messages: messages, title: title });
            setSelectedChat(saveChat);
        }
    }, [title, titleStreaming]);

    useEffect(() => {
        if (messages[messages.length - 1]?.role === 'assistant' && historyRef.current) {
            historyRef.current.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
        }
        if (messages.filter(mes => mes.role === 'user').length > 0) {
            const saveChat = selectedChat ? { ...selectedChat, messages: messages } : new Chat({ uid: v4(), messages: messages, title: title });
            setSelectedChat(saveChat);
        }
    }, [messages]);

    useEffect(() => {
        let chat = null;
        let collectionId = "unorganized";
        const unorganizedChat = chatState.unorganizedStories.find((chat) => chat.uid === chatUid);
        if (unorganizedChat) {
            chat = unorganizedChat;
        }

        chatState.collections.forEach((collection) => {
            const findChat = collection.chats.find((chat) => chat.uid === chatUid);
            if (findChat) {
                chat = findChat;
                collectionId = collection.id;
            }
        })

        if (chat) {
            setSelectedChat(chat);
            setCurrentChatCollectionId(collectionId);
            setTitle(chat.title ?? '');
            setMessages(chat.messages ?? [systemMessage(SYSTEM_PROMPT)]);
        }
    }, [chatUid, chatState]);

    useEffect(() => {
        if (selectedChat) {
            let chatCollection: ChatCollection = { id: "", name: "unorganized", chats: [] };
            let chatCollectionChats = chatState.unorganizedStories;
            if (currentChatCollectionId !== "unorganized") {
                const collection = chatState.collections.find((col) => col.id === currentChatCollectionId);
                if (collection) {
                    chatCollection = collection;
                    chatCollectionChats = collection.chats;
                }
            }
            let otherCollections = chatState.collections.filter((col) => col.id !== currentChatCollectionId) || [];
            const isNewStory = !chatCollectionChats.find((chat) => chat.uid === selectedChat.uid);
            const otherStories = chatCollectionChats.filter((chat) => chat.uid !== selectedChat.uid);
            if (currentChatCollectionId === "unorganized") {
                setChatState({
                    ...chatState,
                    unorganizedStories: [...otherStories, selectedChat],
                });
            } else {
                setChatState({
                    ...chatState,
                    collections: [
                        ...otherCollections,
                        {
                            ...chatCollection,
                            chats: [...otherStories, selectedChat]
                        }
                    ]
                })
            }
        }

    }, [selectedChat])

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
    }, [currentStoryUid]);

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
            ) : (<motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="fixed bottom-4 right-8 flex justify-center p-0 m-0 w-[48rem]"
            >
                <Card className="w-full h-full bg-slate-50 shadow-lg">
                    <CardHeader className="h-8 flex flex-row items-center px-2 py-1 space-y-0 bg-slate-200 rounded-tl-lg rounded-tr-lg">
                        <Button variant='ghost' className="px-2 py-0 h-full" title="新對話" onClick={handleNewChatSession}>
                            <LucidePencilLine className="w-4 h-4" />
                        </Button>
                        <div className="flex w-full justify-start space-x-8 pl-4">
                            <div className="flex flex-row space-x-1 items-center justify-self-start">
                                {currentStoryCollectionId === "unorganized" && <span className="text-xs text-gray-500">未分類</span>}
                                {currentStoryCollectionId !== "unorganized" && <span className="text-xs text-gray-500">{currentStoryCollection?.name}</span>}
                                <span>{`/`}</span>
                                {selectedStory && <span className="text-xs text-gray-500">{selectedStory.title}</span>}
                            </div>
                            <div className="flex flex-row space-x-1 items-center">
                                {title && <span className="text-xs text-gray-500">{title}</span>}
                                {!title && titleStreaming && <ThinkingDots />}
                            </div>
                        </div>
                        <Button variant='ghost' className="justify-self-end px-2 py-0 h-full" title="縮小" onClick={toggleCollapse}>
                            <ChevronDownIcon className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <div className="flex flex-col w-full h-full max-h-[30rem] overflow-y-auto" ref={historyRef}>
                        {/* 聊天訊息歷史 */}
                        <div className="flex flex-col space-y-6 p-4">
                            {messages.map((message, index) => {
                                if (message.role !== 'system') {
                                    if ((index !== messages.length - 1) || (index === messages.length - 1 && message.role === 'user')) {
                                        return <ChatMessageBlock handleRegenerate={handleRegenerate} message={message} key={`${message.uid}-${message.timestamp}`} />
                                    }
                                }
                            }
                            )}
                        </div>

                        {/* 當前串流回應 */}
                        {isStreaming && (
                            <div className="flex flex-col w-full justify-start px-4">
                                {isThinking && <ThinkingAccordion thinking={thinking} isStreaming={isStreaming} />}
                                {!isThinking && <ThinkAccordion think={thinking} />}
                                <ResponseBlock message={responseResult} />
                            </div>
                        )}
                        {!isStreaming && currentResponse && (
                            <div className="flex p-4">
                                <ChatMessageBlock handleRegenerate={handleRegenerate} message={messages[messages.length - 1]} />
                            </div>
                        )}
                    </div>
                    {/* 輸入表單 */}
                    <Separator orientation="horizontal" className="border" />
                    <div className="flex w-full p-2">
                        <StoryChatForm isStreaming={isStreaming} handleStop={handleStop} handleSubmit={handleChatStory} />
                    </div>
                </Card>
            </motion.div>)}
        </AnimatePresence>
    )
}