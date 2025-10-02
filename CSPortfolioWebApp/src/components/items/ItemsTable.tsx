import { useRef, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

import {addItems, deleteItem, getItems} from "@/lib/api";
import { Item } from "@/types/inventory";

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
import { Input } from "@/components/ui/input";        // <- if using Shadcn Input
import {Plus, Edit, Search, ArrowUpDown, Trash, ShoppingCart} from "lucide-react";
import {AddItemDialog} from "@/components/items/AddItemsDialog.tsx";
import {toast} from "@/hooks/use-toast.ts";

export function ItemsTable() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading, isError, error } = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: getItems,
    select: (data) =>
        [...data].sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
        ),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // --- search state ---
  const [search, setSearch] = useState("");

  // Filter items by name (case-insensitive)
  const filteredItems = useMemo(() => {
    const s = search.trim().toLowerCase();
    return s
        ? items.filter((it) => it.name.toLowerCase().includes(s))
        : items;
  }, [items, search]);

  // --- Sorting state ---
  type SortKey = "name" | null;
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
    if (!sortKey) return filteredItems;

    return [...filteredItems].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortKey) {
        case "name":
          valA = a.name?.toLowerCase() || "";
          valB = b.name?.toLowerCase() || "";
          break;
        default:
          valA = "";
          valB = "";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortKey, sortOrder]);

  // --- Virtualizer setup ---
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: sortedEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,  // px per row
    overscan: 100,
  });


  if (isLoading) return <p className="p-4">Loading items...</p>;
  if (isError) return <p className="p-4 text-red-500">Error: {(error as Error).message}</p>;

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteItem(id);
      toast({ title: "Item deleted", variant: "default" });
      // @ts-ignore
      await queryClient.invalidateQueries(['items'] ); // refetch
    } catch (err) {
      toast({ title: "Failed to delete item", variant: "destructive" });
    }
  };

  return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Item Catalog
          </h2>

          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
            />
          </div>

          <AddItemDialog />
        </div>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              All Items ({sortedEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
                ref={parentRef}
                className="relative h-[600px] w-full overflow-auto no-scrollbar"
            >
              <Table className="table-fixed border-collapse">
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Item</TableHead>
                    <TableHead
                        onClick={() => handleSort("name")}
                        className="cursor-pointer select-none text-muted-foreground">
                        Market Hash Name
                        <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {/* top spacer */}
                  <tr style={{ height: rowVirtualizer.getVirtualItems()[0]?.start ?? 0 }} />

                  {rowVirtualizer.getVirtualItems().map((vRow) => {
                    const item = sortedEntries[vRow.index];
                    return (
                        <TableRow
                            key={item.id}
                            style={{ height: vRow.size }}
                            className="border-border hover:bg-secondary/50"
                        >
                          <TableCell className="flex items-center space-x-3">
                            {item.iconUrl && (
                                <img
                                    src={`https://community.fastly.steamstatic.com/economy/image/${item.iconUrl}`}
                                    alt={item.name}
                                    className="h-16 w-16 rounded object-cover border border-border"
                                />
                            )}
                            <div>
                              <p className="font-medium text-foreground">{item.name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate">
                            {item.marketHashName}
                          </TableCell>
                          <TableCell>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <ShoppingCart className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
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

                  {/* bottom spacer */}
                  <tr
                      style={{
                        height:
                            rowVirtualizer.getTotalSize() -
                            (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0),
                      }}
                  />
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
