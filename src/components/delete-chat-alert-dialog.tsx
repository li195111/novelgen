import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Chat } from "@/models/chat";

interface DeleteChatAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedChat: Chat | null;
    onDelete: () => void;
}

export const DeleteChatAlertDialog: React.FC<DeleteChatAlertDialogProps> = ({ isOpen, onClose, selectedChat, onDelete }) => {
    const handleOnDelete = () => {
        onDelete();
        onClose();
    };
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>確定刪除
                        <Label className="font-bold text-lg text-red-500">
                            {selectedChat?.title}
                        </Label>
                        對話嗎?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        刪除後將無法復原
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-500" onClick={handleOnDelete}>刪除</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    );
};