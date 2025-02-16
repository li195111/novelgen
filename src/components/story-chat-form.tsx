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
import { z } from "zod";

export const StoryChatSchema = z.object({
    chatMessage: z.string().nonempty("請輸入劇情內容"),
});
export type StoryType = z.infer<typeof StoryChatSchema>;

interface StoryChatFormProps {
    chatSession: ChatSessionState;
    handleStop?: () => void;
    handleSubmit: (values: any) => void;
    handleStorySuggestion: (values: any) => void;
}

export const StoryChatForm: React.FC<StoryChatFormProps> = ({ chatSession, handleStop, handleSubmit, handleStorySuggestion }) => {
    const { selectedStory } = useCurrentStoryStorage();
    const [submitAction, setSubmitAction] = useState('normal');

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

    return (
        <Form {...storyForm}>
            <form onSubmit={storyForm.handleSubmit((v) => {
                if (submitAction === 'story-gen') {
                    handleStorySuggestion(v);
                } else {
                    handleSubmit(v);
                }
                storyForm.reset();
                setSubmitAction('normal');
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
                    <Button
                        type="submit"
                        variant="ghost"
                        className="rounded-full bg-slate-200 hover:bg-slate-300 h-6 text-xs px-2 py-0"
                        disabled={!selectedStory}
                        onClick={() => {
                            setSubmitAction('story-gen');
                            storyForm.setValue('chatMessage', `<title>${selectedStory?.title}</title>
                                <tags>${JSON.stringify(selectedStory?.tags)}</tags>
                                <characters>${JSON.stringify(selectedStory?.characters)}</characters>
                                <scene>${JSON.stringify(selectedStory?.scenes)}</scene>
                                <outline>${selectedStory?.outline}</outline>
                                <currentScene>${selectedStory?.currentScene}</currentScene>`);
                        }}
                    >
                        產生故事建議
                    </Button>
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
