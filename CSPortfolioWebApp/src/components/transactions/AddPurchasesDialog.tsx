import { useState, useEffect } from "react";
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
import {addPurchaseByItemId, updatePurchase} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {Purchase} from "@/types/inventory.ts";

export interface AddPurchaseDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    purchase?: Purchase; // if passed, dialog works in edit mode
    itemId: number;
}

export function AddPurchaseDialog({
                                      open: controlledOpen,
                                      onOpenChange,
                                      purchase,
                                      itemId,
                                  }: AddPurchaseDialogProps) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(controlledOpen ?? false);
    const [form, setForm] = useState({
        quantity: purchase?.quantity ?? 1,
        price: purchase?.price ?? 0,
    });

    // Sync controlled open state
    useEffect(() => {
        if (controlledOpen !== undefined) setOpen(controlledOpen);
    }, [controlledOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (purchase?.id) {
                // edit mode
                await updatePurchase({ itemId, ...purchase, ...form });
                toast({ title: "Purchase updated", variant: "default" });
            } else {
                // add mode
                await addPurchaseByItemId({
                    ...form,
                    itemId,
                    timestamp: new Date(),
                });
                toast({ title: "Purchase added", variant: "default" });
            }

            // Refresh data
            await queryClient.invalidateQueries({ queryKey: ["purchases"] });
            await queryClient.invalidateQueries({ queryKey: ["inventoryEntries"] });

            setOpen(false);
        } catch (err) {
            toast({ title: "Failed to save purchase", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); onOpenChange?.(o); }}>
            {!purchase && (
                <DialogTrigger asChild>
                    <Button>Add Purchase</Button>
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{purchase ? "Edit Purchase" : "Add Purchase"}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for this purchase.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            value={form.quantity}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            value={form.price}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary"
                        onClick={handleSubmit}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
