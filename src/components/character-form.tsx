"use client";

import "@/App.css";
import { Button } from "@/components/ui/button";
import {
    DialogFooter
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Character } from "@/models/character";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import { z } from "zod";

export const CharacterSchema = z.object({
    uid: z.string().nonempty(),
    name: z.string().nonempty(),
    sex: z.string().nonempty(),
    age: z.number().min(0).optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
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
}

export const CharacterForm: React.FC<CharacterFormProps> = ({ defaultCharacter, handleSubmit }) => {

    const characterForm = useForm<CharacterType>({
        resolver: zodResolver(CharacterSchema),
        defaultValues: {
            uid: defaultCharacter?.uid ?? v4(),
            name: defaultCharacter?.name ?? "",
            sex: defaultCharacter?.sex ?? "male",
            age: defaultCharacter?.age ?? undefined,
            height: defaultCharacter?.height ?? undefined,
            weight: defaultCharacter?.weight ?? undefined,
            bodyDesc: defaultCharacter?.bodyDesc ?? "",
            job: defaultCharacter?.job ?? "",
            personality: defaultCharacter?.personality ?? "",
            otherDesc: defaultCharacter?.otherDesc ?? "",
            experience: defaultCharacter?.experience ?? "",
            currentStatusDesc: defaultCharacter?.currentStatusDesc ?? "",
            currentScene: defaultCharacter?.currentScene ?? "",
        }
    });

    return (
        <Form {...characterForm} >
            <form onSubmit={characterForm.handleSubmit(handleSubmit)} className="space-y-2">
                <FormField
                    control={characterForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                            <FormLabel className="min-w-max">角色名稱</FormLabel>
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
                                            defaultValue={field.value}
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
                                    <FormLabel className="min-w-max">年齡 (Optional)</FormLabel>
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
                                    <FormLabel className="min-w-max">身高 (Optional)</FormLabel>
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
                                    <FormLabel className="min-w-max">體重 (Optional)</FormLabel>
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
                    name="bodyDesc"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                            <FormLabel className="min-w-max">身材 (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="描述身材 e.g. 三圍38E 42 88, 壯碩、腹肌..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={characterForm.control}
                    name="job"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                            <FormLabel className="min-w-max">職業 (Optional)</FormLabel>
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
                    name="personality"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                            <FormLabel className="min-w-max">個性 (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="描述個性 e.g.可愛、害羞、倔強 ..."
                                    {...field}
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
                        <FormItem className="flex items-center space-x-2">
                            <FormLabel className="min-w-max">其他描述 (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="與家人同住、一個弟弟 ..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={characterForm.control}
                    name="experience"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                            <FormLabel className="min-w-max">經歷 (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="拍過主題影片、尾牙表演..." {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="submit" className="bg-green-600">
                        {defaultCharacter ? "修改" : "新增"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
