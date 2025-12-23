import {useRef, useState, useMemo} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useVirtualizer} from "@tanstack/react-virtual";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Search, ArrowUpDown, ShoppingCart, Edit, RefreshCcw, DollarSign} from "lucide-react";

import {getInventoryEntries} from "@/lib/inventoryApi";
import {sendPriceUpdateEvent} from "@/lib/api";
import {InventoryEntry} from "@/types/InventoryEntry";
import {PriceUpdateEvent} from "@/types/PriceHistory";
import {Button} from "@/components/ui/button.tsx";
import {AddSaleDialog} from "@/components/transactions/AddSaleDialog.tsx";
import {AddPurchaseDialog} from "@/components/transactions/AddPurchasesDialog.tsx";
import {useTokenSearch} from "@/lib/searchbar.ts";
import {useAuth} from "@/lib/AuthContext.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

export function InventoryTable() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const {data: inventoryEntries = [], isLoading, isError, error} =
        useQuery<InventoryEntry[]>({
            queryKey: ["inventoryEntries", user?.username],
            queryFn: getInventoryEntries,
            select: (data) =>
                [...data].sort((a, b) => (b.trend ?? 0) - (a.trend ?? 0)),
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            refetchOnWindowFocus: true,
            refetchInterval: 1000 * 60 * 2,
        });


    // --- Search state ---
    const [search, setSearch] = useState("");

    // --- Filter by search ---
    const filteredEntries = useTokenSearch(inventoryEntries.filter(s => s.quantity > 0), search, (s) => s.name);

    // --- Sorting state ---
    type SortKey = "name" | "quantity" | "totalValue" | "currentPrice" | "trend" | null;
    const [sortKey, setSortKey] = useState<SortKey>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            // toggle order
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    // --- Sort filtered data ---
    const sortedEntries = useMemo(() => {
        if (!sortKey) return filteredEntries;

        return [...filteredEntries].sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sortKey) {
                case "name":
                    valA = a.name?.toLowerCase() || "";
                    valB = b.name?.toLowerCase() || "";
                    break;
                case "quantity":
                    valA = a.quantity;
                    valB = b.quantity;
                    break;
                case "currentPrice":
                    valA = a.currentPrice;
                    valB = b.currentPrice;
                    break;
                case "totalValue":
                    valA = a.totalValue;
                    valB = b.totalValue;
                    break;
                case "trend":
                    valA = a.trend;
                    valB = b.trend;
                    break;
                default:
                    valA = "";
                    valB = "";
            }

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredEntries, sortKey, sortOrder]);

    // --- Virtualization ---
    const parentRef = useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtualizer({
        count: sortedEntries.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 110,
        overscan: 25,
    });

    const [saleDialogOpen, setSaleDialogOpen] = useState(false);
    const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    const handlePriceRefresh = async (itemId: number, marketHashName: string) => {
        let item: PriceUpdateEvent = {itemId: itemId, marketHashName: marketHashName};
        await sendPriceUpdateEvent(item);
        await queryClient.invalidateQueries({queryKey: ["inventoryEntries"]});
    }

    const handlePriceRefreshAll = async () => {
        for (const item of sortedEntries) {
            await handlePriceRefresh(item.itemId, item.marketHashName);
        }
    }

    if (isLoading) return <p className="p-4">Loading items...</p>;
    if (isError)
        return (
            <p className="p-4 text-red-500">Error: {(error as Error).message}</p>
        );

    return (
        <div className="flex-1 space-y-6 p-8">
            {/* Search bar */}
            <div className="flex items-center gap-4">
                {/* Title - 50% width */}
                <h2 className="w-1/2 text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
                    Inventory Management
                </h2>

                {/* Search bar - flex-grow to fill remaining space */}
                <div className="relative flex-1 max-w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 w-full"
                    />
                </div>

                {/* Button - takes only necessary space */}
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={async () => await handlePriceRefreshAll()}
                >
                    <RefreshCcw className="h-4 w-4"/> Price Refresh
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => queryClient.invalidateQueries({queryKey: ["inventoryEntries"]})}
                >
                    <RefreshCcw className="h-4 w-4"/> View Refresh
                </Button>
            </div>

            <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                    <CardTitle className="text-foreground">
                        <div className="flex items-center space-x-3">
                            <div>
                                Current Inventory ({sortedEntries.length})
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* 🔹 STATIC HEADER */}
                    <Table className="table-fixed border-collapse">
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead
                                    onClick={() => handleSort("name")}
                                    className="cursor-pointer select-none text-muted-foreground w-5/10"
                                >
                                    Item <ArrowUpDown className="inline-block ml-1 h-4 w-4"/>
                                </TableHead>
                                <TableHead
                                    onClick={() => handleSort("quantity")}
                                    className="cursor-pointer select-none text-muted-foreground text-center w-1/10"
                                >
                                    Quantity <ArrowUpDown className="inline-block ml-1 h-4 w-4"/>
                                </TableHead>
                                <TableHead
                                    onClick={() => handleSort("totalValue")}
                                    className="cursor-pointer select-none text-muted-foreground text-center w-1/10"
                                >
                                    Total Value
                                    ({sortedEntries.reduce((sum, item) => sum + item.totalValue, 0).toFixed(2)}€)
                                    <ArrowUpDown className="inline-block ml-1 h-4 w-4"/>
                                </TableHead>
                                <TableHead
                                    onClick={() => handleSort("currentPrice")}
                                    className="cursor-pointer select-none text-muted-foreground text-center w-1/10"
                                >
                                    Current Price <ArrowUpDown className="inline-block ml-1 h-4 w-4"/>
                                </TableHead>
                                <TableHead
                                    onClick={() => handleSort("trend")}
                                    className="cursor-pointer select-none text-muted-foreground text-center w-1/10">
                                    Trend ({sortedEntries.reduce((sum, item) => sum + item.trend, 0).toFixed(2)}€)
                                    <ArrowUpDown className="inline-block ml-1 h-4 w-4"/>
                                </TableHead>
                                <TableHead className="w-1/10 text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table>
                    <ScrollArea
                        ref={parentRef}
                        className="relative w-full"
                        style={{ height: `calc(100vh - 300px)` }}
                    >
                        <Table className="table-fixed border-collapse">
                            <TableBody>
                                {/* Spacer at the top */}
                                <tr style={{height: rowVirtualizer.getVirtualItems()[0]?.start ?? 0}}/>

                                {rowVirtualizer.getVirtualItems().map((vRow) => {
                                    const entry = sortedEntries[vRow.index];
                                    return (
                                        <TableRow
                                            key={entry.itemId}
                                            style={{height: vRow.size}}
                                            className="border-border hover:bg-secondary/50"
                                        >
                                            <TableCell className="flex items-center space-x-3">
                                                {entry.iconUrl && (
                                                    <img
                                                        src={`https://community.fastly.steamstatic.com/economy/image/${entry.iconUrl}`}
                                                        alt={entry.name}
                                                        className="h-20 w-20 rounded object-contain border border-border"
                                                    />
                                                )}
                                                {!entry.iconUrl && (
                                                    <img
                                                        src={`${import.meta.env.VITE_BACKEND_URL}uploads/profile/default.jpg?v=${Date.now()}`}
                                                        alt={entry.name}
                                                        className="h-20 w-20 rounded object-contain border border-border"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-foreground">{entry.name}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-primary/10 text-primary border-primary/20"
                                                >
                                                    {entry.quantity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground text-center">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-primary/10 text-primary border-primary/20"
                                                >
                                                    {entry.totalValue.toFixed(2)}€
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground text-center">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-primary/10 text-primary border-primary/20"
                                                >
                                                    {entry.currentPrice.toFixed(2)}€
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground text-center">
                                                <Badge
                                                    variant="secondary"
                                                    className={`${
                                                        entry.trend > 0
                                                            ? "bg-green-700/10 text-green-700 border-green-700/20"
                                                            : entry.trend < 0
                                                                ? "bg-red-700/10 text-red-700 border-red-700/20"
                                                                : "bg-primary/10 text-primary border-primary/20"
                                                    }`}
                                                >
                                                    {entry.trend.toFixed(2)}€
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-primary/10"
                                                    onClick={() => {
                                                        setSelectedItemId(entry.itemId); //
                                                        setPurchaseDialogOpen(true);     // open the dialog
                                                    }}
                                                >
                                                    <ShoppingCart className="h-3 w-3"/>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-primary/10"
                                                    onClick={() => {
                                                        setSelectedItemId(entry.itemId); //
                                                        setSaleDialogOpen(true);     // open the dialog
                                                    }}
                                                >
                                                    <DollarSign className="h-3 w-3"/>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-primary/10"
                                                    onClick={() => handlePriceRefresh(entry.itemId, entry.marketHashName)}
                                                >
                                                    <RefreshCcw className="h-3 w-3"/>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-primary/10"
                                                >
                                                    <Edit className="h-3 w-3"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                <tr
                                    style={{
                                        height:
                                            rowVirtualizer.getTotalSize() -
                                            (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0),
                                    }}
                                />
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
            {/* Move dialogs OUTSIDE the Card entirely */}
            {selectedItemId !== null && saleDialogOpen && (
                <AddSaleDialog
                    key={`sale-${selectedItemId}`}
                    open={saleDialogOpen}
                    onOpenChange={(open) => {
                        setSaleDialogOpen(open);
                        if (!open) setSelectedItemId(null);
                    }}
                    itemId={selectedItemId}
                />
            )}

            {selectedItemId !== null && purchaseDialogOpen && (
                <AddPurchaseDialog
                    key={`purchase-${selectedItemId}`}
                    open={purchaseDialogOpen}
                    onOpenChange={(open) => {
                        setPurchaseDialogOpen(open);
                        if (!open) setSelectedItemId(null);
                    }}
                    itemId={selectedItemId}
                />
            )}
        </div>
    );
}
