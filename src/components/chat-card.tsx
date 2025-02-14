import "@/App.css";
import { ChatMessageBlock, ResponseBlock } from "@/components/chat-message";
import { StoryChatForm, StoryChatSchema } from "@/components/story-chat-form";
import ThinkAccordion from "@/components/think-accordion";
import ThinkingAccordion from "@/components/thinking-accordion";
import { ThinkingDots } from "@/components/thinking-dots";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "@/constant";
import { useToast } from "@/hooks/use-toast";
import { assistantMessage, IChatMessage, systemMessage, userMessage } from "@/models/chat";
import { parseResponse } from "@/utils";
import { Separator } from "@radix-ui/react-separator";
import { AnimatePresence, motion } from 'framer-motion';
import { BotMessageSquareIcon, ChevronDownIcon, LucidePencilLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

interface ChatCardProps {
}

export const ChatCard: React.FC<ChatCardProps> = ({ }) => {
    const { toast } = useToast();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const [messages, setMessages] = useState<IChatMessage[]>([systemMessage(SYSTEM_PROMPT)]);
    const [currentResponse, setCurrentResponse] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

    const [title, setTitle] = useState<string>('');
    const [titleResponse, setTitleResponse] = useState<string>('');
    const [titleStreaming, setTitleStreaming] = useState(false);


    const [thinking, setThinking] = useState('');
    const [responseResult, setResponseResult] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

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
    }

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
        }
    };

    const handleRegenerate = async (messageUid?: string) => {
        if (messages.length < 2) return; // Need at least one user message to regenerate

        try {
            setIsStreaming(true);
            setCurrentResponse('');

            // Remove the last assistant message if it exists
            let toUid = -1;
            if (messageUid) {
                toUid = messages.findIndex(mes => mes.uid === messageUid);
            }
            const newMessages = messages.slice(0, toUid);
            setMessages(newMessages);

            // Create new AbortController
            abortControllerRef.current = new AbortController();

            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-r1:32b',
                    messages: newMessages.map(mes => ({ role: mes.role, content: mes.content }))
                }),
                signal: abortControllerRef.current.signal
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

                const chunk = new TextDecoder().decode(value);
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
                description: "重新產生回應時發生錯誤",
                variant: "destructive"
            });
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    };

    const handleChatStory = async (values: z.infer<typeof StoryChatSchema>) => {
        try {
            setIsStreaming(true);
            setCurrentResponse('');

            // 儲存使用者的訊息
            const userChatMessage = userMessage(values.chatMessage);
            const newMessages = [...messages, userChatMessage];
            setMessages(newMessages);

            // Create new AbortController
            abortControllerRef.current = new AbortController();

            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-r1:32b',
                    messages: newMessages.map(mes => ({ role: mes.role, content: mes.content }))
                }),
                signal: abortControllerRef.current.signal
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
            abortControllerRef.current = null;
        }
    }

    const handleChatTitle = async () => {
        try {
            setTitleStreaming(true);
            setTitleResponse('');

            const conversationContent = `<query>${JSON.stringify(messages.filter(mes => mes.role === 'user').map(mes => mes.content))}</query>`;
            const genChatTitleMessages = [
                systemMessage(SYSTEM_PROMPT + TITLE_GENERATOR_SYSTEM_PROMPT),
                userMessage(conversationContent),
            ]
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-r1:32b',
                    messages: genChatTitleMessages.map(mes => ({ role: mes.role, content: mes.content }))
                }),
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
                            setTitleResponse(prev => prev + parsedLine.message.content);
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
                description: "讓 AI 產生對話Title時發生錯誤",
                variant: "destructive"
            });
        } finally {
            setTitleStreaming(false);
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
            setMessages(prev => [...prev, newAssistantMessage]);

            // 給予對話標題
            if (!title && !titleStreaming) {
                handleChatTitle();
            }
        }
    }, [isStreaming]);

    useEffect(() => {
        if (messages[messages.length - 1]?.role === 'assistant' && historyRef.current) {
            historyRef.current.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages])

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
                    <CardHeader className="h-8 flex flex-row justify-between items-center px-2 py-1 space-y-0 bg-slate-200 rounded-tl-lg rounded-tr-lg">
                        <Button variant='ghost' className="px-2 py-0 h-full" title="新對話" onClick={handleNewChatSession}>
                            <LucidePencilLine className="w-4 h-4" />
                        </Button>
                        {title && <span className="text-xs text-gray-500">{title}</span>}
                        {!title && titleStreaming && <ThinkingDots />}
                        <Button variant='ghost' className="px-2 py-0 h-full" title="縮小" onClick={toggleCollapse}>
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
                        {isStreaming && currentResponse && (
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