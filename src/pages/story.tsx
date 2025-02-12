import "@/App.css";
import StoryForm, { StorySchema } from "@/components/story-form";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ACTIONS_LIST, BODY_PARTS } from "@/constant";
import { useLocalStorage } from "@/hooks/use-storage";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@/models/story";
import { SendIcon } from "lucide-react";
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

    const [bodyPartsList, setBodyPartsList] = useState<string[]>(BODY_PARTS);
    const [actionsList, setActionsList] = useState<string[]>(ACTIONS_LIST);
    const [phrasesList, setPhrasesList] = useState<string[]>([]);


    const handleAddStory = (values: z.infer<typeof StorySchema>) => {
        const saveStory = new Story(values);
        const isNewStory = !storyList.find((story) => story.uid === saveStory.uid);
        const otherStories = storyList.filter((story) => story.uid !== saveStory.uid);
        setStoryList([...otherStories, saveStory]);
        if (isNewStory) {
            toast({
                title: "新增故事",
                description: `已新增故事：${saveStory.title}`,
            });
        }
        else {
            toast({
                title: "更新故事",
                description: `已更新故事：${saveStory.title}`,
            });
        }
    }

    useEffect(() => {
        let selectedStory = null;
        let story = storyList.find((story) => story.uid === storyUid);
        if (storyUid && story) {
            selectedStory = story;
        }
        setSelectedStory(selectedStory);
    }, [storyUid]);

    return (
        <div className="h-full">
            <Card>
                <CardContent className="flex flex-col px-4 py-2.5 space-y-2">
                    <StoryForm defaultStory={selectedStory} handleSubmit={handleAddStory} />
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <div className="flex flex-col space-y-2">
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
                            <AccordionItem value="item-1">
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
                </CardContent>
            </Card>
            <div className="flex flex-col">
                <form
                    className="flex items-center justify-center"
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                >
                    <Input className="mr-5" id="greet-input" onChange={(e) => { }} placeholder="輸入劇情..." />
                    <Button type="submit">
                        <SendIcon />
                    </Button>
                </form>
                <Textarea className="" value={''} readOnly />
            </div>
        </div>
    )
}

export default StoryPage;