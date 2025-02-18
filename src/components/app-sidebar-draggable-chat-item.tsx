import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { DISPLAY_TITLE_LENGTH } from "@/constant";
import { useCurrentChatStorage } from "@/hooks/use-current-chat-storage";
import { Chat } from "@/models/chat";
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, MoreHorizontal, Trash2Icon } from "lucide-react";
import { FC } from 'react';

interface DraggableChatItemProps {
    chat: Chat;
    index: number;
    onDelete: (chat: Chat) => void;
}

export const DraggableChatItem: FC<DraggableChatItemProps> = ({ chat, index, onDelete }) => {
    const { selectedChat, setCurrentChatUid } = useCurrentChatStorage();
    return (
        <Draggable
            key={`chat-${chat.uid}`}
            draggableId={`chat-${chat.uid}`}
            index={index}
        >
            {(provided, snapshot) => (
                <SidebarMenuItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={[
                        'list-none',
                        `${snapshot.isDragging ? 'opacity-50' : ''}`,
                        `${chat.uid === selectedChat?.uid ? 'bg-slate-200' : ''}`
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
                            {/* <Link to={`/chat/${chat.uid}`}> */}
                            <Button variant='link' className="flex items-center justify-start min-w-max"
                                onClick={() => setCurrentChatUid(chat.uid)}>
                                {chat.title?.slice(0, DISPLAY_TITLE_LENGTH) ?? '無標題'}
                                {(chat.title && chat.title?.length > DISPLAY_TITLE_LENGTH) && '...'}
                            </Button>
                            {/* </Link> */}
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction className="rounded-sm">
                                    <MoreHorizontal />
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
                                <DropdownMenuItem asChild className="cursor-pointer hover:bg-destructive" onClick={() => onDelete(chat)}>
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
