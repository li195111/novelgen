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
import { Story } from "@/models/story";

interface DeleteStoryAlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedStory: Story | null;
    onDelete: () => void;
}

export const DeleteStoryAlertDialog: React.FC<DeleteStoryAlertDialogProps> = ({ isOpen, onClose, selectedStory, onDelete }) => {
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
                            {selectedStory?.title}
                        </Label>
                        故事嗎?
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