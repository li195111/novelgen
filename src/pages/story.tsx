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
import { useCurrentStoryStorage } from "@/hooks/use-current-story-storage";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@/models/story";
import { StoryCollection } from "@/models/story-collection";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import { z } from "zod";

interface StoryPageProps {
}

const StoryPage: React.FC<StoryPageProps> = ({ }) => {
    const { toast } = useToast();
    const { storyUid } = useParams();
    const { setStoryState, selectedStory, currentStoryCollectionId, currentStoryCollection, setCurrentStoryUid } = useCurrentStoryStorage();


    const [bodyPartsList, setBodyPartsList] = useState<string[]>(BODY_PARTS);
    const [actionsList, setActionsList] = useState<string[]>(ACTIONS_LIST);
    const [phrasesList, setPhrasesList] = useState<string[]>([]);


    const handleSaveStory = (values: z.infer<typeof StorySchema>) => {
        const saveStory = new Story({ ...values, lastModifiedTimestamp: Date.now() });
        setStoryState((prev) => {
            let storyCollection: StoryCollection = { id: "", name: "unorganized", stories: [] };
            let storyCollectionStories = prev.unorganizedStories;
            if ((currentStoryCollectionId !== "unorganized") && currentStoryCollection) {
                storyCollection = currentStoryCollection;
                storyCollectionStories = currentStoryCollection.stories;
            }
            let otherCollections = prev.collections.filter((col) => col.id !== currentStoryCollectionId) || [];
            const isNewStory = !storyCollectionStories.find((story) => story.uid === saveStory.uid);
            const otherStories = storyCollectionStories.filter((story) => story.uid !== saveStory.uid);
            toast({
                title: `${isNewStory ? "新增故事" : "更新故事"}: ${saveStory.title}`,
                duration: 2000,
            });
            return currentStoryCollectionId === "unorganized" ? { ...prev, unorganizedStories: [...otherStories, saveStory] } : { ...prev, collections: [...otherCollections, { ...storyCollection, stories: [...otherStories, saveStory] }] };
        });
    }

    useEffect(() => {
        if (storyUid) {
            setCurrentStoryUid(storyUid);
        }
    }, [storyUid]);

    return (
        <div className="h-full">
            <Card>
                <div className="flex flex-col px-4 py-2.5 space-y-2">
                    <StoryForm defaultStory={selectedStory} handleSubmit={handleSaveStory} />
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