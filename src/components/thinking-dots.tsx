
interface ThinkingDotsProps {
}

export const ThinkingDots: React.FC<ThinkingDotsProps> = () => {
    return (
        <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
        </div>
    );
};