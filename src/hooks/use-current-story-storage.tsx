import { useLocalStorage } from "@/hooks/use-storage";
import { useStoryStorage } from "@/hooks/use-story-storage";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@/models/story";
import { StoryCollection } from "@/models/story-collection";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

export const useCurrentStoryStorage = () => {
    const { toast } = useToast();
    const [storyState, setStoryState] = useStoryStorage();
    const [currentStoryUid, setCurrentStoryUid] = useLocalStorage<string>('current-story', '');
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [currentStoryCollectionId, setCurrentStoryCollectionId] = useState<string | null>("unorganized");
    const [currentStoryCollection, setCurrentStoryCollection] = useState<StoryCollection | null>(null);

    const handleAddStoryCollection = () => {
        const newCollection: StoryCollection = {
            id: `col-${v4().replace(/-/g, '')}`,
            name: `故事集 ${storyState.collections.length + 1}`,
            stories: []
        };

        setStoryState(prev => ({
            ...prev,
            collections: [...prev.collections, newCollection]
        }));
    };

    const handleDeleteCurrentStoryCollection = () => {
        setStoryState(prev => {
            const collection = prev.collections.find(c => c.id === currentStoryCollection?.id);
            if (!collection) return prev;

            return {
                ...prev,
                unorganizedStories: [...prev.unorganizedStories, ...collection.stories],
                collections: prev.collections.filter(c => c.id !== currentStoryCollection?.id)
            };
        });
        toast({
            title: `已刪除故事集 ${currentStoryCollection?.name}`,
            duration: 2000,
        })
        setCurrentStoryUid("");
    }

    const handleDeleteSelectedStory = () => {
        if (!selectedStory) return;
        setStoryState((prev) => {
            let story = null;
            let otherStories: Story[] = [];
            let collectionId = "unorganized";
            let storyCollection: StoryCollection = { id: "", name: "unorganized", stories: [] };
            let otherCollections: StoryCollection[] = [];
            const foundUnorganizedStory = prev.unorganizedStories.find((story) => story.uid === selectedStory.uid);
            if (!foundUnorganizedStory) {
                const foundCollection = storyState.collections.find((collection) =>
                    collection.stories.some((story) => story.uid === selectedStory.uid)
                );
                if (foundCollection) {
                    storyCollection = foundCollection;
                    collectionId = foundCollection.id;
                    otherCollections = prev.collections.filter((col) => col.id !== collectionId) || [];
                    story = foundCollection.stories.find((story) => story.uid === selectedStory.uid)!;
                    otherStories = foundCollection.stories.filter((story) => story.uid !== selectedStory.uid);
                }
            }
            else {
                story = foundUnorganizedStory;
                otherStories = prev.unorganizedStories.filter((story) => story.uid !== selectedStory.uid);
            }
            if (story) {
                if (collectionId === "unorganized") {
                    return { ...prev, unorganizedStories: [...otherStories] };
                }
                else {
                    return { ...prev, collections: [...otherCollections, { ...storyCollection, stories: [...otherStories] }] };
                }
            }
            return prev;
        })
        toast({
            title: `已刪除故事 ${selectedStory.title}`,
            duration: 2000,
        })
        setCurrentStoryUid("");
    }

    const updateStoryState = (updateStory: Story, update: Partial<Story>) => {
        if (!updateStory) return;
        return new Promise<{ isNew: boolean }>((resolve) => {
            setStoryState((prev) => {
                const unorganizedStory = prev.unorganizedStories.find(story => story.uid === updateStory.uid);
                const foundCollection = prev.collections.find(col => col.stories.some(story => story.uid === updateStory.uid));
                if (unorganizedStory || !foundCollection) {
                    // If the chat is in unorganized or not found in any collection
                    if (unorganizedStory) {
                        // If the chat is found in unorganized, update the chat
                        resolve({ 'isNew': false });
                        return { ...prev, unorganizedStories: prev.unorganizedStories.map((story) => story.uid === updateStory.uid ? { ...updateStory, ...update } : story) };
                    }
                    // If the chat is not found in unorganized, add it to unorganized
                    resolve({ 'isNew': true });
                    return { ...prev, unorganizedStories: [...prev.unorganizedStories, { ...updateStory, ...update }] };
                }
                if (!foundCollection) {
                    resolve({ 'isNew': true });
                    return prev
                };
                const foundCollectionId = foundCollection.id;
                const otherCollections = prev.collections.filter((col) => col.id !== foundCollectionId) || [];
                const foundStory = foundCollection.stories.find(story => story.uid === updateStory.uid);
                // If the chat is found in a collection, update the chat
                if (foundStory) {
                    const updatedStories = foundCollection.stories.map(story => story.uid === updateStory.uid ? { ...updateStory, ...update } : story);
                    resolve({ 'isNew': false });
                    return { ...prev, collections: [...otherCollections, { ...foundCollection, stories: updatedStories }] };
                }
                // If the chat is not found in a collection, add it to the collection
                const updatedStories = [...foundCollection.stories, { ...updateStory, ...update }];
                const updatedStoryState = { ...prev, collections: [...otherCollections, { ...foundCollection, stories: updatedStories }] };
                resolve({ 'isNew': true });
                return updatedStoryState;
            });
        })
    }

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
        storyState, setStoryState, updateStoryState,
        selectedStory, setSelectedStory,
        currentStoryUid, setCurrentStoryUid,
        currentStoryCollectionId, setCurrentStoryCollectionId,
        currentStoryCollection, setCurrentStoryCollection,
        handleAddStoryCollection,
        handleDeleteCurrentStoryCollection,
        handleDeleteSelectedStory,
    }
}