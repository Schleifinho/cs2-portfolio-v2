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
import {addSale, updateSale} from "@/lib/salesApi";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {Sale} from "@/types/Sale.ts";


export interface AddSaleDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    sale?: Sale; // if passed, dialog works in edit mode
    itemId: number;
}

export function AddSaleDialog({
                                  open,
                                  onOpenChange,
                                  sale,
                                  itemId,
                              }: AddSaleDialogProps) {
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        quantity: sale?.quantity ?? 1,
        price: sale?.price ?? 0,
    });

    // reset form when itemId or sale changes
    useEffect(() => {
        setForm({
            quantity: sale?.quantity ?? 1,
            price: sale?.price ?? 0,
        });
    }, [itemId, sale]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (sale?.itemId) {
                await updateSale({ ...sale, ...form });
                toast({ title: "Sale updated" });
            } else {
                await addSale({
                    ...form,
                    itemId,
                    timestamp: new Date(),
                });
                toast({ title: "Sale added" });
            }

            await queryClient.invalidateQueries({ queryKey: ["sales"] });
            await queryClient.invalidateQueries({ queryKey: ["inventoryEntries"] });

            onOpenChange?.(false); // ✅ close from parent
        } catch (err) {
            toast({ title: "Failed to save sale", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <Button
                        className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary"
                        onClick={handleSubmit}
                    >
                        {sale ? "Save Changes" : "Save Sale"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

