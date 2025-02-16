"use client";

import "@/App.css";
import { CharacterForm, CharacterSchema } from "@/components/character-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Character } from "@/models/character";
import { z } from "zod";

interface AddCharacterDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (character: Character) => void;
}
const AddCharacterDialog: React.FC<AddCharacterDialogProps> = ({ open, onClose, onAdd }) => {

    const handleSubmit = (values: z.infer<typeof CharacterSchema>) => {
        onAdd(values)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>新增角色</DialogTitle>
                </DialogHeader>
                <DialogDescription className="p-0 m-0"></DialogDescription>
                <CharacterForm handleSubmit={handleSubmit} />
            </DialogContent>
        </Dialog>
    );
}

export default AddCharacterDialog;