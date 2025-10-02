import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
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
import {addPurchaseByItemId, addSale, updatePurchase, updateSale} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {Purchase, Sale} from "@/types/inventory.ts";


export interface AddSaleDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    sale?: Sale; // if passed, dialog works in edit mode
    itemId: number;
}

export function AddSaleDialog({   open: controlledOpen,
                                  onOpenChange,
                                  sale,
                                  itemId, }: AddSaleDialogProps) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(controlledOpen ?? false);

    const [form, setForm] = useState({
        quantity: 1,
        price: 0,
    });

    // Sync controlled open state
    useEffect(() => {
        if (controlledOpen !== undefined) setOpen(controlledOpen);
    }, [controlledOpen]);

    useEffect(() => {
        if (sale) {
            setForm({
                quantity: sale.quantity,
                price: sale.price,
            });
        }
    }, [sale]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (sale?.itemId) {
                // edit mode
                await updateSale({ ...sale, ...form });
                toast({ title: "Sale updated", variant: "default" });
            } else {
                // add mode
                await addSale({
                    ...form,
                    itemId,
                    timestamp: new Date(),
                });
                toast({ title: "Sale added", variant: "default" });
            }

            // Refresh data
            await queryClient.invalidateQueries({ queryKey: ["sales"] });
            await queryClient.invalidateQueries({ queryKey: ["inventoryEntries"] });

            setOpen(false);
        } catch (err) {
            toast({ title: "Failed to save purchase", variant: "destructive" });
        }
    };

    return (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); onOpenChange?.(o); }}>
                {!sale && (
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add Sale
                        </Button>
                    </DialogTrigger>)
                }
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{sale ? "Edit Sale" : "Add Sale"}</DialogTitle>
                    <DialogDescription>
                        Enter sale details below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" name="price" type="number" value={form.price} onChange={handleChange} />
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary" onClick={handleSubmit}>
                        {sale ? "Save Changes" : "Save Sale"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
