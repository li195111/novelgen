import "@/App.css";
import StoryForm, { StorySchema } from "@/components/story-form";
import { Card } from "@/components/ui/card";
import { useStoryStorage } from "@/hooks/use-story-storage";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@/models/story";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { z } from "zod";

interface StoryPageProps {
}

const StoryPage: React.FC<StoryPageProps> = ({ }) => {
    const { toast } = useToast();
    const { storyUid } = useParams();
    const { updateStoryState, selectedStory, setCurrentStoryUid } = useStoryStorage();

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
        </div>
    )
}

export default StoryPage;