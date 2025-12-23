import { useRef, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getItems, deleteItem } from "@/lib/itemsApi";
import { Item } from "@/types/Item";

import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, Edit, Trash, ShoppingCart } from "lucide-react";
import { AddItemDialog } from "@/components/items/AddItemsDialog";
import { toast } from "@/hooks/use-toast";
import { AddPurchaseDialog } from "@/components/transactions/AddPurchasesDialog.tsx";
import { useTokenSearch } from "@/lib/searchbar.ts";
import { useAuth } from "@/lib/AuthContext.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

export function ItemsTable() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: items = [], isLoading, isError, error } = useQuery<Item[]>({
    queryKey: ["items", user?.username],
    queryFn: getItems,
    select: (data) =>
        [...data].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const [search, setSearch] = useState("");
  const filteredItems = useTokenSearch(items, search, (s) => s.name);

  // Sorting
  type SortKey = "name" | null;
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedItems = useMemo(() => {
    if (!sortKey) return filteredItems;
    return [...filteredItems].sort((a, b) => {
      const valA = a[sortKey]?.toLowerCase() || "";
      const valB = b[sortKey]?.toLowerCase() || "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortKey, sortOrder]);

  // Virtualization
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: sortedItems.length,
    getScrollElement: () => parentRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement,
    estimateSize: () => 80,
    overscan: 50,
  });


  // Edit / Delete / Purchase state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteItem(id);
      toast({ title: "Item deleted", variant: "default" });
      await queryClient.invalidateQueries({ queryKey: ["items"] });
    } catch {
      toast({ title: "Failed to delete item", variant: "destructive" });
    }
  };

  if (isLoading) return <p className="p-4">Loading items...</p>;
  if (isError) return <p className="p-4 text-red-500">Error: {(error as Error).message}</p>;

  return (
      <div className="flex-1 space-y-6 p-8">
        {/* Header & Search */}
        <div className="flex items-center gap-4">
          <h2 className="w-1/2 text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Item Catalog
          </h2>
          <div className="relative flex-1 max-w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full"
            />
            {/* Clear Button */}
            {search && (
                <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-2.5 h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
            )}
          </div>
          <AddItemDialog />
        </div>

        {/* Table Card */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              All Items ({sortedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="table-fixed border-collapse">
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead
                      onClick={() => handleSort("name")}
                      className="cursor-pointer select-none text-muted-foreground w-4/5"
                  >
                    Item
                    <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                  </TableHead>
                  <TableHead className="w-1/5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea
                ref={parentRef}
                className="h-[calc(100vh-300px)] w-full"
            >
              <Table className="table-fixed border-collapse">
                <TableBody>
                  {/* Top spacer */}
                  <tr style={{ height: rowVirtualizer.getVirtualItems()[0]?.start ?? 0 }} />

                  {rowVirtualizer.getVirtualItems().map((vRow) => {
                    const item = sortedItems[vRow.index];
                    return (
                        <TableRow
                            key={item.id}
                            style={{ height: vRow.size }}
                            className="border-border hover:bg-secondary/50"
                        >
                          <TableCell className="flex items-center space-x-3 w-4/5 ">
                            {item.iconUrl ? (
                                <img
                                    src={`https://community.fastly.steamstatic.com/economy/image/${item.iconUrl}`}
                                    alt={item.name}
                                    className="h-20 w-20 rounded object-contain border border-border"
                                    loading="lazy"
                                />
                            ) : (
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_URL}uploads/profile/default.jpg?v=${Date.now()}`}
                                    alt={item.name}
                                    className="h-20 w-20 rounded object-contain border border-border"
                                    loading="lazy"
                                />
                            )}
                            <p className="font-medium text-foreground">{item.name}</p>
                          </TableCell>
                          <TableCell className="w-1/5 text-right">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                                onClick={() => {
                                  setSelectedItemId(item.id);
                                  setPurchaseDialogOpen(true);
                                }}
                            >
                              <ShoppingCart className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                                onClick={() => {
                                  setEditingItem(item);
                                  setEditDialogOpen(true);
                                }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                                onClick={() => handleDelete(item.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                    );
                  })}

                  {/* Bottom spacer */}
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

        {/* Edit Dialog */}
        {editingItem && (
            <AddItemDialog
                item={editingItem}
                open={editDialogOpen}
                onOpenChange={(open) => {
                  setEditDialogOpen(open);
                  if (!open) setEditingItem(null);
                }}
            />
        )}

        {/* Purchase Dialog */}
        {selectedItemId !== null && (
            <AddPurchaseDialog
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
