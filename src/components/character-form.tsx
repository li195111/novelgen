"use client";

import "@/App.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DialogFooter
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useStoryStorage } from "@/hooks/use-story-storage";
import { Character } from "@/models/character";
import { CHARACTER_INFO_PROMPT } from "@/prompts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import { z } from "zod";

export const CharacterSchema = z.object({
    uid: z.string().nonempty(),
    name: z.string().nonempty(),
    sex: z.string().nonempty(),
    age: z.number().min(0).or(z.string()).optional(),
    height: z.number().or(z.string()).optional(),
    weight: z.number().or(z.string()).optional(),
    bodyDesc: z.string().optional(),
    job: z.string().optional(),
    personality: z.string().optional(),
    otherDesc: z.string().optional(),
    experience: z.string().optional(),
    currentStatusDesc: z.string().optional(),
    currentScene: z.string().optional(),
});
export type CharacterType = z.infer<typeof CharacterSchema>;


interface CharacterFormProps {
    defaultCharacter?: Character;
    handleSubmit: (values: any) => void;
    handleDelete?: () => void;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({ defaultCharacter, handleSubmit, handleDelete }) => {
    const { storyState } = useStoryStorage();
    const [currentCharacter, setCurrentCharacter] = useState<Character | null>(defaultCharacter || null);
    const [userCharacterMap, setUserCharacterMap] = useState<Map<string, Character>>(() => {
        const initialMap = new Map<string, Character>();
        [...storyState.unorganizedStories, ...storyState.collections.flatMap(c => c.stories)].flatMap(s => s.characters).forEach(c => {
            initialMap.set(c.uid, c);
        });
        return initialMap;
    });

    const characterForm = useForm<CharacterType>({
        resolver: zodResolver(CharacterSchema),
        defaultValues: {
            uid: currentCharacter?.uid ?? v4(),
            name: currentCharacter?.name ?? "",
            sex: currentCharacter?.sex ?? "male",
            age: currentCharacter?.age ?? "",
            height: currentCharacter?.height ?? "",
            weight: currentCharacter?.weight ?? "",
            bodyDesc: currentCharacter?.bodyDesc ?? "",
            job: currentCharacter?.job ?? "",
            personality: currentCharacter?.personality ?? "",
            otherDesc: currentCharacter?.otherDesc ?? "",
            experience: currentCharacter?.experience ?? "",
            currentStatusDesc: currentCharacter?.currentStatusDesc ?? "",
            currentScene: currentCharacter?.currentScene ?? "",
        }
    });

    const handleCharacterOnClick = (character: Character) => {
        setCurrentCharacter(character);
        characterForm.reset({
            uid: character.uid,
            name: character.name,
            sex: character.sex,
            age: character.age,
            height: character.height,
            weight: character.weight,
            bodyDesc: character.bodyDesc,
            job: character.job,
            personality: character.personality,
            otherDesc: character.otherDesc,
            experience: character.experience,
            currentStatusDesc: character.currentStatusDesc,
            currentScene: character.currentScene,
        })
    }

    useEffect(() => {
        setUserCharacterMap((prev) => {
            [...storyState.unorganizedStories, ...storyState.collections.flatMap(c => c.stories)].flatMap(s => s.characters).forEach(c => {
                prev.set(c.uid, c);
            });
            return prev;
        })
    }, [storyState])

    return (
        <div className="flex flex-col w-full">
            <div className="flex items-center space-x-2">
                <Label className="min-w-max">角色清單</Label>
                <div className="flex items-center space-x-2 max-w-[24rem] overflow-x-auto">
                    {Array.from(userCharacterMap.values()).map((c) => (
                        <Button key={c.name} asChild className="p-0 m-0 h-4">
                            <Badge
                                className="bg-slate-500 px-2 py-3 hover:cursor-pointer"
                                onClick={() => handleCharacterOnClick(c)}
                            >
                                {c.name}
                            </Badge>
                        </Button>
                    ))}
                </div>
            </div>
            <Form {...characterForm} >
                <form onSubmit={characterForm.handleSubmit(handleSubmit)} className="space-y-2">
                    <FormField
                        control={characterForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                                <FormLabel className="min-w-max"><span className="text-red-600">*</span>角色名稱</FormLabel>
                                <FormControl>
                                    <Input placeholder="輸入角色名稱..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex items-center space-x-2">
                        <div className="flex flex-col space-y-2">
                            <FormField
                                control={characterForm.control}
                                name="sex"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormLabel className="min-w-max">生理性別</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex space-x-1">
                                                <FormItem className="flex items-center space-x-1">
                                                    <FormControl>
                                                        <RadioGroupItem value={"male"} id="male" />
                                                    </FormControl>
                                                    <FormLabel className="min-w-max" htmlFor="male">男</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-1">
                                                    <FormControl>
                                                        <RadioGroupItem value={"female"} id="female" />
                                                    </FormControl>
                                                    <FormLabel className="min-w-max" htmlFor="female">女</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-1">
                                                    <FormControl>
                                                        <RadioGroupItem value={"intersexual"} id="intersexual" />
                                                    </FormControl>
                                                    <FormLabel className="min-w-max" htmlFor="intersexual">雙性</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={characterForm.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormLabel className="min-w-max">年齡</FormLabel>
                                        <FormControl>
                                            <Input placeholder="輸入年齡..." {...field} />
                                        </FormControl>
                                        <FormLabel>歲</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-col">
                            <FormField
                                control={characterForm.control}
                                name="height"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormLabel className="min-w-max">身高</FormLabel>
                                        <FormControl>
                                            <Input placeholder="輸入身高..." {...field} />
                                        </FormControl>
                                        <FormLabel>CM</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={characterForm.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormLabel className="min-w-max">體重</FormLabel>
                                        <FormControl>
                                            <Input placeholder="輸入體重..." {...field} />
                                        </FormControl>
                                        <FormLabel>KG</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <FormField
                        control={characterForm.control}
                        name="job"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                                <FormLabel className="min-w-max">職業</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="描述職業 e.g.網拍模特兒、YouTuber、健身教練 ..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={characterForm.control}
                        name="bodyDesc"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-start">
                                <FormLabel className="min-w-max">外觀描述</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="描述身材 e.g. 三圍38E 42 88, 壯碩、腹肌..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={characterForm.control}
                        name="personality"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-start">
                                <FormLabel className="min-w-max">個性</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="描述個性 e.g.可愛、害羞、倔強 ..."
                                        {...field}
                                        className=""
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={characterForm.control}
                        name="otherDesc"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-start">
                                <FormLabel className="min-w-max">其他描述</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="與家人同住、一個弟弟 ..." {...field} className="min-h-32" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={characterForm.control}
                        name="experience"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-start">
                                <FormLabel className="min-w-[7rem]">經歷</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="拍過主題影片、尾牙表演..." {...field} className="min-h-32" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <DialogFooter className="flex justify-between">
                        <div className="flex w-full">
                            <Button
                                type="button"
                                onClick={() => {
                                    const { uid, currentStatusDesc, currentScene, ...character } = characterForm.getValues();
                                    console.log(JSON.stringify(character));
                                }}
                            >
                                印出
                            </Button>
                        </div>
                        <div className="flex min-w-max space-x-2">
                            <Button
                                type="button"
                                className="bg-red-600 opacity-80"
                                onClick={() => {
                                    if (handleDelete) {
                                        handleDelete();
                                    }
                                }}
                            >
                                刪除
                            </Button>
                            <Button type="button" onClick={() => {
                                handleSubmit(characterForm.getValues());
                            }}>
                                {defaultCharacter ? "修改" : "新增"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </Form>
        </div>
    );
}
