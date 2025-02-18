import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { useCurrentStoryStorage } from "@/hooks/use-current-story-storage";
import { Story } from "@/models/story";
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, MoreHorizontal, Trash2Icon } from "lucide-react";
import { FC } from 'react';
import { Link } from 'react-router-dom';

interface DraggableStoryItemProps {
    story: Story;
    index: number;
    onDelete: (story: Story) => void;
}

export const DraggableStoryItem: FC<DraggableStoryItemProps> = ({ story, index, onDelete }) => {
    const { selectedStory } = useCurrentStoryStorage();
    return (
        <Draggable
            key={`story-${story.uid}`}
            draggableId={`story-${story.uid}`}
            index={index}
        >
            {(provided, snapshot) => (
                <SidebarMenuItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={[
                        'list-none',
                        `${snapshot.isDragging ? 'opacity-50' : ''}`,
                        `${story.uid === selectedStory?.uid ? 'bg-slate-200' : ''}`
                    ].join(' ')}
                >
                    <div className="flex items-center w-full">
                        <div
                            {...provided.dragHandleProps}
                            className="px-1 cursor-grab active:cursor-grabbing"
                        >
                            <GripVertical className="w-4 h-4" />
                        </div>
                        <SidebarMenuButton asChild className="flex hover:bg-slate-300 focus:bg-slate-300">
                            <Link to={`/story/${story.uid}`}>
                                {story.title?.slice(0, 6)}
                            </Link>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction className="rounded-sm">
                                    <MoreHorizontal />
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
                                <DropdownMenuItem asChild className="cursor-pointer hover:bg-destructive" onClick={() => onDelete(story)}>
                                    <Label className="cursor-pointer hover:bg-destructive">
                                        <Trash2Icon />
                                        刪除
                                    </Label>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </SidebarMenuItem>
            )}
        </Draggable>
    );
};
