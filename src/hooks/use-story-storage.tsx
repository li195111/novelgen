import { useLocalStorage } from "@/hooks/use-storage";
import { RootStoryState } from "@/models/story-collection";

export const useStoryStorage = () => {
    return useLocalStorage<RootStoryState>('story-state', {
        unorganizedStories: [],
        collections: []
    });
};