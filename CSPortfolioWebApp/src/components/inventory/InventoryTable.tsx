import React, {useState, useMemo} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
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
import {
  Search,
  ShoppingCart,
  RefreshCcw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

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
import {AppRoles} from "@/types/AppRoles.ts";

export function InventoryTable() {
  const queryClient = useQueryClient();
  const {user, hasAnyRole} = useAuth();

  const {data: inventoryEntries = [], isLoading} = useQuery<InventoryEntry[]>({
    queryKey: ["inventoryEntries", user?.username],
    queryFn: getInventoryEntries,
    select: (data) => [...data].sort((a, b) => (b.trend ?? 0) - (a.trend ?? 0)),
    staleTime: 1000 * 60 * 5,
  });

  const [search, setSearch] = useState("");
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const filteredEntries = useTokenSearch(inventoryEntries.filter(s => s.quantity > 0), search, (s) => s.name);

  const [sortKey, setSortKey] = useState<keyof InventoryEntry | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: keyof InventoryEntry) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedEntries = useMemo(() => {
    if (!sortKey) return filteredEntries;
    return [...filteredEntries].sort((a, b) => {
      const valA = a[sortKey] ?? 0;
      const valB = b[sortKey] ?? 0;
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredEntries, sortKey, sortOrder]);

  const handlePriceRefresh = async (itemId: number, marketHashName: string) => {
    const item: PriceUpdateEvent = {itemId, marketHashName};
    await sendPriceUpdateEvent(item);
    await queryClient.invalidateQueries({queryKey: ["inventoryEntries"]});
  };

  const handlePriceRefreshAll = async () => {
    for (const item of sortedEntries) {
      await handlePriceRefresh(item.itemId, item.marketHashName);
    }
  };

  // --- FIX: Trend Indicator Logic ---
  const renderTrendBadge = (trend: number) => {
    if (trend > 0) {
      return (
        <Badge variant="outline"
               className="bg-green-500/10 text-green-600 border-green-500/20 whitespace-nowrap px-2 h-6">
          <TrendingUp className="h-3 w-3 mr-1"/> +{trend.toFixed(2)}€
        </Badge>
      );
    } else if (trend < 0) {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 whitespace-nowrap px-2 h-6">
          <TrendingDown className="h-3 w-3 mr-1"/> {trend.toFixed(2)}€
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground whitespace-nowrap px-2 h-6">
        <Minus className="h-3 w-3 mr-1"/> 0.00€
      </Badge>
    );
  };

  if (isLoading) return <div className="p-4 text-muted-foreground animate-pulse">Loading...</div>;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden space-y-4">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between shrink-0">

        {/* Search Bar Container - takes full width on mobile, fills remaining space on desktop */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10"/>
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 md:h-9 w-full bg-background"
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

        {/* Button Group - stays on its own line on mobile, follows search bar on desktop */}
        <div className="flex gap-2 shrink-0">
          {hasAnyRole(AppRoles.Mod, AppRoles.Admin) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePriceRefreshAll}
              className="flex-1 md:flex-none h-10 md:h-9 text-xs"
            >
              <RefreshCcw className="h-4 w-4 mr-2 shrink-0"/>
              <span className="truncate">Price Refresh</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({queryKey: ["inventoryEntries"]})}
            className="flex-1 md:flex-none h-10 md:h-9 text-xs"
          >
            <RefreshCcw className="h-4 w-4 md:mr-0 lg:mr-2 shrink-0"/>
            <span className="hidden lg:inline truncate">View Refresh</span>
            <span className="lg:hidden md:hidden inline">View Refresh</span>
          </Button>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <Card className="flex-1 min-h-0 flex flex-col border shadow-sm overflow-hidden w-full">
        <CardHeader className="border-b py-3 shrink-0 bg-muted/5">
          <div className="flex justify-between items-center w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate">
                Assets
              </CardTitle>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-mono font-medium">
                {sortedEntries.length}
              </Badge>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Total Trend Pill */}
              {(() => {
                const totalTrend = sortedEntries.reduce((sum, item) => sum + (item.trend ?? 0), 0);
                if (totalTrend === 0) return null;

                const isPositive = totalTrend > 0;
                return (
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition-colors ${
                      isPositive
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                    }`}>
                    {isPositive ? <TrendingUp className="h-3 w-3"/> : <TrendingDown className="h-3 w-3"/>}
                    <span>{isPositive ? '+' : ''}{totalTrend.toFixed(2)}€</span>
                  </div>
                );
              })()}

              {/* Vertical Separator */}
              <div className="h-4 w-[1px] bg-border mx-1"/>

              {/* Main Total Value */}
              <div className="flex flex-col items-end">
        <span className="text-[9px] text-muted-foreground uppercase font-black leading-none mb-0.5">
          Inventory Value
        </span>
                <div className="text-sm font-black text-primary tabular-nums tracking-tight">
                  {sortedEntries.reduce((sum, item) => sum + item.totalValue, 0).toFixed(2)}€
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 min-h-0 flex flex-col overflow-hidden w-full">

          {/* --- DESKTOP VIEW --- */}
          <div className="hidden md:flex flex-col h-full min-h-0 overflow-hidden">
            <div className="shrink-0 border-b">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {/* Helper to render the correct icon based on state */}
                    {Object.entries({
                      name: "Item",
                      quantity: "Qty",
                      totalValue: "Value",
                      currentPrice: "Price",
                      trend: "Trend"
                    }).map(([key, label]) => (
                      <TableHead
                        key={key}
                        onClick={() => handleSort(key as keyof InventoryEntry)}
                        className={`cursor-pointer select-none ${key === 'name' ? 'w-[35%]' : 'text-center'}`}
                      >
                        <div
                          className={`flex items-center ${key !== 'name' ? 'justify-center' : ''} gap-1 uppercase text-[11px] font-bold`}>
                          {label}
                          {sortKey === key ? (
                            sortOrder === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-primary"/>
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-primary"/>
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity"/>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right w-[15%] pr-10 uppercase text-[11px] font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            <ScrollArea className="flex-1 w-full">
              <Table className="table-fixed w-full">
                <TableBody>
                  {sortedEntries.map((entry) => (
                    <TableRow key={entry.itemId} className="group hover:bg-muted/30 border-b transition-colors">
                      <TableCell className="py-3 w-[35%]">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.iconUrl ? `https://community.fastly.steamstatic.com/economy/image/${entry.iconUrl}` : "/default.jpg"}
                            className="h-10 w-10 object-contain shrink-0"/>
                          <span className="font-medium truncate">{entry.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center w-[10%] font-mono"><Badge
                        variant="secondary">{entry.quantity}</Badge></TableCell>
                      <TableCell className="text-center w-[15%] font-bold">{entry.totalValue.toFixed(2)}€</TableCell>
                      <TableCell
                        className="text-center w-[15%] text-muted-foreground">{entry.currentPrice.toFixed(2)}€</TableCell>
                      <TableCell className="text-center w-[10%]">
                        {renderTrendBadge(entry.trend)}
                      </TableCell>
                      <TableCell className="text-right w-[15%] pr-4">
                        <div
                          className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => {
                            setSelectedItemId(entry.itemId);
                            setPurchaseDialogOpen(true);
                          }}><ShoppingCart className="h-4 w-4"/></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => {
                            setSelectedItemId(entry.itemId);
                            setSaleDialogOpen(true);
                          }}><DollarSign className="h-4 w-4"/></Button>
                          {hasAnyRole(AppRoles.Mod, AppRoles.Admin) && (
                            <Button size="icon" variant="ghost" className="h-8 w-8"
                                    onClick={() => handlePriceRefresh(entry.itemId, entry.marketHashName)}><RefreshCcw
                              className="h-4 w-4"/></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* --- MOBILE VIEW --- */}
          <div className="flex md:hidden flex-col flex-1 min-h-0 w-100 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="flex flex-col gap-3 pb-10 w-full overflow-hidden">
                {sortedEntries.map((entry) => (
                  <div
                    key={entry.itemId}
                    className="bg-card border rounded-lg p-3 shadow-sm flex flex-col w-full min-w-0 overflow-hidden box-border"
                  >
                    {/* Row 1: Item Identity */}
                    <div className="flex gap-4 mb-3 items-center min-w-0">
                      <div className="h-20 w-20 rounded bg-muted/20 border shrink-0 flex items-center justify-center">
                        <img
                          src={entry.iconUrl ? `https://community.fastly.steamstatic.com/economy/image/${entry.iconUrl}` : "/default.jpg"}
                          className="h-15 w-15 object-contain"
                          alt=""
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm leading-tight">{entry.name}</h4>
                      </div>
                    </div>

                    {/* Row 2: Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-dashed mb-3 w-full min-w-0">
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase block truncate">
                          Value
                        </span>
                        <span className="text-sm font-bold block truncate">{entry.totalValue.toFixed(2)}€</span>
                      </div>

                      <div className="text-right min-w-0">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase block truncate">
                          Trend
                        </span>
                        <div className="flex justify-end mt-0.5 min-w-0">{renderTrendBadge(entry.trend)}</div>
                      </div>
                    </div>

                    {/* Row 3: Action Grid (Strictly constrained to available width) */}
                    <div
                      className={`grid gap-2 w-full min-w-0 ${
                        hasAnyRole(AppRoles.Mod, AppRoles.Admin)
                          ? "grid-cols-[1fr_1fr_auto]"
                          : "grid-cols-2"
                      }`}
                    >
                      {/* Buy Button */}
                      <Button
                        className="h-9 text-[11px] flex items-center justify-center truncate"
                        variant="secondary"
                        onClick={() => {
                          setSelectedItemId(entry.itemId);
                          setPurchaseDialogOpen(true);
                        }}
                      >
                        <ShoppingCart className="h-3 w-3 flex-shrink-0"/>
                      </Button>

                      {/* Sell Button */}
                      <Button
                        className="h-9 text-[11px] flex items-center justify-center truncate"
                        variant="secondary"
                        onClick={() => {
                          setSelectedItemId(entry.itemId);
                          setSaleDialogOpen(true);
                        }}
                      >
                        <DollarSign className="h-3 w-3 flex-shrink-0"/>
                      </Button>

                      {/* Mod/Admin Price Refresh */}
                      {hasAnyRole(AppRoles.Mod, AppRoles.Admin) && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 flex-shrink-0"
                          onClick={() => handlePriceRefresh(entry.itemId, entry.marketHashName)}
                        >
                          <RefreshCcw className="h-3.5 w-3.5"/>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedItemId !== null && (
        <>
          <AddSaleDialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen} itemId={selectedItemId}/>
          <AddPurchaseDialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen} itemId={selectedItemId}/>
        </>
      )}
    </div>
  );
}