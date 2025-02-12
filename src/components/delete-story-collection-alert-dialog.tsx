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
import { StoryCollection } from "@/models/story-collection";

interface DeleteStoryCollectionAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCollection: StoryCollection | null;
    onDelete: () => void;
}

export const DeleteStoryCollectionAlertDialog: React.FC<DeleteStoryCollectionAlertDialogProps> = ({ isOpen, onClose, selectedCollection, onDelete }) => {
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
                        故事集嗎?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        刪除後將無法復原，並且該故事集中的故事將會移除。
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