import "@/App.css";
import { ChatCard } from "@/components/chat-card";
import StoryForm, { StorySchema } from "@/components/story-form";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ACTIONS_LIST, DARK_BODY_PARTS } from "@/constant";
import { useLocalStorage } from "@/hooks/use-storage";
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

    const [storyList, setStoryList] = useLocalStorage<Story[]>('stories', []);
    const [selectedStory, setSelectedStory] = useState<Story | null>(storyList.find((story) => story.uid === storyUid) ?? null);

    const [bodyPartsList, setBodyPartsList] = useState<string[]>(DARK_BODY_PARTS);
    const [actionsList, setActionsList] = useState<string[]>(ACTIONS_LIST);
    const [phrasesList, setPhrasesList] = useState<string[]>([]);


    const handleAddStory = (values: z.infer<typeof StorySchema>) => {
        const saveStory = new Story(values);
        const isNewStory = !storyList.find((story) => story.uid === saveStory.uid);
        const otherStories = storyList.filter((story) => story.uid !== saveStory.uid);
        setStoryList([...otherStories, saveStory]);
        toast({
            title: isNewStory ? "新增故事" : "更新故事",
            description: `已${isNewStory ? '新增' : '更新'}故事：${saveStory.title}`,
        });

    }

    useEffect(() => {
        const story = storyList.find((story) => story.uid === storyUid);
        setSelectedStory(story ?? null);
    }, [storyUid, storyList]);

    return (
        <div className="h-full">
            <Card>
                <div className="flex flex-col px-4 py-2.5 space-y-2">
                    <StoryForm defaultStory={selectedStory} handleSubmit={handleAddStory} />
                </div>
            </Card>
            <Card>
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
            </Card>
        </div>
    )
}

export default StoryPage;