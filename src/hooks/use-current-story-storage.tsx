import { useLocalStorage } from "@/hooks/use-storage";
import { useStoryStorage } from "@/hooks/use-story-storage";
import { Story } from "@/models/story";
import { StoryCollection } from "@/models/story-collection";
import { useEffect, useState } from "react";

export const useCurrentStoryStorage = () => {
    const [storyState, setStoryState] = useStoryStorage();
    const [currentStoryUid, setCurrentStoryUid] = useLocalStorage<string>('current-story', '');
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [currentStoryCollectionId, setCurrentStoryCollectionId] = useState<string | null>("unorganized");
    const [currentStoryCollection, setCurrentStoryCollection] = useState<StoryCollection | null>(null);

    useEffect(() => {
        let story = null;
        let collectionId = "unorganized";
        let storyCollection: StoryCollection | null = null;
        if (currentStoryUid) {
            storyCollection = { id: "", name: "unorganized", stories: [] };
            const foundUnorganizedStory = storyState.unorganizedStories.find((story) => story.uid === currentStoryUid);
            if (!foundUnorganizedStory) {
                const foundCollection = storyState.collections.find((collection) =>
                    collection.stories.some((story) => story.uid === currentStoryUid)
                );
                if (foundCollection) {
                    storyCollection = foundCollection;
                    collectionId = foundCollection.id;
                    story = foundCollection.stories.find((story) => story.uid === currentStoryUid)!;
                }
            }
            else {
                story = foundUnorganizedStory;
            }

            if (story) {
                setSelectedStory(story);
                setCurrentStoryCollectionId(collectionId);
                setCurrentStoryCollection(storyCollection);
            }
        }
        else {
            setSelectedStory(story);
            setCurrentStoryCollectionId(collectionId);
            setCurrentStoryCollection(storyCollection);
        }
    }, [currentStoryUid, storyState]);

    return {
        storyState, setStoryState,
        selectedStory, setSelectedStory,
        currentStoryUid, setCurrentStoryUid,
        currentStoryCollectionId, setCurrentStoryCollectionId,
        currentStoryCollection, setCurrentStoryCollection
    }
}