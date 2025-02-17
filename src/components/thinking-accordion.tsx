import { ResponseBlock } from "@/components/chat-message";
import { ThinkingDots } from "@/components/thinking-dots";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";


interface ThinkingAccordionProps {
    think: string;
    isStreaming: boolean;
}

const ThinkingAccordion: React.FC<ThinkingAccordionProps> = ({ think, isStreaming }) => {
    return (
        <>
            {(isStreaming || think) && (
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="think" className="border-none">
                        <AccordionTrigger className="py-2 hover:no-underline">
                            <ThinkingDots />
                        </AccordionTrigger>
                        <AccordionContent>
                            <ResponseBlock message={think} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </>
    );
};

export default ThinkingAccordion;