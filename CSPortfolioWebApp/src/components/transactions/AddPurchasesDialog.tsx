import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPurchaseByItemId, updatePurchase } from "@/lib/purchasesApi";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Purchase } from "@/types/Purchase.ts";
import { ShoppingCart, Calculator, BadgeEuro, Hash } from "lucide-react";

export interface AddPurchaseDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    purchase?: Purchase;
    itemId: number;
}

export function AddPurchaseDialog({
                                      open,
                                      onOpenChange,
                                      purchase,
                                      itemId,
                                  }: AddPurchaseDialogProps) {
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        quantity: purchase?.quantity ?? 1,
        price: purchase?.price ?? 0,
    });

    useEffect(() => {
        setForm({
            quantity: purchase?.quantity ?? 1,
            price: purchase?.price ?? 0,
        });
    }, [itemId, purchase, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // allow only digits, comma, dot
        if (!/^[0-9.,]*$/.test(value)) return;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const subtotal = (form.quantity * form.price).toFixed(2);

    const handleSubmit = async () => {
        try {
            if (purchase?.id) {
                await updatePurchase({ itemId, ...purchase, ...form });
                toast({ title: "Purchase entry updated" });
            } else {
                await addPurchaseByItemId({
                    ...form,
                    itemId,
                    timestamp: new Date(),
                });
                toast({ title: "Asset acquisition logged" });
            }

            await queryClient.invalidateQueries({ queryKey: ["purchases"] });
            await queryClient.invalidateQueries({ queryKey: ["inventoryEntries"] });

            onOpenChange?.(false);
        } catch (err) {
            toast({ title: "Operation failed", variant: "destructive" });
        }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px] overflow-hidden">
              <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col text-left">
                          <DialogTitle className="text-xl font-black uppercase tracking-tight">
                              {purchase ? "Modify Acquisition" : "Log Purchase"}
                          </DialogTitle>
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                              Asset Ledger Entry
                          </p>
                      </div>
                  </div>
                  <DialogDescription className="text-xs">
                      Enter the transaction details to update your inventory balance.
                  </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                  {/* LIVE PREVIEW CARD */}
                  <div className="bg-muted/30 border border-border/60 rounded-xl p-4 flex flex-col items-center justify-center space-y-1 group transition-colors hover:bg-muted/50">
                      <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Calculated Subtotal</span>
                      <div className="text-3xl font-black tracking-tighter text-primary">
                          {subtotal}€
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/70">
                          <Calculator className="h-3 w-3" />
                          <span>{form.quantity} units @ {Number(form.price).toFixed(2)}€</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="quantity" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                              <Hash className="h-3 w-3" /> Quantity
                          </Label>
                          <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="0"
                            step="1"
                            value={form.quantity}
                            onChange={handleChange}
                            className="font-mono font-bold focus-visible:ring-primary/30"
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="price" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                              <BadgeEuro className="h-3 w-3" /> Price (€)
                          </Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={handleChange}
                            className="font-mono font-bold focus-visible:ring-primary/30"
                          />
                      </div>
                  </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange?.(false)}
                    className="text-[10px] font-black uppercase tracking-widest hover:bg-muted"
                  >
                      Abort
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:opacity-90 shadow-md text-[10px] font-black uppercase tracking-widest px-8"
                    onClick={handleSubmit}
                  >
                      {purchase ? "Update Ledger" : "Commit Purchase"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    );
}