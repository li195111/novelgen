"use client";

import "@/App.css";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";

interface EditSceneDialogProps {
    open: boolean;
    onClose: () => void;
    scene: string | null;
    onEdit: (scene: string) => void;
}
const EditSceneDialog: React.FC<EditSceneDialogProps> = ({ open, onClose, scene, onEdit }) => {
    const sceneTextareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (!sceneTextareaRef.current?.value) return;
        onEdit(sceneTextareaRef.current.value);
    };

    if (!scene) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>編輯場景</DialogTitle>
                </DialogHeader>
                <Textarea defaultValue={scene} ref={sceneTextareaRef} />
                <Button type="button" onClick={handleSubmit}>確認</Button>
            </DialogContent>
        </Dialog>
    );
}

export default EditSceneDialog;