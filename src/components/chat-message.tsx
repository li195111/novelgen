import MarkdownRenderer from "@/components/markdown-render";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useChatContext } from "@/context/chat-context";
import { ChatMessage } from "@/models/chat";
import { parseResponse } from "@/utils";
import { BrainIcon, RectangleEllipsisIcon, RefreshCw } from "lucide-react";
import { v4 } from 'uuid';
import ThinkAccordion from "./think-accordion";
import { Button } from "./ui/button";
interface LineBlockProps {
    line: string;
}

export const LineBlock: React.FC<LineBlockProps> = ({ line }) => {
    return (
        <div className="flex w-full">
            <MarkdownRenderer content={line} />
            <br />
        </div>
    )
}

interface AllMessageAccordionProps {
    messages: ChatMessage[];
    className?: string;
}

export const AllMessageAccordion: React.FC<AllMessageAccordionProps> = ({ messages, className }) => {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="think" className="border-none">
                <AccordionTrigger className="py-2 hover:no-underline">
                    <RectangleEllipsisIcon />
                </AccordionTrigger>
                <AccordionContent>
                    {messages.map((mes) => {
                        if (mes.role === 'system') return <MarkdownRenderer className={["bg-slate-200 max-w-[80%] rounded-lg p-2", className].join(' ')} content={mes.content} key={v4()} />
                        else return <MarkdownRenderer className={className} content={mes.content} key={v4()} />
                    })}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

interface ChatMessageBlockProps {
    message: ChatMessage;
    className?: string;
}

export const ChatMessageBlock: React.FC<ChatMessageBlockProps> = ({ message, className }) => {
    const { handleRegenerate } = useChatContext();
    const parsedMessage = parseResponse(message.content, ['think']);
    return (
        <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} key={`${message.uid}-${message.timestamp}`} >
            <div className={[
                message.role === 'assistant' && 'w-full bg-slate-100 text-black',
                message.role === 'user' && 'px-4 py-1 rounded-lg bg-white dark:bg-slate-800',
                'min-h-4 border-0 shadow-none resize-none focus-visible:ring-0 overflow-hidden bg-transparent',
                className
            ].join(' ')}>
                {message.role === 'assistant' && <ThinkAccordion think={parsedMessage?.think} />}
                {message.role === 'assistant' && (
                    <>
                        <MarkdownRenderer content={parsedMessage?.response} />
                        {/* 重新產生 */}
                        {handleRegenerate && (
                            <div className="flex pt-4 space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRegenerate(message.uid)}
                                    className="w-6 h-6"
                                >
                                    <RefreshCw style={{ width: "0.75rem", height: "0.75rem" }} />
                                </Button>
                            </div>
                        )}
                    </>
                )}
                {message.role === 'user' && <MarkdownRenderer content={message.content} />}
            </div>
        </div>
    )
}

interface ResponseBlockProps {
    message: string;
    className?: string;
}

export const ResponseBlock: React.FC<ResponseBlockProps> = ({ message, className }) => {
    return (
        <div className={`flex w-full justify-start`}>
            <div className={[
                'min-h-4 border-0 shadow-none resize-none focus-visible:ring-0 overflow-hidden bg-transparent'
            ].join(' ')}>
                <MarkdownRenderer content={message} />
            </div>
        </div>
    )
}