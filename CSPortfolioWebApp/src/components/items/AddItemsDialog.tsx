import { useState, useEffect } from "react";
import { Plus, Package, Link, Tag, Eye, Info } from "lucide-react";
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
import { addItem, updateItem } from "@/lib/itemsApi.ts";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Item } from "@/types/Item.ts";
import { AppRoles } from "@/types/AppRoles.ts";
import { useAuth } from "@/lib/AuthContext.tsx";

type AddItemDialogProps = {
    item?: Item;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function AddItemDialog({ item, open: controlledOpen, onOpenChange }: AddItemDialogProps) {
    const queryClient = useQueryClient();
    const { hasAnyRole } = useAuth();
    const isControlled = controlledOpen !== undefined;
    const [open, setOpen] = useState(false);
    const dialogOpen = isControlled ? controlledOpen : open;

    const [form, setForm] = useState({ name: "", marketHashName: "", iconUrl: "" } as Item);

    useEffect(() => {
        if (item) setForm(item);
        else setForm({ name: "", marketHashName: "", iconUrl: "" } as Item);
    }, [item, dialogOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleClose = () => {
        if (isControlled && onOpenChange) onOpenChange(false);
        else setOpen(false);
    };

    const handleSubmit = async () => {
        try {
            if (item) {
                await updateItem(form);
                toast({ title: "Registry updated", description: `${form.name} successfully modified.` });
            } else {
                await addItem(form);
                toast({ title: "Asset registered", description: `${form.name} added to global catalog.` });
            }
            await queryClient.invalidateQueries({ queryKey: ["items"] });
            handleClose();
        } catch {
            toast({ title: "Registration failed", variant: "destructive" });
        }
    };

    const handleIconUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Check if it's a Steam CDN URL
        if (value.includes("steamstatic.com/economy/image/")) {
            // This regex finds the hash: the string immediately following '/image/'
            // until it hits a forward slash or the end of the string.
            const match = value.match(/\/image\/([^\/]+)/);

            if (match && match[1]) {
                value = match[1];
                toast({
                    title: "Deep Hash Extracted",
                    description: "Cleaned complex CDN URL into a valid registry hash.",
                });
            }
        }

        setForm({ ...form, iconUrl: value });
    };

    return (
      <Dialog open={dialogOpen} onOpenChange={(v) => (isControlled ? onOpenChange?.(v) : setOpen(v))}>
          {!item && !isControlled && hasAnyRole(AppRoles.Mod, AppRoles.Admin) && (
            <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-primary text-primary-foreground hover:opacity-90 shadow-md h-10 md:h-9 px-4 gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                    <Plus className="h-4 w-4" />
                    Add New Item
                </Button>
            </DialogTrigger>
          )}

          <DialogContent className="sm:max-w-[450px] overflow-hidden">
              <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                          <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col text-left">
                          <DialogTitle className="text-xl font-black uppercase tracking-tight">
                              {item ? "Edit Registry" : "Asset Registration"}
                          </DialogTitle>
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                              Global Catalog Management
                          </p>
                      </div>
                  </div>
                  <DialogDescription className="text-xs">
                      Define item parameters for cross-platform market tracking.
                  </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                  {/* ASSET PREVIEW CARD */}
                  <div className="bg-muted/30 border border-border/60 rounded-xl p-4 flex items-center gap-4 group transition-colors hover:bg-muted/50">
                      <div className="h-16 w-16 shrink-0 bg-background rounded-lg border border-border/60 flex items-center justify-center overflow-hidden shadow-inner">
                          {form.iconUrl ? (
                            <img
                              src={`https://community.fastly.steamstatic.com/economy/image/${form.iconUrl}`}
                              alt="Preview"
                              className="h-12 w-12 object-contain p-1"
                            />
                          ) : (
                            <Eye className="h-6 w-6 text-muted-foreground/30" />
                          )}
                      </div>
                      <div className="flex flex-col min-w-0">
                          <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Live Preview</span>
                          <span className="text-sm font-bold truncate text-foreground/80">
                                {form.name || "Unnamed Asset"}
                            </span>
                          <span className="text-[10px] font-mono text-muted-foreground truncate">
                                {form.marketHashName || "no_hash_defined"}
                            </span>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="name"
                                 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5"/> Item Display Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. AK-47 | Redline (Field-Tested)"
                            className="h-10 border-muted/60 focus-visible:ring-primary/30 font-medium"
                          />
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="marketHashName"
                                 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                              <Info className="h-3.5 w-3.5"/> Market Hash Name
                          </Label>
                          <Input
                            id="marketHashName"
                            name="marketHashName"
                            value={form.marketHashName}
                            onChange={handleChange}
                            placeholder="The exact Steam market name"
                            className="h-10 border-muted/60 focus-visible:ring-primary/30 font-mono text-xs"
                          />
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="iconUrl"
                                 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                              <Link className="h-3.5 w-3.5"/> Steam Icon Hash
                          </Label>
                          <Input
                            id="iconUrl"
                            name="iconUrl"
                            value={form.iconUrl}
                            onChange={handleIconUrlChange} // Use the new handler
                            placeholder="Paste hash or Steam image URL..."
                            className="h-10 border-muted/60 focus-visible:ring-primary/30 font-mono text-xs"
                          />
                          <p className="text-[9px] text-muted-foreground/60 px-1">
                              Tip: You can paste the full image URL and we'll extract the hash.
                          </p>
                      </div>
                  </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 border-border/40">
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="text-[10px] font-black uppercase tracking-widest hover:bg-muted"
                  >
                      Discard
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:opacity-90 shadow-md text-[10px] font-black uppercase tracking-widest px-8"
                    onClick={handleSubmit}
                  >
                      {item ? "Commit Changes" : "Register Asset"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    );
}