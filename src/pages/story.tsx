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
import { useStoryStorage } from "@/hooks/use-story-storage";
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
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [currentStoryCollectionId, setCurrentStoryCollectionId] = useState<string | null>("unorganized");
    const [currentStoryCollection, setCurrentStoryCollection] = useState<StoryCollection | null>(null);
    const [storyState, setStoryState] = useStoryStorage();
    const [currentStoryUid, setCurrentStoryUid] = useCurrentStoryStorage();


    const [bodyPartsList, setBodyPartsList] = useState<string[]>(BODY_PARTS);
    const [actionsList, setActionsList] = useState<string[]>(ACTIONS_LIST);
    const [phrasesList, setPhrasesList] = useState<string[]>([]);


    const handleSaveStory = (values: z.infer<typeof StorySchema>) => {
        const saveStory = new Story({ ...values, lastModifiedTimestamp: Date.now() });
        let storyCollection: StoryCollection = { id: "", name: "unorganized", stories: [] };
        let storyCollectionStories = storyState.unorganizedStories;
        if ((currentStoryCollectionId !== "unorganized") && currentStoryCollection) {
            storyCollection = currentStoryCollection;
            storyCollectionStories = currentStoryCollection.stories;
        }
        let otherCollections = storyState.collections.filter((col) => col.id !== currentStoryCollectionId) || [];
        const isNewStory = !storyCollectionStories.find((story) => story.uid === saveStory.uid);
        const otherStories = storyCollectionStories.filter((story) => story.uid !== saveStory.uid);

        if (currentStoryCollectionId === "unorganized") {
            setStoryState({
                ...storyState,
                unorganizedStories: [...otherStories, saveStory],
            });
        } else {
            setStoryState({
                ...storyState,
                collections: [
                    ...otherCollections,
                    {
                        ...storyCollection,
                        stories: [...otherStories, saveStory]
                    }
                ]
            })
        }

        toast({
            title: isNewStory ? "新增故事" : "更新故事" + `：${saveStory.title}`,
            duration: 2000,
        });

    }

    useEffect(() => {
        if (storyUid) {
            setCurrentStoryUid(storyUid);
        }
    }, [storyUid]);

    useEffect(() => {
        let story = null;
        let collectionId = "unorganized";
        const unorganizedStory = storyState.unorganizedStories.find((story) => story.uid === storyUid);
        if (unorganizedStory) {
            story = unorganizedStory;
        }

        storyState.collections.forEach((collection) => {
            const findStory = collection.stories.find((story) => story.uid === storyUid);
            if (findStory) {
                story = findStory;
                collectionId = collection.id;
            }
        })

        if (story) {
            setSelectedStory(story);
            setCurrentStoryCollectionId(collectionId);

            let storyCollection: StoryCollection = { id: "", name: "unorganized", stories: [] };
            let storyCollectionStories = storyState.unorganizedStories;
            if (collectionId !== "unorganized") {
                const collection = storyState.collections.find((col) => col.id === collectionId);
                if (collection) {
                    storyCollection = collection;
                    storyCollectionStories = collection.stories;
                }
            }
            setCurrentStoryCollection(storyCollection);

        }
    }, [storyUid, storyState]);

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