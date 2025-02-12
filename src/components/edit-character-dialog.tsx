"use client";

import "@/App.css";
import {
    Dialog,
    DialogContent,
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
}
const EditCharacterDialog: React.FC<EditCharacterDialogProps> = ({ open, onClose, character, onEdit }) => {

    const handleSubmit = (values: z.infer<typeof CharacterSchema>) => {
        onEdit(values);
    };

    if (!character) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>編輯角色</DialogTitle>
                </DialogHeader>
                <CharacterForm defaultCharacter={character} handleSubmit={handleSubmit} />
            </DialogContent>
        </Dialog>
    );
}

export default EditCharacterDialog;