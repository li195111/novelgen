import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const StoryChatSchema = z.object({
    addStory: z.string()
});
export type StoryType = z.infer<typeof StoryChatSchema>;

interface StoryChatFormProps {
    handleSubmit: (values: any) => void;
}

export const StoryChatForm: React.FC<StoryChatFormProps> = ({ handleSubmit }) => {

    const storyForm = useForm<StoryType>({
        resolver: zodResolver(StoryChatSchema),
        defaultValues: {
            addStory: ""
        }
    });

    return (
        <Form {...storyForm}>
            <form onSubmit={storyForm.handleSubmit((v) => {
                handleSubmit(v);
                storyForm.reset();
            })} className="flex w-full items-center">
                <FormField
                    control={storyForm.control}
                    name="addStory"
                    render={({ field }) => (
                        <FormItem className="flex w-full pr-2">
                            <FormControl>
                                <Textarea className="min-h-10 border-0 shadow-none resize-none focus:outline-none focus-visible:ring-0" placeholder="輸入劇情..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex mx-2">
                    <Button type="submit" className="w-9 rounded-full">
                        <SendIcon />
                    </Button>
                </div>
            </form>
        </Form>
    )

}

export default StoryChatForm;