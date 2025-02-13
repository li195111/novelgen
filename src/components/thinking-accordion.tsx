import { ResponseBlock } from "@/components/chat-message";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface ThinkingDotsProps {
}

const ThinkingDots: React.FC<ThinkingDotsProps> = () => {
    return (
        <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
        </div>
    );
};

interface ThinkingAccordionProps {
    thinking: string;
    isStreaming: boolean;
}

const ThinkingAccordion: React.FC<ThinkingAccordionProps> = ({ thinking, isStreaming }) => {
    return (
        <>
            {(isStreaming || thinking) && (
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="thinking" className="border-none">
                        <AccordionTrigger className="py-2 hover:no-underline">
                            <ThinkingDots />
                        </AccordionTrigger>
                        <AccordionContent>
                            <ResponseBlock message={thinking} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </>
    );
};

export default ThinkingAccordion;