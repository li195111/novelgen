import MarkdownRenderer from "@/components/markdown-render";
import { IChatMessage } from "@/models/chat";
import { parseResponse } from "@/utils";
import { RefreshCw } from "lucide-react";
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

interface ChatMessageBlockProps {
    message: IChatMessage;
    handleRegenerate?: (uid: string) => void;
}

export const ChatMessageBlock: React.FC<ChatMessageBlockProps> = ({ message, handleRegenerate }) => {
    const parsedMessage = parseResponse(message.content);
    return (
        <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} key={`${message.uid}-${message.timestamp}`} >
            <div className={[
                message.role === 'assistant' && 'w-full',
                message.role === 'user' && 'px-4 py-1 rounded-lg bg-white dark:bg-slate-800',
                'min-h-4 border-0 shadow-none resize-none focus-visible:ring-0 overflow-hidden bg-transparent',
            ].join(' ')}>
                {message.role === 'assistant' && <ThinkAccordion think={parsedMessage?.thinking} />}
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
}

export const ResponseBlock: React.FC<ResponseBlockProps> = ({ message }) => {
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