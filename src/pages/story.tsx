import "@/App.css";
import StoryChatForm, { StoryChatSchema } from "@/components/story-chat-form";
import StoryForm, { StorySchema } from "@/components/story-form";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ACTIONS_LIST, DARK_BODY_PARTS } from "@/constant";
import { useLocalStorage } from "@/hooks/use-storage";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/models/chat";
import { Story } from "@/models/story";
import { Separator } from "@radix-ui/react-separator";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import { z } from "zod";

interface StoryPageProps {
}

const StoryPage: React.FC<StoryPageProps> = ({ }) => {
    const { toast } = useToast();
    const { storyUid } = useParams();


    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentResponse, setCurrentResponse] = useState<string>('');

    const [storyList, setStoryList] = useLocalStorage<Story[]>('stories', []);
    const [selectedStory, setSelectedStory] = useState<Story | null>(storyList.find((story) => story.uid === storyUid) ?? null);

    const [bodyPartsList, setBodyPartsList] = useState<string[]>(DARK_BODY_PARTS);
    const [actionsList, setActionsList] = useState<string[]>(ACTIONS_LIST);
    const [phrasesList, setPhrasesList] = useState<string[]>([]);

    const [response, setResponse] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleAddStory = (values: z.infer<typeof StorySchema>) => {
        const saveStory = new Story(values);
        const isNewStory = !storyList.find((story) => story.uid === saveStory.uid);
        const otherStories = storyList.filter((story) => story.uid !== saveStory.uid);
        setStoryList([...otherStories, saveStory]);
        toast({
            title: isNewStory ? "新增故事" : "更新故事",
            description: `已${isNewStory ? '新增' : '更新'}故事：${saveStory.title}`,
        });

    }

    const handleChatStory = async (values: z.infer<typeof StoryChatSchema>) => {
        try {
            setIsStreaming(true);
            setCurrentResponse('');

            // 儲存使用者的訊息
            const userMessage: ChatMessage = {
                uid: v4(),
                role: 'user',
                content: values.addStory,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, userMessage]);

            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-r1:32b',
                    messages: [
                        ...messages,
                        {
                            role: 'user',
                            content: values.addStory
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Reader not available');
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Convert the chunk to text
                const chunk = new TextDecoder().decode(value);

                // Parse the JSON lines
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const parsedLine = JSON.parse(line);
                        if (parsedLine.message?.content) {
                            setCurrentResponse(prev => prev + parsedLine.message.content);
                        }
                    } catch (e) {
                        console.error('Error parsing JSON line:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "錯誤",
                description: "與 AI 對話時發生錯誤",
                variant: "destructive"
            });
        } finally {
            setIsStreaming(false);
        }
    }

    useEffect(() => {
        const story = storyList.find((story) => story.uid === storyUid);
        setSelectedStory(story ?? null);
    }, [storyUid, storyList]);

    // 動態調整 textarea 高度
    useEffect(() => {
        if (textareaRef.current) {
            // 重置高度避免縮小時的問題
            textareaRef.current.style.height = 'auto';
            // 設置新的高度
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [currentResponse]);

    useEffect(() => {
        if (!isStreaming && currentResponse && messages[messages.length - 1]?.role === 'user') {
            // AI 回應完畢, 儲存 AI 的完整回應
            const assistantMessage: ChatMessage = {
                uid: v4(),
                role: 'assistant',
                content: currentResponse,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, assistantMessage]);
        }
    }, [isStreaming]);

    return (
        <div className="h-full">
            <Card>
                <div className="flex flex-col px-4 py-2.5 space-y-2">
                    <StoryForm defaultStory={selectedStory} handleSubmit={handleAddStory} />
                </div>
            </Card>
            <Card>
                <div className="flex flex-col px-4 space-y-2">
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>身體部位</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-wrap">
                                    {bodyPartsList.map((part, _) => (
                                        <Badge key={`bodyparts-${v4()}`} className="m-0.5">{part}</Badge>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>動作</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-wrap">
                                    {actionsList.map((action, _) => (
                                        <Badge key={`actions-${v4()}`} className="m-0.5">{action}</Badge>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </Card>
            <Card>
                {/* 聊天訊息歷史 */}
                <div className="flex flex-col space-y-6 p-6">
                    {messages.map((message, index) => {
                        if (index !== messages.length - 1 || (index === messages.length - 1 && message.role === 'user')) {
                            return (
                                <div key={message.timestamp}
                                    className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`text-sm min-h-4 border-0 shadow-none resize-none focus-visible:ring-0 overflow-hidden bg-transparent`}>
                                        {message.content.split('\n').map((line, index) => (
                                            <div key={`${message.uid}-${index}`} className="flex w-full">
                                                <p>{line}</p>
                                                <br />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                    }
                    )}
                </div>

                {/* 當前串流回應 */}
                {currentResponse && (
                    <div className="flex w-full justify-start px-4">
                        <div className="flex w-full">
                            <Textarea
                                ref={textareaRef}
                                className="border-0 shadow-none resize-none focus-visible:ring-0 overflow-hidden bg-transparent"
                                value={currentResponse}
                                readOnly
                            />
                        </div>
                    </div>
                )}
                {/* 輸入表單 */}
                <Separator orientation="horizontal" className="border" />
                <div className="flex w-full p-2">
                    <StoryChatForm handleSubmit={handleChatStory} />
                </div>
            </Card>
        </div>
    )
}

export default StoryPage;