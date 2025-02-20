import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
    className?: string;
    content?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ className, content }) => {
    if (!content) {
        return null;
    }
    return (
        <div className={["prose prose-sm dark:prose-invert max-w-full", className].join(" ")}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
