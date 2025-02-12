import { DraggableStoryItem } from "@/components/app-sidebar-draggable";
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
import { useLocalStorage } from "@/hooks/use-storage";
import { Story } from "@/models/story";
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ChevronDown, MoreHorizontal, PlusCircleIcon, Trash2Icon } from "lucide-react";
import { Link } from 'react-router-dom';

interface StoryCollection {
    id: string;
    name: string;
    stories: Story[];
}

interface RootStoryState {
    unorganizedStories: Story[];
    collections: StoryCollection[];
}

export function AppSidebar() {
    const [storyState, setStoryState] = useLocalStorage<RootStoryState>('story-state', {
        unorganizedStories: [],
        collections: []
    });

    const generateUniqueId = () => `col-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const handleAddCollection = () => {
        const newCollection: StoryCollection = {
            id: generateUniqueId(),
            name: `故事集 ${storyState.collections.length + 1}`,
            stories: []
        };

        setStoryState(prev => ({
            ...prev,
            collections: [...prev.collections, newCollection]
        }));
    };

    const handleDeleteCollection = (collectionId: string) => {
        setStoryState(prev => {
            const collection = prev.collections.find(c => c.id === collectionId);
            if (!collection) return prev;

            return {
                ...prev,
                // 將被刪除集合中的故事移至未分類區域
                unorganizedStories: [...prev.unorganizedStories, ...collection.stories],
                // 從集合列表中移除該集合
                collections: prev.collections.filter(c => c.id !== collectionId)
            };
        });
    };

    const handleDragEnd = (result: DropResult): void => {
        const { source, destination } = result;
        console.debug('source', source);
        console.debug('destination', destination);
        console.debug('result', result);

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

    return (
        <Sidebar>
            <SidebarHeader className="flex items-center justify-center h-16">
                <Label className="font-black text-xl">Novelgen</Label>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="group-data-[collapsible=icon]:hidden" />
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
                    <SidebarGroupLabel>
                        故事
                    </SidebarGroupLabel>
                    <SidebarGroupAction onClick={handleAddCollection} title="新增故事集">
                        <PlusCircleIcon className="w-4 h-4" />
                    </SidebarGroupAction>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        {/* 故事集區域 */}
                        {storyState.collections.map(collection => (
                            <Droppable droppableId={collection.id} key={collection.id}>
                                {(provided) => (
                                    <Collapsible defaultOpen
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="list-none group/collapsible hover:bg-slate-300"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild className="hover:bg-slate-500">
                                                <SidebarMenuButton className="hover:bg-slate-500">
                                                    {collection.name}
                                                    <ChevronDown className="ml-2 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="right" align="end">
                                                    <DropdownMenuItem
                                                        className="cursor-pointer hover:text-destructive focus:text-destructive"
                                                        onClick={() => handleDeleteCollection(collection.id)}
                                                    >
                                                        <Label className="flex items-center cursor-pointer hover:text-destructive">
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
                                    className="py-2 hover:bg-slate-300"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {storyState.unorganizedStories.map((story, index) => (
                                        <DraggableStoryItem
                                            key={`story-${story.uid}`}
                                            story={story}
                                            index={index}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </SidebarGroupContent>
                            )}
                        </Droppable>
                    </DragDropContext>
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