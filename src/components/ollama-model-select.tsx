import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { MODEL_SELECTION } from "@/constant";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface OllamaModelSelectProps {
    model: string
    onChange: (model: string) => void
}

export const OllamaModelSelect: React.FC<OllamaModelSelectProps> = ({ model, onChange }) => {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(model ?? "deepseek-r1:32b")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="px-2 py-0 mr-2 h-6"
                >
                    {(value && MODEL_SELECTION.find((model) => model === value)) ?? "Select framework..."}
                    <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Command>
                    <CommandInput placeholder="搜尋模型..." />
                    <CommandList>
                        <CommandEmpty>沒有找到模型</CommandEmpty>
                        <CommandGroup>
                            {MODEL_SELECTION.map((model) => (
                                <CommandItem
                                    key={model} value={model}
                                    onSelect={(currValue) => {
                                        setValue(currValue)
                                        onChange(currValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === model ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {model}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}