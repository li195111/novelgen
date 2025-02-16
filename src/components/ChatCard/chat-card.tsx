import "@/App.css";
import { ChatContent } from "@/components/ChatCard/chat-content";
import { ChatCardHeader } from "@/components/ChatCard/chat-header";
import { StoryChatForm } from "@/components/story-chat-form";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { useCurrentChatStorage } from "@/hooks/use-current-chat-storage";
import { Separator } from "@radix-ui/react-separator";
import { AnimatePresence, motion } from 'framer-motion';
import { BotMessageSquareIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

interface ChatCardProps {
}

export const ChatCard: React.FC<ChatCardProps> = ({ }) => {
    const { chatUid } = useParams();
    const historyRef = useRef<HTMLDivElement>(null);
    const { chatSession, setCurrentChatUid, resetCurrentChatSession, updateChatSession, handleChatStory, handleRegenerate } = useCurrentChatStorage(historyRef);

    const abortControllerRef = useRef<AbortController | null>(null);

    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleNewChatSession = () => {
        resetCurrentChatSession();
    }

    const handleStopChat = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            updateChatSession({ isStreaming: false });
        }
    };

    useEffect(() => {
        if (chatUid) {
            setCurrentChatUid(chatUid);
        }
    }, [chatUid])

    return (
        <AnimatePresence>
            {isCollapsed ? (
                <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="fixed bottom-6 right-10 z-50"
                >
                    <Button className="rounded-full w-9 h-9 bg-slate-800 hover:bg-slate-500 text-white shadow-lg" onClick={toggleCollapse}>
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
                        <ChatCardHeader
                            chatSession={chatSession}
                            toggleCollapse={toggleCollapse}
                            handleNewChatSession={handleNewChatSession} />
                        <ChatContent
                            chatSession={chatSession}
                            historyRef={historyRef}
                            handleRegenerate={handleRegenerate} />
                        {/* 輸入表單 */}
                        <Separator orientation="horizontal" className="border" />
                        <CardFooter className="p-2">
                            <StoryChatForm
                                chatSession={chatSession}
                                handleStop={handleStopChat}
                                handleSubmit={handleChatStory} />
                        </CardFooter>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    )
}