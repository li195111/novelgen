import "@/App.css";
import { ChatContent } from "@/components/ChatCard/chat-content";
import { ChatCardHeader } from "@/components/ChatCard/chat-header";
import { StoryChatForm, StoryChatSchema } from "@/components/story-chat-form";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { useChatContext } from "@/context/chat-context";
import { Separator } from "@radix-ui/react-separator";
import { AnimatePresence, motion } from 'framer-motion';
import { BotMessageSquareIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TypeOf } from "zod";

export enum SubmitAction {
    normal = 'normal',
    storySuggestion = 'story-suggestion',
    storySceneSuggestion = 'story-scene-suggestion',
    storyContentModifyAndExtend = 'story-content-modify-and-extend',
    storyContentExtend = 'story-content-extend',
}

interface ChatCardProps {
}

export const ChatCard: React.FC<ChatCardProps> = ({ }) => {
    const { resetCurrentChatSession,
        handleChatStory,
        handleStorySuggestion, handleStorySceneSuggestion,
        handleStoryContentModifyAndExtend, handleStoryContentExtend,
        isDarkModeChat,
    } = useChatContext();
    const submitMap = useRef<{ [key: string]: (values: TypeOf<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => Promise<void> }>({
        'normal': handleChatStory,
        'story-suggestion': handleStorySuggestion,
        'story-scene-suggestion': handleStorySceneSuggestion,
        'story-content-modify-and-extend': handleStoryContentModifyAndExtend,
        'story-content-extend': handleStoryContentExtend,
    });

    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        resetCurrentChatSession();
    }, [])

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
                    className="fixed bottom-4 right-8 flex justify-center p-0 m-0 w-[58rem]"
                >
                    <Card className="w-full h-full bg-slate-50 shadow-lg">
                        <ChatCardHeader toggleCollapse={toggleCollapse} />
                        <ChatContent />
                        {/* 輸入表單 */}
                        <Separator orientation="horizontal" className={[
                            "border",
                            isDarkModeChat ? "border-purple-950" : 'border-slate-200',
                        ].join(' ')} />
                        <CardFooter className={[
                            "p-2",
                        ].join(' ')}>
                            <StoryChatForm submitMap={submitMap} />
                        </CardFooter>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    )
}