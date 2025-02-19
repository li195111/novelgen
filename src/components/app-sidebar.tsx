import { DraggableStoryItem } from "@/components/app-sidebar-draggable-story-item";
import { DeleteStoryAlertDialog } from "@/components/delete-story-alert-dialog";
import { DeleteStoryCollectionAlertDialog } from "@/components/delete-story-collection-alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenuButton
} from "@/components/ui/sidebar";
import { useChatStorage } from "@/hooks/use-chat-storage";
import { useCurrentStoryStorage } from "@/hooks/use-current-story-storage";
import { Chat } from "@/models/chat";
import { ChatCollection } from "@/models/chat-collection";
import { Story } from "@/models/story";
import { StoryCollection } from "@/models/story-collection";
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ChevronDown, MoreHorizontal, PenLineIcon, PlusCircleIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Link } from 'react-router-dom';
import { DraggableChatItem } from "./app-sidebar-draggable-chat-item";
import { DeleteChatAlertDialog } from "./delete-chat-alert-dialog";
import { DeleteChatCollectionAlertDialog } from "./delete-chat-collection-alert-dialog";

export function AppSidebar() {
    const { storyState, setStoryState, selectedStory, setCurrentStoryUid, currentStoryCollection, setCurrentStoryCollection,
        handleAddStoryCollection, handleDeleteSelectedStory, handleDeleteCurrentStoryCollection } = useCurrentStoryStorage();
    const [deleteCollectionAlertOpen, setDeleteCollectionAlertOpen] = useState(false);
    const [deleteStoryAlertOpen, setDeleteStoryAlertOpen] = useState(false);

    const { chatState, setChatState, selectedChat, setCurrentChatUid, currentChatCollection, setCurrentChatCollection,
        handleDeleteCurrentChatCollection, handleDeleteSelectedChat,
    } = useChatStorage();
    const [deleteChatCollectionAlertOpen, setDeleteChatCollectionAlertOpen] = useState(false);
    const [deleteChatAlertOpen, setDeleteChatAlertOpen] = useState(false);

    const onAddStoryCollectionClick = () => {
        handleAddStoryCollection();
    };

    const onDeleteStoryCollectionClick = (collection: StoryCollection) => {
        setCurrentStoryCollection(collection);
        setDeleteCollectionAlertOpen(true);
    };

    const onDeleteCollection = () => {
        handleDeleteCurrentStoryCollection();
    }

    const handleDeleteStory = (story: Story) => {
        setCurrentStoryUid(story.uid);
        setDeleteStoryAlertOpen(true);
    };

    const onDeleteStory = () => {
        handleDeleteSelectedStory();
    };

    const onDeleteChatCollectionClick = (collection: ChatCollection) => {
        setCurrentChatCollection(collection);
        setDeleteChatCollectionAlertOpen(true);
    }

    const onDeleteChatCollection = () => {
        handleDeleteCurrentChatCollection();
    }

    const handleDeleteChat = (chat: Chat) => {
        setCurrentChatUid(chat.uid);
        setDeleteChatAlertOpen(true);
    }

    const onDeleteChat = () => {
        handleDeleteSelectedChat();
    }

    const handleDragStoryEnd = (result: DropResult): void => {
        const { source, destination } = result;

        if (!destination) return;

        const newState = { ...storyState };

        // 獲取來源故事
        let sourceStories: Story[] = [];
        let sourceIndex: number;

        if (source.droppableId === 'unorganized') {
            sourceStories = newState.unorganizedStories;
            sourceIndex = source.index;
        } else {
            const sourceCollection = newState.collections.find(c => c.id === source.droppableId);
            if (!sourceCollection) return;
            sourceStories = sourceCollection.stories;
            sourceIndex = source.index;
        }

        // 獲取目標位置
        let destinationStories: Story[] = [];
        let destinationIndex: number;

        if (destination.droppableId === 'unorganized') {
            destinationStories = newState.unorganizedStories;
            destinationIndex = destination.index;
        } else {
            const destinationCollection = newState.collections.find(c => c.id === destination.droppableId);
            if (!destinationCollection) return;
            destinationStories = destinationCollection.stories;
            destinationIndex = destination.index;
        }

        // 移動故事
        const [movedStory] = sourceStories.splice(sourceIndex, 1);
        destinationStories.splice(destinationIndex, 0, movedStory);

        setStoryState(newState);
    };

    const handleDragChatEnd = (result: DropResult): void => {
        const { source, destination } = result;

        if (!destination) return;

        const newState = { ...chatState };

        // 獲取來源對話
        let sourceChats: Chat[] = [];
        let sourceIndex: number;

        if (source.droppableId === 'unorganized') {
            sourceChats = newState.unorganizedStories;
            sourceIndex = source.index;
        } else {
            const sourceCollection = newState.collections.find(c => c.id === source.droppableId);
            if (!sourceCollection) return;
            sourceChats = sourceCollection.chats;
            sourceIndex = source.index;
        }

        // 獲取目標位置
        let destinationChats: Chat[] = [];
        let destinationIndex: number;

        if (destination.droppableId === 'unorganized') {
            destinationChats = newState.unorganizedStories;
            destinationIndex = destination.index;
        } else {
            const destinationCollection = newState.collections.find(c => c.id === destination.droppableId);
            if (!destinationCollection) return;
            destinationChats = destinationCollection.chats;
            destinationIndex = destination.index;
        }

        // 移動對話
        const [movedChat] = sourceChats.splice(sourceIndex, 1);
        destinationChats.splice(destinationIndex, 0, movedChat);

        setChatState(newState);
    };

    return (
        <Sidebar>
            <DeleteStoryCollectionAlertDialog
                isOpen={deleteCollectionAlertOpen}
                onClose={() => setDeleteCollectionAlertOpen(!deleteCollectionAlertOpen)}
                selectedCollection={currentStoryCollection}
                onDelete={onDeleteCollection}
            />
            <DeleteStoryAlertDialog
                isOpen={deleteStoryAlertOpen}
                onClose={() => setDeleteStoryAlertOpen(!deleteStoryAlertOpen)}
                selectedStory={selectedStory}
                onDelete={onDeleteStory}
            />
            <DeleteChatCollectionAlertDialog
                isOpen={deleteChatCollectionAlertOpen}
                onClose={() => setDeleteChatCollectionAlertOpen(!deleteChatCollectionAlertOpen)}
                selectedCollection={currentChatCollection}
                onDelete={onDeleteChatCollection}
            />
            <DeleteChatAlertDialog
                isOpen={deleteChatAlertOpen}
                onClose={() => setDeleteChatAlertOpen(!deleteChatAlertOpen)}
                selectedChat={selectedChat}
                onDelete={onDeleteChat}
            />
            <SidebarHeader className="flex items-center justify-center h-16">
                <Label className="font-black text-xl">Novelgen</Label>
            </SidebarHeader>
            <SidebarContent className="gap-0 flex">
                <SidebarGroup>
                    <Button className="w-full" variant="ghost" asChild>
                        <Link to="/">首頁</Link>
                    </Button>
                </SidebarGroup>
                <SidebarGroup>
                    <Button variant="outline" asChild>
                        <Link to="/story">
                            新故事
                            <PlusCircleIcon className="w-4 h-4" />
                        </Link>
                    </Button>
                </SidebarGroup>
                <SidebarGroup>
                    <Collapsible defaultOpen
                        className="list-none rounded-sm group/story-group hover:bg-slate-200"
                    >
                        <CollapsibleTrigger className="hover:cursor-pointer" asChild>
                            <SidebarGroupLabel>
                                故事
                                <ChevronDown className="w-4 h-4 ml-1 transition-transform group-data-[state=open]/story-group:rotate-180" />
                            </SidebarGroupLabel>
                        </CollapsibleTrigger>
                        <SidebarGroupAction onClick={onAddStoryCollectionClick} title="新增故事集">
                            <PlusCircleIcon className="w-4 h-4" />
                        </SidebarGroupAction>
                        <CollapsibleContent className="max-h-[40rem] overflow-y-auto">
                            <DragDropContext onDragEnd={handleDragStoryEnd}>
                                {/* 故事集區域 */}
                                {storyState.collections.map(collection => (
                                    <Droppable droppableId={collection.id} key={collection.id}>
                                        {(provided) => (
                                            <Collapsible defaultOpen
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="list-none rounded-sm group/collapsible hover:bg-slate-200"
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <CollapsibleTrigger asChild
                                                        className={[
                                                            "group-data-[state=open]/collapsible:hover:bg-slate-200",
                                                            "group-data-[state=closed]/collapsible:hover:bg-slate-200",
                                                        ].join(' ')}>
                                                        <SidebarMenuButton className="text-xs">
                                                            {collection.name}
                                                            <ChevronDown className="transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="mr-1 h-5 w-6 rounded-sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent side="right" align="start"
                                                            className="w-28 bg-white py-0.5 rounded-md shadow">
                                                            <DropdownMenuItem
                                                                className="flex h-8 justify-start m-1 rounded cursor-pointer hover:bg-slate-300">
                                                                <Label className="flex items-center px-1 cursor-pointer">
                                                                    <PenLineIcon className="mr-2 h-4 w-4" />
                                                                    重新命名
                                                                </Label>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="flex h-8 justify-start m-1 rounded cursor-pointer hover:bg-slate-300 hover:text-destructive"
                                                                onClick={() => onDeleteStoryCollectionClick(collection)}
                                                            >
                                                                <Label className="flex items-center px-1 cursor-pointer hover:text-destructive">
                                                                    <Trash2Icon className="mr-2 h-4 w-4" />
                                                                    刪除
                                                                </Label>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                <CollapsibleContent className="space-y-1">
                                                    {collection.stories.map((story, index) => (
                                                        <DraggableStoryItem
                                                            key={`story-${story.uid}`}
                                                            story={story}
                                                            index={index}
                                                            onDelete={handleDeleteStory}
                                                        />
                                                    ))}
                                                    {provided.placeholder}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        )}
                                    </Droppable>
                                ))}

                                {/* 未分類故事區域 */}
                                <Droppable droppableId="unorganized">
                                    {(provided) => (
                                        <SidebarGroupContent
                                            className="py-0 rounded-sm hover:bg-slate-200 focus:bg-slate-200"
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {storyState.unorganizedStories.map((story, index) => (
                                                <DraggableStoryItem
                                                    key={`story-${story.uid}`}
                                                    story={story}
                                                    index={index}
                                                    onDelete={handleDeleteStory}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </SidebarGroupContent>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarGroup>
                <SidebarGroup>
                    <Collapsible defaultOpen
                        className="list-none rounded-sm group/chat-group hover:bg-slate-200"
                    >
                        <CollapsibleTrigger className="hover:cursor-pointer" asChild>
                            <SidebarGroupLabel>
                                對話
                                <ChevronDown className="w-4 h-4 ml-1 transition-transform group-data-[state=open]/chat-group:rotate-180" />
                            </SidebarGroupLabel>
                        </CollapsibleTrigger>
                        <SidebarGroupAction title="新增對話集">
                            <PlusCircleIcon className="w-4 h-4" />
                        </SidebarGroupAction>
                        <CollapsibleContent className="max-h-[40rem] overflow-y-auto">
                            <DragDropContext onDragEnd={handleDragChatEnd}>
                                {/* 對話集區域 */}
                                {chatState.collections.map(collection => (
                                    <Droppable droppableId={collection.id} key={collection.id}>
                                        {(provided) => (
                                            <Collapsible defaultOpen
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="list-none rounded-sm group/collapsible hover:bg-slate-200"
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <CollapsibleTrigger asChild
                                                        className={[
                                                            "group-data-[state=open]/collapsible:hover:bg-slate-200",
                                                            "group-data-[state=closed]/collapsible:hover:bg-slate-200",
                                                        ].join(' ')}>
                                                        <SidebarMenuButton className="text-xs">
                                                            {collection.name}
                                                            <ChevronDown className="transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="mr-1 h-5 w-6 rounded-sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent side="right" align="start"
                                                            className="w-28 bg-white py-0.5 rounded-md shadow">
                                                            <DropdownMenuItem
                                                                className="flex h-8 justify-start m-1 rounded cursor-pointer hover:bg-slate-300">
                                                                <Label className="flex items-center px-1 cursor-pointer">
                                                                    <PenLineIcon className="mr-2 h-4 w-4" />
                                                                    重新命名
                                                                </Label>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="flex h-8 justify-start m-1 rounded cursor-pointer hover:bg-slate-300 hover:text-destructive"
                                                                onClick={() => onDeleteChatCollectionClick(collection)}
                                                            >
                                                                <Label className="flex items-center px-1 cursor-pointer hover:text-destructive">
                                                                    <Trash2Icon className="mr-2 h-4 w-4" />
                                                                    刪除
                                                                </Label>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                <CollapsibleContent className="space-y-1">
                                                    {collection.chats.map((chat, index) => (
                                                        <DraggableChatItem
                                                            key={`chat-${chat.uid}`}
                                                            chat={chat}
                                                            index={index}
                                                            onDelete={handleDeleteChat}
                                                        />
                                                    ))}
                                                    {provided.placeholder}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        )}
                                    </Droppable>
                                ))}
                                {/* 未分類對話集區域 */}
                                <Droppable droppableId="unorganized">
                                    {(provided) => (
                                        <SidebarGroupContent
                                            className="py-0 rounded-sm hover:bg-slate-200 focus:bg-slate-200"
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {chatState.unorganizedStories.map((chat, index) => (
                                                <DraggableChatItem
                                                    key={`chat-${chat.uid}`}
                                                    chat={chat}
                                                    index={index}
                                                    onDelete={handleDeleteChat}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </SidebarGroupContent>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex">
                    <Avatar>
                        <AvatarImage alt="avatar" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Button variant="ghost" asChild className="w-full">
                        <Link to="/settings">設定</Link>
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar >
    );
}