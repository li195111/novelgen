import { SubmitAction } from "@/components/ChatCard/chat-card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ChatSessionState } from "@/hooks/use-chat-session";
import { useCurrentStoryStorage } from "@/hooks/use-current-story-storage";
import { dynamicHeight } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendIcon, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { TypeOf, z } from "zod";

export const StoryChatSchema = z.object({
    chatMessage: z.string().nonempty("請輸入劇情內容"),
});
export type StoryType = z.infer<typeof StoryChatSchema>;

interface StoryChatFormProps {
    chatSession: ChatSessionState;
    handleStop?: () => void;
    submitMap: React.MutableRefObject<{
        [key: string]: (values: TypeOf<typeof StoryChatSchema>, darkMode?: boolean) => Promise<void>;
    }>;
    isDarkModeChat?: boolean;
}

export const StoryChatForm: React.FC<StoryChatFormProps> = ({ chatSession, handleStop, submitMap, isDarkModeChat }) => {
    const { selectedStory } = useCurrentStoryStorage();
    const [storyValue, setStoryValue] = useState<string>('');

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
                submitMap.current[SubmitAction.normal]?.(v);
                storyForm.reset();
            })} className="flex flex-col w-full space-y-1">
                <FormField
                    control={storyForm.control}
                    name="chatMessage"
                    render={({ field }) => (
                        <FormItem className="flex w-full">
                            <FormControl>
                                <Textarea
                                    className="p-0 px-2 min-h-4 h-4 border-0 shadow-none resize-none focus:outline-none focus-visible:ring-0"
                                    placeholder="輸入劇情..." {...field}
                                    onKeyDown={handleKeyDown}
                                    ref={chatMessageRef}
                                />
                            </FormControl>
                            <FormMessage className="min-w-max" />
                        </FormItem>
                    )}
                />
                <div className="flex w-full justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full bg-slate-200 hover:bg-slate-300 h-6 text-xs px-2 py-0"
                            disabled={!selectedStory}
                            onClick={() => submitMap.current[SubmitAction.storySuggestion]?.({ chatMessage: storyValue }, isDarkModeChat)}
                        >
                            產生故事建議
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full bg-slate-200 hover:bg-slate-300 h-6 text-xs px-2 py-0"
                            onClick={() => submitMap.current[SubmitAction.storySceneSuggestion]?.({ chatMessage: storyValue }, isDarkModeChat)}
                        >
                            產生場景建議
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full bg-slate-200 hover:bg-slate-300 h-6 text-xs px-2 py-0"
                        >
                            產生故事大綱
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full bg-slate-200 hover:bg-slate-300 h-6 text-xs px-2 py-0"
                        >
                            增加以下劇情
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full bg-slate-200 hover:bg-slate-300 h-6 text-xs px-2 py-0"
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
            </form>
        </Form>
    )

}
