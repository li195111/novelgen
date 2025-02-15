import { useLocalStorage } from "@/hooks/use-storage";

export const useCurrentStoryStorage = () => {
    return useLocalStorage<string>('current-story', '');
}