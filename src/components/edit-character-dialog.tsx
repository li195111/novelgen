"use client";

import "@/App.css";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Character } from "@/models/character";
import { z } from "zod";
import { CharacterForm, CharacterSchema } from "./character-form";

interface EditCharacterDialogProps {
    open: boolean;
    onClose: () => void;
    character: Character | null;
    onEdit: (character: Character) => void;
    onDelete: () => void;
}
const EditCharacterDialog: React.FC<EditCharacterDialogProps> = ({ open, onClose, character, onEdit, onDelete }) => {

    const handleSubmit = (values: z.infer<typeof CharacterSchema>) => {
        onEdit(values);
    };

    const handleDelete = () => {
        if (character) {
            onDelete();
        }
    };

    if (!character) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>編輯角色</DialogTitle>
                </DialogHeader>
                <DialogDescription className="p-0 m-0"></DialogDescription>
                <CharacterForm defaultCharacter={character} handleSubmit={handleSubmit} handleDelete={handleDelete} />
            </DialogContent>
        </Dialog>
    );
}

export default EditCharacterDialog;