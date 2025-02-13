import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({ content }: { content?: string }) => {
    if (!content) {
        return null;
    }
    return (
        <div className="prose prose-sm dark:prose-invert max-w-full">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
