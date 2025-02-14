import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { dynamicHeight } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendIcon, StopCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const StoryChatSchema = z.object({
    chatMessage: z.string().nonempty("請輸入劇情內容"),
});
export type StoryType = z.infer<typeof StoryChatSchema>;

interface StoryChatFormProps {
    isStreaming?: boolean;
    handleStop?: () => void;
    handleSubmit: (values: any) => void;
}

export const StoryChatForm: React.FC<StoryChatFormProps> = ({ isStreaming, handleStop, handleSubmit }) => {
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
                handleSubmit(v);
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
                <div className="flex w-full justify-end">
                    <Button
                        type="submit"
                        className="w-9 rounded-full"
                        onClick={isStreaming ? handleStop : undefined}
                        ref={isStreaming ? undefined : submitRef}
                    >
                        {isStreaming && <StopCircle className="text-red-500" />}
                        {!isStreaming && isStreaming !== undefined && <SendIcon />}
                    </Button>
                </div>
            </form>
        </Form>
    )

}
