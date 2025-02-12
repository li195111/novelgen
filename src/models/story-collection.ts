import { Story } from "@/models/story";

export interface StoryCollection {
  id: string;
  name: string;
  stories: Story[];
}

export interface RootStoryState {
  unorganizedStories: Story[];
  collections: StoryCollection[];
}
