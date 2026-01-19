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
import { addSale, updateSale } from "@/lib/salesApi";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Sale } from "@/types/Sale.ts";
import { ArrowUpRight, Calculator, BadgeEuro, Hash, TrendingUp } from "lucide-react";

export interface AddSaleDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    sale?: Sale;
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

    useEffect(() => {
        setForm({
            quantity: sale?.quantity ?? 1,
            price: sale?.price ?? 0,
        });
    }, [itemId, sale, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // allow only digits, comma, dot
        if (!/^[0-9.,]*$/.test(value)) return;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const revenue = (form.quantity * form.price).toFixed(2);

    const handleSubmit = async () => {
        try {
            if (sale?.id) {
                await updateSale({ ...sale, ...form });
                toast({ title: "Sale record updated" });
            } else {
                await addSale({
                    ...form,
                    itemId,
                    timestamp: new Date(),
                });
                toast({ title: "Revenue transaction logged" });
            }

            await queryClient.invalidateQueries({ queryKey: ["sales"] });
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
                      <div className="p-2 bg-green-500/10 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex flex-col text-left">
                          <DialogTitle className="text-xl font-black uppercase tracking-tight">
                              {sale ? "Modify Sale" : "Log Revenue"}
                          </DialogTitle>
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                              Asset Disposal Entry
                          </p>
                      </div>
                  </div>
                  <DialogDescription className="text-xs">
                      Document the sale of assets and verify realized revenue.
                  </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                  {/* LIVE REVENUE PREVIEW */}
                  <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 flex flex-col items-center justify-center space-y-1 group transition-colors hover:bg-green-500/10">
                      <span className="text-[9px] uppercase font-black text-green-600/70 tracking-widest">Realized Revenue</span>
                      <div className="text-3xl font-black tracking-tighter text-green-600">
                          +{revenue}€
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
                            step="1"
                            min="0"
                            value={form.quantity}
                            onChange={handleChange}
                            className="font-mono font-bold focus-visible:ring-green-500/30"
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="price" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                              <BadgeEuro className="h-3 w-3" /> Sale Price (€)
                          </Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={handleChange}
                            className="font-mono font-bold focus-visible:ring-green-500/30"
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
                      Dismiss
                  </Button>
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700 shadow-md text-[10px] font-black uppercase tracking-widest px-8 transition-all"
                    onClick={handleSubmit}
                  >
                      <ArrowUpRight className="h-3.5 w-3.5 mr-2" />
                      {sale ? "Update Entry" : "Confirm Sale"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    );
}