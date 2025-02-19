import "@/App.css";
import StoryForm, { StorySchema } from "@/components/story-form";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ACTIONS_LIST, BODY_PARTS } from "@/constant";
import { useStoryStorage } from "@/hooks/use-story-storage";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@/models/story";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import { z } from "zod";

interface StoryPageProps {
}

const StoryPage: React.FC<StoryPageProps> = ({ }) => {
    const { toast } = useToast();
    const { storyUid } = useParams();
    const { updateStoryState, selectedStory, setCurrentStoryUid } = useStoryStorage();

    const [bodyPartsList, setBodyPartsList] = useState<string[]>(BODY_PARTS);
    const [actionsList, setActionsList] = useState<string[]>(ACTIONS_LIST);
    const [phrasesList, setPhrasesList] = useState<string[]>([]);


    const handleSaveStory = async (values: z.infer<typeof StorySchema>) => {
        const saveStory = new Story({ ...values, lastModifiedTimestamp: Date.now() });
        const isNewStory = await updateStoryState(saveStory, {});
        toast({
            title: `${isNewStory?.isNew ? "新增故事" : "更新故事"}: ${saveStory.title}`,
            duration: 2000,
        });
        setCurrentStoryUid(saveStory.uid);
    }

    useEffect(() => {
        setCurrentStoryUid(storyUid ?? "");
    }, [storyUid]);

    return (
        <div className="h-full">
            <Card>
                <div className="flex flex-col px-4 py-2.5 space-y-2">
                    <StoryForm defaultStory={selectedStory} handleSubmit={handleSaveStory} />
                </div>
            </Card>
            {/* <Card>
                <div className="flex flex-col px-4 space-y-2">
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>身體部位</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-wrap">
                                    {bodyPartsList.map((part, _) => (
                                        <Badge key={`bodyparts-${v4()}`} className="m-0.5">{part}</Badge>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>動作</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-wrap">
                                    {actionsList.map((action, _) => (
                                        <Badge key={`actions-${v4()}`} className="m-0.5">{action}</Badge>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </Card> */}
        </div>
    )
}

export default StoryPage;