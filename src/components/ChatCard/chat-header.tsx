import { OllamaModelSelect } from "@/components/ollama-model-select"
import { ThinkingDots } from "@/components/thinking-dots"
import { Button } from "@/components/ui/button"
import { CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DISPLAY_CHAT_SESSION_TITLE_LENGTH, DISPLAY_STORY_COLLECTION_NAME_LENGTH, DISPLAY_STORY_TITLE_LENGTH } from "@/constant"
import { useChatContext } from "@/context/chat-context"
import { useStoryStorage } from "@/hooks/use-story-storage"
import { ChevronDownIcon, LucidePencilLine } from "lucide-react"

interface ChatCardHeaderProps {
    toggleCollapse: () => void
}

export const ChatCardHeader: React.FC<ChatCardHeaderProps> = ({
    toggleCollapse,
}) => {
    const { selectedStory, currentStoryCollectionId, currentStoryCollection } = useStoryStorage();
    const { chatSession, isDarkModeChat, toggleIsDarkModeChat, resetCurrentChatSession, currentModel, setCurrentModel } = useChatContext();
    return (
        <CardHeader className={[
            "h-8 flex flex-row items-center px-3 py-1 space-y-0",
            isDarkModeChat ? "bg-purple-800 text-white" : 'bg-slate-200 text-black',
            "rounded-tl-lg rounded-tr-lg"
        ].join(' ')}>
            <Button variant='ghost' className="px-2 py-0 h-full" title="新對話" onClick={resetCurrentChatSession}>
                <LucidePencilLine className="w-4 h-4" />
            </Button>
            <div className="flex w-full justify-start space-x-8 pl-4">
                <div className="flex flex-row space-x-1 items-center justify-self-start min-w-max">
                    {currentStoryCollectionId === "unorganized" && <span className="text-xs">未分類</span>}
                    {currentStoryCollectionId !== "unorganized" && <span className="text-xs">{
                        currentStoryCollection?.name.slice(0, DISPLAY_STORY_COLLECTION_NAME_LENGTH)
                    }{(
                        currentStoryCollection?.name && currentStoryCollection?.name.length > DISPLAY_STORY_COLLECTION_NAME_LENGTH) ? '...' : ''
                        }</span>}
                    <span>{`/`}</span>
                    {selectedStory && <span className="text-xs">{
                        selectedStory.title.slice(0, DISPLAY_STORY_TITLE_LENGTH)
                    }{selectedStory.title.length > DISPLAY_STORY_TITLE_LENGTH ? '...' : ''
                        }</span>}
                </div>
                <div className="flex flex-row space-x-1 items-center">
                    {chatSession.title && <span className="text-xs">{
                        chatSession.title.slice(0, DISPLAY_CHAT_SESSION_TITLE_LENGTH)
                    }{chatSession.title.length > DISPLAY_CHAT_SESSION_TITLE_LENGTH ? '...' : ''
                        }</span>}
                    {!chatSession.title && chatSession.isTitleStreaming && <ThinkingDots className={[isDarkModeChat ? 'bg-white' : ''].join(' ')} />}
                </div>
            </div>
            <div className="flex flex-row items-center space-x-2">
                <OllamaModelSelect className={[
                    isDarkModeChat ? 'bg-purple-800 text-white' : 'bg-slate-200 text-black',
                ].join(' ')} model={currentModel} onChange={(model: string) => setCurrentModel(model)} />
            </div>
            {toggleIsDarkModeChat && (
                <div className={[
                    "flex items-center mr-2",

                ].join(' ')}>
                    <Label className="p-0 mr-2 text-sm min-w-max">{isDarkModeChat ? "暗黑" : "一般"}模式</Label>
                    <Switch checked={isDarkModeChat} onClick={toggleIsDarkModeChat}
                        className={[
                            isDarkModeChat ? 'bg-purple-800 text-white' : 'bg-slate-200 text-black',
                            'data-[state=checked]:bg-purple-950 data-[state=unchecked]:bg-slate-400',
                        ].join(' ')}
                    />
                </div>
            )}
            <Button variant='ghost' className="justify-self-end px-2 py-0 h-full" title="縮小" onClick={toggleCollapse}>
                <ChevronDownIcon className="w-4 h-4" />
            </Button>
        </CardHeader>
    )
}
