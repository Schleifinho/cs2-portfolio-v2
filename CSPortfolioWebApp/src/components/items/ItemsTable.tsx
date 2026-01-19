import {useRef, useState, useMemo} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useVirtualizer} from "@tanstack/react-virtual";
import {getItems, deleteItem} from "@/lib/itemsApi";
import {Item} from "@/types/Item";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Search,
  ArrowUpDown,
  Edit,
  Trash,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  X
} from "lucide-react";
import {AddItemDialog} from "@/components/items/AddItemsDialog";
import {toast} from "@/hooks/use-toast";
import {AddPurchaseDialog} from "@/components/transactions/AddPurchasesDialog.tsx";
import {useTokenSearch} from "@/lib/searchbar.ts";
import {useAuth} from "@/lib/AuthContext.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {AppRoles} from "@/types/AppRoles.ts";
import {Badge} from "@/components/ui/badge";

// Define consistent column widths for desktop alignment
const COL_WIDTHS = {
  item: "flex-1 md:w-[80%]",
  actions: "w-[120px] md:w-[20%]"
};

export function ItemsTable() {
  const queryClient = useQueryClient();
  const {user, hasAnyRole} = useAuth();

  const {data: items = [], isLoading, isError, error} = useQuery<Item[]>({
    queryKey: ["items", user?.username],
    queryFn: getItems,
    select: (data) => [...data].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    staleTime: 1000 * 60 * 5,
  });

  const [search, setSearch] = useState("");
  const filteredItems = useTokenSearch(items, search, (s) => s.name);

  // Sorting
  const [sortKey, setSortKey] = useState<"name" | null>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: "name") => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const rowVirtualizer = useVirtualizer({
    count: sortedItems.length,
    getScrollElement: () => parentRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement,
    estimateSize: () => (isMobile ? 140 : 64),
    overscan: 20,
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
      toast({title: "Item deleted"});
      await queryClient.invalidateQueries({queryKey: ["items"]});
    } catch {
      toast({title: "Failed to delete item", variant: "destructive"});
    }
  };

  const SortIcon = ({column}: { column: string }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 opacity-30 ml-1"/>;
    return sortOrder === "asc" ? <ArrowUp className="h-3 w-3 ml-1 text-primary"/> :
      <ArrowDown className="h-3 w-3 ml-1 text-primary"/>;
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Indexing Global
    Catalog...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Database Connection
    Error: {(error as Error).message}</div>;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden space-y-4">

      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 shrink-0 px-1">
        {/* SEARCH & ACTIONS ROW */}
        <div
          className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between w-full min-w-0">
          {/* Search Input Container */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10"/>
            <Input
              placeholder="Search by name or token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 md:h-9 w-full bg-background border-muted/40 focus:border-primary/40 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4"/>
              </button>
            )}
          </div>

          {/* Add Item Button - Full width on mobile, inline on desktop */}
          <div className="shrink-0">
            <AddItemDialog/>
          </div>
        </div>
      </div>

      {/* LIST CONTAINER */}
      <div
        className="flex-1 min-h-0 bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden flex flex-col">

        {/* DESKTOP HEADER (Flex-aligned with body) */}
        <div className="hidden md:flex bg-muted/5 border-b shrink-0 pr-4 py-3 px-6">
          <div
            onClick={() => handleSort("name")}
            className={`${COL_WIDTHS.item} cursor-pointer select-none flex items-center gap-1 uppercase text-[10px] font-black tracking-widest text-muted-foreground/70 hover:text-foreground transition-colors`}
          >
            Item Database ({sortedItems.length}) <SortIcon column="name"/>
          </div>
          <div
            className={`${COL_WIDTHS.actions} text-right uppercase text-[10px] font-black tracking-widest text-muted-foreground/70`}>
            Actions
          </div>
        </div>

        {/* VIRTUALIZED SCROLL AREA */}
        <ScrollArea ref={parentRef} className="flex-1 w-full">
          <div className="w-full relative">
            <div style={{height: rowVirtualizer.getVirtualItems()[0]?.start ?? 0}}/>

            {rowVirtualizer.getVirtualItems().map((vRow) => {
              const item = sortedItems[vRow.index];
              if (!item) return null;

              return (
                <div key={item.id} style={{height: vRow.size}} className="border-b border-border/40 last:border-0">

                  {/* --- DESKTOP VIEW --- */}
                  <div
                    className="hidden md:flex w-full items-center px-6 hover:bg-muted/20 transition-all group h-full">
                    <div className={`${COL_WIDTHS.item} flex items-center gap-4 min-w-0`}>
                      <div
                        className="h-12 w-12 shrink-0 bg-muted/20 rounded-lg border border-border/50 flex items-center justify-center overflow-hidden group-hover:border-primary/30 transition-colors">
                        <img
                          src={item.iconUrl ? `https://community.fastly.steamstatic.com/economy/image/${item.iconUrl}` : "/uploads/profile/default.jpg"}
                          className="h-10 w-10 object-contain p-0.5"
                          loading="lazy"
                          alt={item.name}/>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate tracking-tight text-foreground">{item.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/60">REF: #{item.id}</span>
                      </div>
                    </div>

                    <div
                      className={`${COL_WIDTHS.actions} flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0`}>
                      <Button size="icon" variant="secondary" className="h-8 w-8 text-primary shadow-sm"
                              onClick={() => {
                                setSelectedItemId(item.id);
                                setPurchaseDialogOpen(true);
                              }}>
                        <ShoppingCart className="h-4 w-4"/>
                      </Button>
                      {hasAnyRole(AppRoles.Mod, AppRoles.Admin) && (
                        <>
                          <Button size="icon" variant="outline" className="h-8 w-8 border-muted" onClick={() => {
                            setEditingItem(item);
                            setEditDialogOpen(true);
                          }}>
                            <Edit className="h-3.5 w-3.5"/>
                          </Button>
                          <Button size="icon" variant="outline"
                                  className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10 border-muted"
                                  onClick={() => handleDelete(item.id)}>
                            <Trash className="h-3.5 w-3.5"/>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* --- MOBILE CARD VIEW (Matches Inventory & Transactions) --- */}
                  <div className="flex md:hidden flex-col p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-14 w-14 shrink-0 bg-muted/20 rounded-xl border border-border/60 flex items-center justify-center">
                        <img
                          src={item.iconUrl ? `https://community.fastly.steamstatic.com/economy/image/${item.iconUrl}` : "/uploads/profile/default.jpg"}
                          className="h-11 w-11 object-contain"
                          alt={item.name}
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black leading-tight">{item.name}</span>
                        </div>
                        <Badge variant="outline"
                               className="w-fit mt-1.5 h-4 px-1.5 text-[9px] font-mono border-muted text-muted-foreground uppercase">
                          Registry ID: {item.id}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest gap-2 shadow-md"
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setPurchaseDialogOpen(true);
                        }}
                      >
                        <ShoppingCart className="h-3.5 w-3.5"/>Add Purchase
                      </Button>

                      {hasAnyRole(AppRoles.Mod, AppRoles.Admin) && (
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="icon" className="h-10 w-10 border-muted/60" onClick={() => {
                            setEditingItem(item);
                            setEditDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4"/>
                          </Button>
                          <Button variant="outline" size="icon" className="h-10 w-10 text-red-500 border-muted/60"
                                  onClick={() => handleDelete(item.id)}>
                            <Trash className="h-4 w-4"/>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
            <div style={{height: rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)}}/>
          </div>
        </ScrollArea>
      </div>

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