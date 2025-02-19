interface ThinkingDotsProps {
    className?: string
}

export const ThinkingDots: React.FC<ThinkingDotsProps> = ({ className }) => {
    return (
        <div className="flex space-x-1">
            <div className={["w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]", className].join(' ')}></div>
            <div className={["w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]", className].join(' ')}></div>
            <div className={["w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce", className].join(' ')}></div>
        </div>
    );
};