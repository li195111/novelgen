"use client";

import AddCharacterDialog from "@/components/add-character-dialog";
import AddSceneDialog from "@/components/add-scene-dialog";
import { CharacterSchema } from "@/components/character-form";
import EditCharacterDialog from "@/components/edit-character-dialog";
import EditSceneDialog from "@/components/edit-scene-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Character } from "@/models/character";
import { Story } from "@/models/story";
import { dynamicHeight } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircleIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import { z } from "zod";

export const StorySchema = z.object({
    uid: z.string().nonempty(),
    title: z.string().nonempty({ message: "請輸入故事標題" }),
    tags: z.array(z.string()).optional(),
    characters: z.array(CharacterSchema),
    scenes: z.array(z.string()),
    outline: z.string().optional(),
    content: z.string().optional(),
    currentScene: z.string().optional(),
});
export type StoryType = z.infer<typeof StorySchema>;

interface StoryFormProps {
    defaultStory?: Story | null;
    handleSubmit: (values: any) => void;
}

export const StoryForm: React.FC<StoryFormProps> = ({ defaultStory, handleSubmit }) => {
    const { toast } = useToast();

    const [characterList, setCharacterList] = useState<Character[]>(defaultStory?.characters ?? []);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isAddCharacterDialogOpen, setIsAddCharacterDialogOpen] = useState(false);
    const [isEditCharacterDialogOpen, setIsEditCharacterDialogOpen] = useState(false);

    const [sceneList, setSceneList] = useState<string[]>(defaultStory?.scenes ?? []);
    const [selectedScene, setSelectedScene] = useState<string | null>(null);
    const [isAddSceneDialogOpen, setIsAddSceneDialogOpen] = useState(false);
    const [isEditSceneDialogOpen, setIsEditSceneDialogOpen] = useState(false);

    const outlineRef = useRef<HTMLTextAreaElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const currentSceneRef = useRef<HTMLTextAreaElement>(null);

    const storyForm = useForm<StoryType>({
        resolver: zodResolver(StorySchema),
        defaultValues: {
            uid: defaultStory?.uid ?? v4(),
            title: defaultStory?.title ?? "",
            tags: defaultStory?.tags ?? [],
            characters: characterList,
            scenes: sceneList,
            outline: defaultStory?.outline ?? "",
            content: defaultStory?.content ?? "",
            currentScene: defaultStory?.currentScene ?? "",
        }
    });

    const handleAddCharacter = (character: Character) => {
        setCharacterList(prev => [...prev, character]);
        setIsAddCharacterDialogOpen(false);
        toast({
            title: "新增角色",
            description: `新增角色：${character.name}`,
        })
    };

    const handleEditCharacter = (updatedCharacter: Character) => {
        setCharacterList(prev =>
            prev.map(char =>
                char.uid === updatedCharacter.uid ? updatedCharacter : char
            )
        );
        setIsEditCharacterDialogOpen(false);
        setSelectedCharacter(null);
        toast({
            title: "修改角色",
            description: `修改角色：${selectedCharacter?.name}`,
        })
    };

    const handleEditCharacterClick = (character: Character) => {
        setSelectedCharacter(character);
        setIsEditCharacterDialogOpen(true);
    };

    const handleAddScene = (scene: string) => {
        setSceneList(prev => [...prev, scene]);
        setIsAddSceneDialogOpen(false);
        toast({
            title: "新增場景",
            description: `新增場景：${scene}`,
        })
    }

    const handleEditScene = (updatedScene: string) => {
        setSceneList(prev =>
            prev.map(scene =>
                scene === selectedScene ? updatedScene : scene
            )
        );
        setIsEditSceneDialogOpen(false);
        setSelectedScene(null);
        toast({
            title: "修改場景",
            description: `修改場景：${selectedScene}`,
        })
    }

    const handleEditSceneClick = (scene: string) => {
        setSelectedScene(scene);
        setIsEditSceneDialogOpen(true);
    }

    useEffect(() => {
        storyForm.setValue("scenes", sceneList);
    }, [sceneList]);

    useEffect(() => {
        storyForm.setValue("characters", characterList);
    }, [characterList]);

    useEffect(() => {
        if (!defaultStory) {
            storyForm.reset();
            storyForm.clearErrors();
            setCharacterList([]);
            setSceneList([]);
            storyForm.setValue("uid", v4());
            storyForm.setValue("title", "");
            storyForm.setValue("outline", "");
            storyForm.setValue("content", "");
            storyForm.setValue("currentScene", "");
        }
        else {
            storyForm.clearErrors();
            storyForm.setValue("uid", defaultStory.uid);
            storyForm.setValue("title", defaultStory.title);
            setCharacterList(defaultStory.characters);
            setSceneList(defaultStory.scenes);
            storyForm.setValue("outline", defaultStory.outline);
            storyForm.setValue("content", defaultStory.content);
            storyForm.setValue("currentScene", defaultStory.currentScene);
        }
    }, [defaultStory])

    // 動態調整 textarea 高度
    useEffect(() => {
        dynamicHeight(outlineRef);
    }, [storyForm.watch('outline')]);

    useEffect(() => {
        dynamicHeight(contentRef);
    }, [storyForm.watch('content')]);

    useEffect(() => {
        dynamicHeight(currentSceneRef);
    }, [storyForm.watch('currentScene')]);

    return (
        <Form {...storyForm}>
            <form onSubmit={storyForm.handleSubmit(handleSubmit)} className="space-y-2">
                <FormField
                    control={storyForm.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input className="border-0 shadow-none" placeholder="輸入故事標題..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={storyForm.control}
                    name="tags"
                    render={({ field }) => {
                        const tags = field.value || [];

                        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                            const input = e.target as HTMLInputElement;
                            const value = input.value;

                            // 當按下逗號或 Enter 時
                            if ((e.key === ',' || e.key === 'Enter') && value.trim()) {
                                e.preventDefault();
                                // 移除可能的逗號
                                const newTag = value.replace(/,/g, '').trim();
                                if (newTag && !tags.includes(newTag)) {
                                    const newTags = [...tags, newTag];
                                    field.onChange(newTags);
                                }
                                input.value = '';
                            }
                        };

                        const removeTag = (tagToRemove: string) => {
                            const newTags = tags.filter(tag => tag !== tagToRemove);
                            field.onChange(newTags);
                        };

                        return (
                            <FormItem>
                                <FormControl>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, _) => (
                                                <Badge
                                                    key={`tag-${v4()}`}
                                                    variant="secondary"
                                                    className="px-3 py-1"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-2 hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <Input
                                            className="border-0 shadow-none"
                                            placeholder="輸入標籤後按 Enter 或逗號..."
                                            onKeyDown={handleKeyDown}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                <AddCharacterDialog
                    open={isAddCharacterDialogOpen}
                    onClose={() => setIsAddCharacterDialogOpen(false)}
                    onAdd={handleAddCharacter}
                />
                <EditCharacterDialog
                    open={isEditCharacterDialogOpen}
                    onClose={() => {
                        setIsEditCharacterDialogOpen(false);
                        setSelectedCharacter(null);
                    }}
                    character={selectedCharacter}
                    onEdit={handleEditCharacter}
                />
                <div className="flex items-center space-x-1">
                    <Label>角色</Label>
                    <Button
                        variant="ghost"
                        className="p-1 h-6 w-6"
                        onClick={() => setIsAddCharacterDialogOpen(true)}
                    >
                        <PlusCircleIcon />
                    </Button>
                </div>
                <div className="flex space-x-2">
                    {characterList.map((character, _) => (
                        <Button
                            variant="ghost"
                            key={`characters-${v4()}`}
                            onClick={() => handleEditCharacterClick(character)}
                        >
                            {character.name}
                        </Button>
                    ))}
                </div>

                <AddSceneDialog
                    open={isAddSceneDialogOpen}
                    onClose={() => setIsAddSceneDialogOpen(false)}
                    onAdd={handleAddScene}
                />
                <EditSceneDialog
                    open={isEditSceneDialogOpen}
                    onClose={() => {
                        setIsEditSceneDialogOpen(false);
                        setSelectedScene(null);
                    }}
                    scene={selectedScene}
                    onEdit={handleEditScene}
                />
                <div className="flex items-center space-x-1">
                    <Label>場景</Label>
                    <Button
                        variant="ghost"
                        className="p-1 h-6 w-6"
                        onClick={() => setIsAddSceneDialogOpen(true)}
                    >
                        <PlusCircleIcon />
                    </Button>
                </div>
                <div className="flex space-x-2">
                    {sceneList.map((scene, _) => (
                        <Button
                            variant="ghost"
                            key={`characters-${v4()}`}
                            onClick={() => handleEditSceneClick(scene)}
                        >
                            {scene}
                        </Button>
                    ))}
                </div>

                <FormField
                    control={storyForm.control}
                    name="outline"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>大綱</FormLabel>
                            <FormControl>
                                <Textarea placeholder="輸入故事大綱..." {...field}
                                    className="h-auto resize-none"
                                    ref={outlineRef}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={storyForm.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>內容</FormLabel>
                            <FormControl>
                                <Textarea placeholder="輸入故事內容..." {...field}
                                    className="h-auto resize-none"
                                    ref={contentRef}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={storyForm.control}
                    name="currentScene"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>當前場景</FormLabel>
                            <FormControl>
                                <Textarea placeholder="輸入當前場景..." {...field}
                                    className="h-auto resize-none"
                                    ref={currentSceneRef}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex items-center justify-end">
                    <Button type="submit">儲存</Button>
                </div>
            </form>
        </Form>
    )
};

export default StoryForm;