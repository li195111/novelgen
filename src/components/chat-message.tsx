import MarkdownRenderer from "@/components/markdown-render";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { IChatMessage } from "@/models/chat";
import { parseResponse } from "@/utils";
import ThinkAccordion from "./think-accordion";

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
}

export const ChatMessageBlock: React.FC<ChatMessageBlockProps> = ({ message }) => {

    return (
        <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} key={`${message.uid}-${message.timestamp}`} >
            <div className={[
                message.role === 'assistant' && 'w-full',
                message.role === 'user' && 'px-4 py-1 rounded-lg bg-white dark:bg-slate-800',
                'min-h-4 border-0 shadow-none resize-none focus-visible:ring-0 overflow-hidden bg-transparent',
            ].join(' ')}>
                {message.role === 'assistant' && <ThinkAccordion think={parseResponse(message.content)?.thinking} />}
                {message.role === 'assistant' && <MarkdownRenderer content={parseResponse(message.content)?.response} />}
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