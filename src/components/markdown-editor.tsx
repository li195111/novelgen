import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
    className?: string;
    placeholder?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    fields?: ControllerRenderProps<FieldValues, string>;
    ref?: React.Ref<HTMLTextAreaElement>;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ className, placeholder, onKeyDown, fields, ref }) => {
    const [markdown, setMarkdown] = useState<string>("# Hello Markdown!");

    return (
        <div className="flex flex-col md:flex-row gap-4 p-4">
            {/* Markdown 編輯區 */}
            <Textarea
                className={className ?? "w-full md:w-1/2 h-64 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder ?? "輸入 Markdown 內容..."}
                {...fields}
                ref={ref}
            />

            {/* Markdown 預覽區 */}
            <div className="w-full md:w-1/2 p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <div className="prose prose-base dark:prose-invert max-w-full">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default MarkdownEditor;
