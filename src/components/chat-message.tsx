import { IChatMessage } from "@/models/chat";
import { v4 } from "uuid";

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

interface ResponseBlockProps {
    message: string;
}

export const ResponseBlock: React.FC<ResponseBlockProps> = ({ message }) => {
    return (
        <div className={`flex w-full justify-start`}>
            <div className={`text-sm min-h-4 border-0 shadow-none resize-none focus-visible:ring-0 overflow-hidden bg-transparent`}>
                {message.split('\n').map((line, index) => (
                    <div key={`${v4()}-${index}`} className="flex w-full">
                        <p>{line}</p>
                        <br />
                    </div>
                ))}
            </div>
        </div>
    )
}