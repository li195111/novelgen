import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { IChatMessage } from "@/models/chat";
import { parseResponse } from "@/utils";
import { v4 } from "uuid";

interface LineBlockProps {
    line: string;
}

export const LineBlock: React.FC<LineBlockProps> = ({ line }) => {
    return (
        <div className="flex w-full">
            <p>{line}</p>
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
            <div className={`text-sm min-h-4 border-0 shadow-none resize-none focus-visible:ring-0 overflow-hidden bg-transparent`}>
                {message.role === 'assistant' && parseResponse(message.content)?.thinking && (
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Thinking</AccordionTrigger>
                            <AccordionContent>
                                {(parseResponse(message.content)?.thinking.split('\n').map((line, index) => (
                                    <LineBlock line={line} key={`${message.uid ?? v4()}-${index}`} />
                                )))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>)}
                {message.role === 'assistant' && parseResponse(message.content)?.response.split('\n').map((line, index) => (
                    <LineBlock line={line} key={`${message.uid ?? v4()}-${index}`} />
                ))}
                {message.role === 'user' && message.content.split('\n').map((line, index) => (
                    <LineBlock line={line} key={`${message.uid ?? v4()}-${index}`} />
                ))}
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
            <div className={`text-sm min-h-4 border-0 shadow-none resize-none focus-visible:ring-0 overflow-hidden bg-transparent`}>
                {message.split('\n').map((line, index) => (
                    <LineBlock line={line} key={`${v4()}-${index}`} />
                ))}
            </div>
        </div>
    )
}