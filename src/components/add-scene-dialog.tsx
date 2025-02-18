"use client";

import "@/App.css";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";

interface AddSceneDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (scene: string) => void;
}
const AddSceneDialog: React.FC<AddSceneDialogProps> = ({ open, onClose, onAdd }) => {
    const sceneTextareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (!sceneTextareaRef.current?.value) return;
        onAdd(sceneTextareaRef.current.value);
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>新增場景</DialogTitle>
                </DialogHeader>
                <DialogDescription className="p-0 m-0"></DialogDescription>
                <Textarea ref={sceneTextareaRef} />
                <Button type="button" onClick={handleSubmit}>確認</Button>
            </DialogContent>
        </Dialog>
    );
}

export default AddSceneDialog;