import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addItem, updateItem } from "@/lib/itemsApi.ts"; // add updateItem API
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {Item} from "@/types/Item.ts";

type AddItemDialogProps = {
    item?: Item;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function AddItemDialog({ item, open: controlledOpen, onOpenChange }: AddItemDialogProps) {
    const queryClient = useQueryClient();

    const isControlled = controlledOpen !== undefined;

    // Local open state only if uncontrolled
    const [open, setOpen] = useState(false);

    // Manage actual open state
    const dialogOpen = isControlled ? controlledOpen : open;

    // Form state
    const [form, setForm] = useState({ id: 0, name: "", marketHashName: "", iconUrl: "" } as Item);

    useEffect(() => {
        if (item) setForm(item);
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleClose = () => {
        if (isControlled && onOpenChange) onOpenChange(false);
        else setOpen(false);
        setForm({ name: "", marketHashName: "", iconUrl: "" });
    };

    const handleSubmit = async () => {
        try {
            if (item) {
                // Editing
                await updateItem(form);
                toast({ title: "Item updated", description: `${form.name} updated successfully`, variant: "default" });
            } else {
                // Adding
                await addItem(form);
                toast({ title: "Item added", description: `${form.name} added successfully`, variant: "default" });
            }

            await queryClient.invalidateQueries({ queryKey: ["items"] });
            handleClose();
        } catch {
            toast({ title: "Failed", description: "Please try again", variant: "destructive" });
        }
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={(v) => (isControlled ? onOpenChange?.(v) : setOpen(v))}>
            {!item && !isControlled && (
                <DialogTrigger asChild>
                    <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{item ? "Edit Item" : "Add a New Item"}</DialogTitle>
                    <DialogDescription>
                        Fill in the details below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="name">Item Name</Label>
                        <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Enter item name" />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="marketHashName">Market Hash Name</Label>
                        <Input id="marketHashName" name="marketHashName" value={form.marketHashName} onChange={handleChange} placeholder="Enter market hash name" />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="iconUrl">Icon URL</Label>
                        <Input id="iconUrl" name="iconUrl" value={form.iconUrl} onChange={handleChange} placeholder="Enter icon URL" />
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary" onClick={handleSubmit}>
                        {item ? "Save Changes" : "Save Item"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
