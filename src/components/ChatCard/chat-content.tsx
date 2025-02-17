import { ChatMessageBlock, ResponseBlock } from "@/components/chat-message";
import ThinkAccordion from "@/components/think-accordion";
import ThinkingAccordion from "@/components/thinking-accordion";
import { CardContent } from "@/components/ui/card";
import { ChatSessionState } from "@/hooks/use-chat-session";

interface ChatContentProps {
    historyRef: React.RefObject<HTMLDivElement>;
    chatSession: ChatSessionState;
    handleRegenerate: () => void;
}

export const ChatContent: React.FC<ChatContentProps> = ({ historyRef, chatSession, handleRegenerate }) => {

    return (
        <CardContent className="py-1 px-3 max-h-[30rem] overflow-y-auto" ref={historyRef}>
            {/* 聊天訊息歷史 */}
            <div className="flex flex-col space-y-6 p-4">
                {chatSession.messages.map((message, index) => {
                    if (message.role !== 'system') {
                        if ((index !== chatSession.messages.length - 1) || (index === chatSession.messages.length - 1 && message.role === 'user')) {
                            return <ChatMessageBlock handleRegenerate={handleRegenerate} message={message} key={`${message.uid}-${message.timestamp}`} />
                        }
                    }
                }
                )}
            </div>

            {/* 當前串流回應 */}
            {chatSession.isStreaming && (
                <div className="flex flex-col w-full justify-start px-4">
                    {chatSession.isThinking && <ThinkingAccordion think={chatSession.think} isStreaming={chatSession.isStreaming} />}
                    {!chatSession.isThinking && <ThinkAccordion think={chatSession.think} />}
                    <ResponseBlock message={chatSession.responseResult} />
                </div>
            )}
            {!chatSession.isStreaming && chatSession.currentResponse && (
                <div className="flex p-4">
                    <ChatMessageBlock handleRegenerate={handleRegenerate} message={chatSession.messages[chatSession.messages.length - 1]} />
                </div>
            )}
        </CardContent>
    )
}