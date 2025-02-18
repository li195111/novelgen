import { SubmitAction } from "@/components/ChatCard/chat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChatSessionState } from "@/hooks/use-chat-session";
import { useCurrentStoryStorage } from "@/hooks/use-current-story-storage";
import { cn } from "@/lib/utils";
import { dynamicHeight } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendIcon, StopCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import { TypeOf, z } from "zod";

export const StoryChatSchema = z.object({
    chatMessage: z.string().nonempty("請輸入劇情內容"),
});
export type StoryType = z.infer<typeof StoryChatSchema>;

type ChatTag = "Story";

interface StoryChatFormProps {
    chatSession: ChatSessionState;
    handleStop?: () => void;
    submitMap: React.MutableRefObject<{
        [key: string]: (values: TypeOf<typeof StoryChatSchema>, story?: string, darkMode?: boolean) => Promise<void>;
    }>;
    isDarkModeChat?: boolean;
}

export const StoryChatForm: React.FC<StoryChatFormProps> = ({ chatSession, handleStop, submitMap, isDarkModeChat }) => {
    const { selectedStory } = useCurrentStoryStorage();
    const [storyValue, setStoryValue] = useState<string>('');
    const [chatTagList, setChatTagList] = useState<(string | ChatTag)[]>(['Story']);
    const [useChatTagList, setUseChatTagList] = useState<(string | ChatTag)[]>([]);

    const chatMessageRef = useRef<HTMLTextAreaElement>(null);
    const submitRef = useRef<HTMLButtonElement>(null);

    const storyForm = useForm<StoryType>({
        resolver: zodResolver(StoryChatSchema),
        defaultValues: {
            chatMessage: ""
        }
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // 阻止默認換行行為
            if (submitRef.current) {
                submitRef.current.click();
            }
        }
    }

    const handleAddChatTag = (tag: string) => () => {
        if (!useChatTagList.includes(tag)) {
            setUseChatTagList([...useChatTagList, tag]);
        }
    };

    const removeUseChatTag = (tagToRemove: string) => {
        const newTags = useChatTagList.filter(tag => tag !== tagToRemove);
        setUseChatTagList(newTags);
    };

    useEffect(() => {
        dynamicHeight(chatMessageRef);
    }, [storyForm.watch('chatMessage')]);

    useEffect(() => {
        setStoryValue(`<title>${selectedStory?.title}</title>
            <tags>${JSON.stringify(selectedStory?.tags)}</tags>
            <characters>${JSON.stringify(selectedStory?.characters.map(({ uid, ...rest }) => (
            `<info>\n- 名稱：${rest.name}\n- 身高: ${rest.height}公分\n- 體重: ${rest.weight}公斤\n- 身材: ${rest.bodyDesc}\n- 職業: ${rest.job}\n- 個性: ${rest.personality}\n- 日常: ${rest.otherDesc}\n- 經歷: ${rest.experience}\n</info>`)), null)}
            </characters>
            <scene>${JSON.stringify(selectedStory?.scenes)}</scene>
            <outline>${selectedStory?.outline}</outline>
            <currentScene>${selectedStory?.currentScene}</currentScene>`)
    }, [selectedStory]);

    return (
        <Form {...storyForm}>
            <form onSubmit={storyForm.handleSubmit((v) => {
                let storyInfo = undefined;
                if (useChatTagList.includes('Story')) {
                    storyInfo = storyValue;
                }
                submitMap.current[SubmitAction.normal]?.(v, storyInfo, isDarkModeChat);
                storyForm.reset();
            })} className="flex flex-col w-full space-y-1">
                <div>
                    {useChatTagList.map((tag) => (
                        <Badge
                            key={`tag-${v4()}`}
                            variant="secondary"
                            className={[
                                "p-0 m-0 h-6 px-1 py-1 mx-1",
                                isDarkModeChat ? "bg-purple-500 hover:bg-purple-700 text-white" : "bg-slate-300 hover:bg-slate-400 text-black",
                            ].join(' ')}
                        >
                            {tag}
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeUseChatTag(tag)}
                                className={[
                                    "p-0 m-0 ml-1 hover:text-destructive",
                                    "bg-transparent hover:bg-transparent",
                                ].join(' ')}
                                asChild
                            >
                                <X size={14} className="h-full hover:cursor-pointer" />
                            </Button>
                        </Badge>
                    ))}
                </div>
                <FormField
                    control={storyForm.control}
                    name="chatMessage"
                    render={({ field }) => (
                        <FormItem className="flex w-full">
                            <FormControl>
                                <Textarea
                                    className={[
                                        "p-0 px-2 min-h-4 h-4 border-0 shadow-none resize-none focus:outline-none focus-visible:ring-0",
                                        isDarkModeChat ? 'placeholder:text-gray-400' : 'placeholder:text-gray-500',

                                    ].join(' ')}
                                    placeholder="輸入劇情..." {...field}
                                    onKeyDown={handleKeyDown}
                                    ref={chatMessageRef}
                                />
                            </FormControl>
                            <FormMessage className="min-w-max" />
                        </FormItem>
                    )}
                />
                <div>
                    <Label className="text-sm font-bold">元素:</Label>
                    {chatTagList.map((tag) => (
                        <Badge
                            key={`tag-${v4()}`}
                            variant="secondary"
                            className={cn(
                                "p-0 m-0 h-6 px-1 py-1 mx-1",
                                isDarkModeChat ? "bg-purple-500 hover:bg-purple-700 text-white" : "bg-slate-300 hover:bg-slate-400 text-black",
                                useChatTagList.includes(tag) && [
                                    isDarkModeChat ? "bg-purple-700 hover:bg-purple-700" : "bg-slate-400 hover:bg-slate-400",
                                    "hover:cursor-not-allowed"
                                ],
                                !useChatTagList.includes(tag) && [
                                    isDarkModeChat ? "bg-purple-500 hover:bg-purple-700" : "bg-slate-300 hover:bg-slate-400",
                                    "hover:cursor-pointer"
                                ]
                            )}
                            onClick={handleAddChatTag(tag)}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
                <div className="flex w-full justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className={[
                                "rounded-full h-6 text-xs px-2 py-0",
                                isDarkModeChat ? "bg-purple-500 hover:bg-purple-700 hover:text-white" : "bg-slate-300 hover:bg-slate-400",
                            ].join(' ')}
                            disabled={!selectedStory}
                            onClick={() => {
                                handleAddChatTag('Story')();
                                submitMap.current[SubmitAction.storySuggestion]?.({ chatMessage: storyForm.getValues('chatMessage') ?? "" }, storyValue, isDarkModeChat)
                                storyForm.reset();
                            }}
                        >
                            產生故事建議
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className={[
                                "rounded-full h-6 text-xs px-2 py-0",
                                isDarkModeChat ? "bg-purple-500 hover:bg-purple-700 hover:text-white" : "bg-slate-300 hover:bg-slate-400",
                            ].join(' ')}
                            disabled={!selectedStory}
                            onClick={() => {
                                handleAddChatTag('Story')();
                                submitMap.current[SubmitAction.storySceneSuggestion]?.({ chatMessage: storyForm.getValues('chatMessage') ?? "" }, storyValue, isDarkModeChat);
                                storyForm.reset();
                            }}
                        >
                            產生場景建議
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className={[
                                "rounded-full h-6 text-xs px-2 py-0",
                                isDarkModeChat ? "bg-purple-500 hover:bg-purple-700 hover:text-white" : "bg-slate-300 hover:bg-slate-400",
                            ].join(' ')}
                            disabled={!selectedStory || true}
                        >
                            產生故事大綱
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className={[
                                "rounded-full h-6 text-xs px-2 py-0",
                                isDarkModeChat ? "bg-purple-500 hover:bg-purple-700 hover:text-white" : "bg-slate-300 hover:bg-slate-400",
                            ].join(' ')}
                            disabled={!selectedStory}
                            onClick={() => {
                                if (!storyForm.getValues('chatMessage')) {
                                    storyForm.trigger('chatMessage');
                                    return;
                                }
                                handleAddChatTag('Story')();
                                submitMap.current[SubmitAction.storyContentExtend]?.({ chatMessage: storyForm.getValues('chatMessage') ?? "" }, storyValue, isDarkModeChat);
                                storyForm.reset();
                            }}
                        >
                            增加以下劇情
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className={[
                                "rounded-full h-6 text-xs px-2 py-0",
                                isDarkModeChat ? "bg-purple-500 hover:bg-purple-700 hover:text-white" : "bg-slate-300 hover:bg-slate-400",
                            ].join(' ')}
                            disabled={!selectedStory}
                            onClick={() => {
                                if (!storyForm.getValues('chatMessage')) {
                                    storyForm.trigger('chatMessage');
                                    return;
                                }
                                handleAddChatTag('Story')();
                                submitMap.current[SubmitAction.storyContentModifyAndExtend]?.({ chatMessage: storyForm.getValues('chatMessage') ?? "" }, storyValue, isDarkModeChat);
                                storyForm.reset();
                            }}
                        >
                            改寫並增加後續劇情
                        </Button>
                    </div>
                    <Button
                        type="submit"
                        className="w-9 rounded-full"
                        onClick={chatSession.isStreaming ? handleStop : undefined}
                        ref={chatSession.isStreaming ? undefined : submitRef}
                    >
                        {chatSession.isStreaming && <StopCircle className="text-red-500" />}
                        {!chatSession.isStreaming && chatSession.isStreaming !== undefined && <SendIcon />}
                    </Button>
                </div>
            </form >
        </Form >
    )

}
