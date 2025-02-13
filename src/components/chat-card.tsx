import "@/App.css";
import { ChatMessageBlock, ResponseBlock } from "@/components/chat-message";
import { StoryChatForm, StoryChatSchema } from "@/components/story-chat-form";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { SYSTEM_PROMPT } from "@/constant";
import { useToast } from "@/hooks/use-toast";
import { assistantMessage, IChatMessage, systemMessage, userMessage } from "@/models/chat";
import { parseResponse } from "@/utils";
import { Separator } from "@radix-ui/react-separator";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

interface ChatCardProps {
}

export const ChatCard: React.FC<ChatCardProps> = ({ }) => {
    const { toast } = useToast();
    const [messages, setMessages] = useState<IChatMessage[]>([
        systemMessage(SYSTEM_PROMPT)
    ]);
    const [currentResponse, setCurrentResponse] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

    const [thinking, setThinking] = useState('');
    const [responseResult, setResponseResult] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const handleChatStory = async (values: z.infer<typeof StoryChatSchema>) => {
        try {
            setIsStreaming(true);
            setCurrentResponse('');

            // 儲存使用者的訊息
            const userChatMessage = userMessage(values.chatMessage);
            const newMessages = [...messages, userChatMessage];
            setMessages(newMessages);

            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-r1:32b',
                    messages: newMessages.map(mes => ({ role: mes.role, content: mes.content }))
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
        if (!isStreaming && currentResponse && messages[messages.length - 1]?.role === 'user') {
            // AI 回應完畢, 儲存 AI 的完整回應
            const newAssistantMessage = assistantMessage(currentResponse);
            setMessages(prev => [...prev, newAssistantMessage]);
        }
    }, [isStreaming]);

    useEffect(() => {
        if (messages[messages.length - 1]?.role === 'assistant' && historyRef.current) {
            historyRef.current.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages])

    return (
        <Card className="w-[40rem] h-full bg-slate-100">
            <div className="flex flex-col w-full h-full max-h-[30rem] overflow-y-auto" ref={historyRef}>
                {/* 聊天訊息歷史 */}
                <div className="flex flex-col space-y-6 p-4">
                    {messages.map((message, index) => {
                        if (message.role !== 'system') {
                            if ((index !== messages.length - 1) || (index === messages.length - 1 && message.role === 'user')) {
                                return <ChatMessageBlock message={message} key={`${message.uid}-${message.timestamp}`} />
                            }
                        }
                    }
                    )}
                </div>

                {/* 當前串流回應 */}
                {isStreaming && currentResponse && (
                    <div className="flex flex-col w-full justify-start px-4">
                        {thinking && (
                            <Accordion type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Thinking</AccordionTrigger>
                                    <AccordionContent>
                                        <ResponseBlock message={thinking} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )}
                        <ResponseBlock message={responseResult} />
                    </div>
                )}
                {!isStreaming && currentResponse && (
                    <div className="flex p-4">
                        <ChatMessageBlock message={messages[messages.length - 1]} />
                    </div>
                )}
            </div>
            {/* 輸入表單 */}
            <Separator orientation="horizontal" className="border" />
            <div className="flex w-full p-2">
                <StoryChatForm handleSubmit={handleChatStory} />
            </div>
        </Card>
    )
}