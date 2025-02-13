import "@/App.css";
import StoryChatForm, { StoryChatSchema } from "@/components/story-chat-form";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/models/chat";
import { Separator } from "@radix-ui/react-separator";
import { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { z } from "zod";

interface ChatCardProps {
}

export const ChatCard: React.FC<ChatCardProps> = ({ }) => {
    const { toast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentResponse, setCurrentResponse] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    )
}