import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImportedTransaction } from "@/types/ImportedTransaction";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { getItems } from "@/lib/itemsApi";
import {useAuth} from "@/lib/AuthContext.tsx";
import {Purchase} from "@/types/Purchase.ts";
import {Sale} from "@/types/Sale.ts";
import {addPurchasesBulk} from "@/lib/purchasesApi.ts";
import {addSalesBulk} from "@/lib/salesApi.ts";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ImportTransactionsDialog = ({ open, onOpenChange }: Props) => {
    const [items, setItems] = useState<ImportedTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();
    const { user } = useAuth();

    /* 🔹 LOAD ALL ITEMS ONCE */
    const { data: allItems = [] } = useQuery({
        queryKey: ["items", user?.username],
        queryFn: getItems,
        staleTime: 10 * 60 * 1000,
    });

    /* 🔹 FAST LOOKUP MAP */
    const itemMap = useMemo(() => {
        const map = new Map<
            string,
            { id: number; iconUrl: string }
        >();

        allItems.forEach((i: any) => {
            map.set(i.marketHashName, {
                id: i.id,
                iconUrl: i.iconUrl,
            });
        });

        return map;
    }, [allItems]);

    /* 🔹 CSV HANDLING + ENRICHMENT */
    const handleFile = async (file: File) => {
        const text = await file.text();
        const lines = text.split("\n").slice(1);

        const map = new Map<string, ImportedTransaction>();

        for (const line of lines) {
            if (!line.trim()) continue;

            const cols = line.split('","').map(c => c.replace(/"/g, ""));
            if (cols.length < 9) continue;

            const actedOn = cols[3];
            const displayPrice = parseFloat(cols[5]) / 100.0;
            const type = cols[6];
            const marketName = cols[7];
            const appId = cols[8];

            // CS2 only
            if (appId !== "730") continue;

            const matchedItem = itemMap.get(marketName);
            const key = `${marketName}|${actedOn}|${type}|${displayPrice}`;

            if (map.has(key)) {
                map.get(key)!.quantity += 1;
            } else {
                map.set(key, {
                    marketName,
                    actedOn,
                    type,
                    displayPrice,
                    quantity: 1,
                    enabled: !!matchedItem,
                    matched: !!matchedItem,
                    itemId: matchedItem?.id,
                    iconUrl: matchedItem?.iconUrl,
                });
            }
        }

        setItems(Array.from(map.values()));
    };

    const toggleItem = (index: number) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, enabled: !item.enabled } : item
            )
        );
    };

    const setAll = (value: boolean) => {
        setItems(prev =>
            prev.map(i => ({ ...i, enabled: value && i.matched }))
        );
    };

    const startImport = async () => {
        const selected = items.filter(i => i.enabled && i.matched);
        if (selected.length === 0) return;

        setLoading(true);
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            const purchases = selected
                .filter(i => i.enabled && i.matched && i.type === 'purchase')
                .map(i => ({
                    itemId: i.itemId!,
                    quantity: i.quantity,
                    price: i.displayPrice, // remove currency symbols
                    timestamp: new Date(`${i.actedOn} ${currentYear}`),
                })) as Omit<Purchase, "id">[];

            await addPurchasesBulk(purchases);

            const sale = selected
                .filter(i => i.enabled && i.matched && i.type === 'sale')
                .map(i => ({
                    itemId: i.itemId!,
                    quantity: i.quantity,
                    price: i.displayPrice, // remove currency symbols
                    timestamp: new Date(`${i.actedOn} ${currentYear}`),
                })) as Omit<Sale, "id">[];

            await addSalesBulk(sale);

            toast({
                title: "Import successful",
                description: `${selected.length} entries imported`,
            });

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["purchases"] }),
                queryClient.invalidateQueries({ queryKey: ["sales"] }),
                queryClient.invalidateQueries({ queryKey: ["inventoryEntries"] }),
            ]);

            setItems([]);
            onOpenChange(false);
        } catch {
            toast({
                title: "Import failed",
                description: "Please check the CSV format.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Import transactions</DialogTitle>
                </DialogHeader>

                {/* FILE INPUT */}
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) =>
                        e.target.files && handleFile(e.target.files[0])
                    }
                    className="text-sm"
                />

                {/* PREVIEW */}
                <div className="max-h-80 overflow-auto border rounded-lg divide-y mt-4">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3 gap-4"
                        >
                            <div className="flex items-center gap-3">
                                {item.iconUrl ? (
                                    <img
                                        src={`https://community.fastly.steamstatic.com/economy/image/${item.iconUrl}`}
                                        alt={item.marketName[0].toUpperCase()}
                                        className="h-10 w-10 rounded border object-cover"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                        N/A
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <div className="font-medium">
                                        {item.marketName}
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        {item.type} · {item.actedOn}
                                    </div>

                                    <div className="text-sm">
                                        <span className="font-medium">
                                            {item.displayPrice}
                                        </span>
                                        {" · "}
                                        Qty:{" "}
                                        <span className="font-medium">
                                            {item.quantity}
                                        </span>
                                    </div>

                                    {!item.matched && (
                                        <div className="text-xs text-destructive">
                                            Item not found
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Switch
                                checked={item.enabled}
                                disabled={!item.matched}
                                onCheckedChange={() => toggleItem(i)}
                            />
                        </div>
                    ))}

                    {items.length === 0 && (
                        <div className="p-6 text-center text-muted-foreground">
                            No entries loaded
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-between pt-4">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setAll(true)}>
                            Enable all
                        </Button>
                        <Button variant="outline" onClick={() => setAll(false)}>
                            Disable all
                        </Button>
                    </div>

                    <Button
                        onClick={startImport}
                        disabled={
                            loading ||
                            items.every(i => !i.enabled || !i.matched)
                        }
                    >
                        {loading ? "Importing..." : "Start import"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
