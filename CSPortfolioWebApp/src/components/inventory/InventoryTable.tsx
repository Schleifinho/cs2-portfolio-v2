import { useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from "lucide-react";

import { getInventoryEntries } from "@/lib/api";
import { InventoryEntry } from "@/types/inventory";

export function InventoryTable() {
  const { data: inventoryEntries = [], isLoading, isError, error } =
      useQuery<InventoryEntry[]>({
        queryKey: ["inventoryentries"],
        queryFn: getInventoryEntries,
        select: (data) =>
            [...data].sort((a, b) => (b.total ?? 0) - (a.total ?? 0)),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      });


  // --- Search state ---
  const [search, setSearch] = useState("");

  // --- Filter by search ---
  const filteredEntries = useMemo(() => {
    const s = search.trim().toLowerCase();
    return s
        ? inventoryEntries.filter((e) => e.name?.toLowerCase().includes(s))
        : inventoryEntries;
  }, [inventoryEntries, search]);

  // --- Sorting state ---
  type SortKey = "name" | "quantity" | "unitPrice" | "total" | null;
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
        case "unitPrice":
          valA = a.currentPrice;
          valB = b.currentPrice;
          break;
        case "total":
          valA = a.total;
          valB = b.total;
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
    overscan: 10,
  });

  if (isLoading) return <p className="p-4">Loading items...</p>;
  if (isError)
    return (
        <p className="p-4 text-red-500">Error: {(error as Error).message}</p>
    );

  return (
      <div className="flex-1 space-y-6 p-8">
        {/* Search bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Inventory Management
          </h2>
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
        </div>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              Current Inventory ({sortedEntries.length})
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
                    <TableHead className="text-muted-foreground">Item</TableHead>
                    <TableHead
                        onClick={() => handleSort("name")}
                        className="cursor-pointer select-none text-muted-foreground"
                    >
                      Name <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                    </TableHead>
                    <TableHead
                        onClick={() => handleSort("quantity")}
                        className="cursor-pointer select-none text-muted-foreground"
                    >
                      Quantity <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                    </TableHead>
                    <TableHead
                        onClick={() => handleSort("unitPrice")}
                        className="cursor-pointer select-none text-muted-foreground"
                    >
                      Unit Price <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                    </TableHead>
                    <TableHead
                        onClick={() => handleSort("total")}
                        className="cursor-pointer select-none text-muted-foreground"
                    >
                      Total Value <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                    </TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {/* Spacer at the top */}
                  <tr style={{ height: rowVirtualizer.getVirtualItems()[0]?.start ?? 0 }} />

                  {rowVirtualizer.getVirtualItems().map((vRow) => {
                    const entry = sortedEntries[vRow.index];
                    return (
                        <TableRow
                            key={entry.id}
                            style={{ height: vRow.size }}
                            className="border-border hover:bg-secondary/50"
                        >
                          <TableCell className="flex items-center space-x-3">
                            {entry.iconUrl && (
                                <img
                                    src={`https://community.steamstatic.com/economy/image/${entry.iconUrl}`}
                                    alt={entry.name}
                                    className="h-24 w-24 rounded object-cover border border-border"
                                />
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {entry.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary border-primary/20"
                            >
                              {entry.quantity}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {entry.currentPrice}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {entry.total}
                          </TableCell>
                          <TableCell>
                            <Badge
                                variant={
                                  entry.quantity > 0 ? "default" : "destructive"
                                }
                                className={
                                  entry.quantity > 0
                                      ? "bg-accent text-accent-foreground"
                                      : "bg-destructive text-destructive-foreground"
                                }
                            >
                              {entry.quantity > 0 ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                    );
                  })}

                  {/* Spacer at the bottom */}
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
