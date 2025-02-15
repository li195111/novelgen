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
        if (currentStoryUid) {
            let story = null;
            let collectionId = "unorganized";
            const unorganizedStory = storyState.unorganizedStories.find((story) => story.uid === currentStoryUid);
            if (unorganizedStory) {
                story = unorganizedStory;
            }

            storyState.collections.forEach((collection) => {
                const findStory = collection.stories.find((story) => story.uid === currentStoryUid);
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

        }
        else {
            setSelectedStory(null);
            setCurrentStoryCollectionId("unorganized");
            setCurrentStoryCollection(null);
        }
    }, [currentStoryUid, storyState]);

    return {
        storyState,
        setStoryState,
        currentStoryUid,
        setCurrentStoryUid,
        selectedStory,
        currentStoryCollectionId,
        currentStoryCollection,
    }
}