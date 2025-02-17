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
import { ChatCollection } from "@/models/chat-collection";

interface DeleteChatCollectionAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCollection: ChatCollection | null;
    onDelete: () => void;
}

export const DeleteChatCollectionAlertDialog: React.FC<DeleteChatCollectionAlertDialogProps> = ({ isOpen, onClose, selectedCollection, onDelete }) => {
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
                            {selectedCollection?.name}
                        </Label>
                        對話集嗎?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        刪除後將無法復原，並且該對話集中的故事將會移除。
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