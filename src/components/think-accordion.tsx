import { ResponseBlock } from "@/components/chat-message";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { BrainIcon } from "lucide-react";


interface ThinkAccordionProps {
    think?: string;
}

const ThinkAccordion: React.FC<ThinkAccordionProps> = ({ think }) => {
    return (
        <>
            {think && (
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="think" className="border-none">
                        <AccordionTrigger className="py-2 hover:no-underline">
                            <BrainIcon />
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

export default ThinkAccordion;