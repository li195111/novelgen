import { Character } from "@/models/character";

export interface StoryProps {
  uid: string;
  title?: string;
  tags?: string[];
  characters: Character[];
  scenes: string[];
  outline?: string;
  content?: string;
  currentScene?: string;
  createTimestamp?: number;
  lastModifiedTimestamp?: number;
}

export class Story {
  uid: string;
  title: string;
  tags: string[];
  characters: Character[];
  scenes: string[];
  outline: string;
  content: string;
  currentScene: string;
  createTimestamp?: number;
  lastModifiedTimestamp?: number;

  constructor(props: StoryProps) {
    this.uid = props.uid;
    this.title = props.title ?? "";
    this.tags = props.tags ?? [];
    this.characters = props.characters;
    this.scenes = props.scenes;
    this.outline = props.outline ?? "";
    this.content = props.content ?? "";
    this.currentScene = props.currentScene ?? "";
    this.createTimestamp = props.createTimestamp ?? Date.now();
    this.lastModifiedTimestamp = props.lastModifiedTimestamp ?? Date.now();
  }
}
