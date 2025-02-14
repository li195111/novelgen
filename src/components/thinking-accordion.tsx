import { ResponseBlock } from "@/components/chat-message";
import { ThinkingDots } from "@/components/thinking-dots";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";


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