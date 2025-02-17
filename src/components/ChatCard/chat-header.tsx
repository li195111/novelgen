import { ThinkingDots } from "@/components/thinking-dots"
import { Button } from "@/components/ui/button"
import { CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChatSessionState } from "@/hooks/use-chat-session"
import { useCurrentStoryStorage } from "@/hooks/use-current-story-storage"
import { ChevronDownIcon, LucidePencilLine } from "lucide-react"

interface ChatCardHeaderProps {
    chatSession: ChatSessionState
    toggleCollapse: () => void
    handleNewChatSession: () => void
    isDarkModeChat?: boolean
    toggleIsDarkModeChat?: () => void
}

export const ChatCardHeader: React.FC<ChatCardHeaderProps> = ({ chatSession, toggleCollapse, handleNewChatSession, isDarkModeChat, toggleIsDarkModeChat }) => {
    const { selectedStory, currentStoryCollectionId, currentStoryCollection } = useCurrentStoryStorage();
    return (
        <CardHeader className="h-8 flex flex-row items-center px-3 py-1 space-y-0 bg-slate-200 rounded-tl-lg rounded-tr-lg">
            <Button variant='ghost' className="px-2 py-0 h-full" title="新對話" onClick={handleNewChatSession}>
                <LucidePencilLine className="w-4 h-4" />
            </Button>
            <div className="flex w-full justify-start space-x-8 pl-4">
                <div className="flex flex-row space-x-1 items-center justify-self-start">
                    {currentStoryCollectionId === "unorganized" && <span className="text-xs text-gray-500">未分類</span>}
                    {currentStoryCollectionId !== "unorganized" && <span className="text-xs text-gray-500">{currentStoryCollection?.name}</span>}
                    <span>{`/`}</span>
                    {selectedStory && <span className="text-xs text-gray-500">{selectedStory.title}</span>}
                </div>
                <div className="flex flex-row space-x-1 items-center">
                    {chatSession.title && <span className="text-xs text-gray-500">{chatSession.title.slice(0, 20)}</span>}
                    {!chatSession.title && chatSession.isTitleStreaming && <ThinkingDots />}
                </div>
            </div>
            {toggleIsDarkModeChat && (
                <div>
                    <div className="flex items-center">
                        <Label className="p-0 mr-2 text-sm min-w-max">{isDarkModeChat ? "暗黑" : "一般"}模式</Label>
                        <Switch checked={isDarkModeChat} onClick={toggleIsDarkModeChat} />
                    </div>
                </div>)}
            <Button variant='ghost' className="justify-self-end px-2 py-0 h-full" title="縮小" onClick={toggleCollapse}>
                <ChevronDownIcon className="w-4 h-4" />
            </Button>
        </CardHeader>
    )
}
