import { useState } from "react";
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
import { addItems } from "@/lib/api.ts";
import { toast } from "@/hooks/use-toast";
import {useQueryClient} from "@tanstack/react-query"; // use your centralized toast system
import type { QueryKey } from "@tanstack/react-query";

export function AddItemDialog() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    // Local state for form fields
    const [form, setForm] = useState({
        name: "",
        marketHashName: "",
        iconUrl: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const created = await addItems(form);

            // Success toast via centralized toast system
            toast({
                title: "Item added",
                description: `${created.name} was added successfully!`,
                variant: "default",
            });

            // @ts-ignore
            await queryClient.invalidateQueries(["items"]);

            // Close the dialog and reset form
            setOpen(false);
            setForm({ name: "", marketHashName: "", iconUrl: "" });
        } catch (error) {
            // Error toast
            toast({
                title: "Failed to add item",
                description: "Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a New Item</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new item to your inventory.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="name">Item Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter item name"
                        />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="marketHashName">Market Hash Name</Label>
                        <Input
                            id="marketHashName"
                            name="marketHashName"
                            value={form.marketHashName}
                            onChange={handleChange}
                            placeholder="Enter market hash name"
                        />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="iconUrl">Icon URL</Label>
                        <Input
                            id="iconUrl"
                            name="iconUrl"
                            value={form.iconUrl}
                            onChange={handleChange}
                            placeholder="Enter icon URL"
                        />
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary"
                        onClick={handleSubmit}
                    >
                        Save Item
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
