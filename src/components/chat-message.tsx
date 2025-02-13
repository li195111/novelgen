import { IChatMessage } from "@/models/chat";

interface ChatMessageBlockProps {
    message: IChatMessage;
}

export const ChatMessageBlock: React.FC<ChatMessageBlockProps> = ({ message }) => {
    return (
        <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} key={`${message.uid}-${message.timestamp}`} >
            <div className={`text-sm min-h-4 border-0 shadow-none resize-none focus-visible:ring-0 overflow-hidden bg-transparent`}>
                {message.content.split('\n').map((line, index) => (
                    <div key={`${message.uid}-${index}`} className="flex w-full">
                        <p>{line}</p>
                        <br />
                    </div>
                ))}
            </div>
        </div>
    )
}