import React, {useState, useMemo, useRef} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useVirtualizer} from "@tanstack/react-virtual";
import {getSales, deleteSale} from "@/lib/salesApi";
import {getPurchases, deletePurchase} from "@/lib/purchasesApi";

import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {toast} from "@/hooks/use-toast";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Search, Upload, ArrowDownLeft, ArrowUpRight, X} from "lucide-react";

import {AddPurchaseDialog} from "@/components/transactions/AddPurchasesDialog";
import {AddSaleDialog} from "@/components/transactions/AddSaleDialog";
import {ImportTransactionsDialog} from "@/components/transactions/ImportTransactionsDialog.tsx";
import SingleTransactionTable from "@/components/transactions/SingleTransactionTable";

import {PurchaseFull} from "@/types/Purchase";
import {SaleFull} from "@/types/Sale";
import {useTokenSearch} from "@/lib/searchbar.ts";
import {useAuth} from "@/lib/AuthContext.tsx";

export function TransactionsTable() {
  const queryClient = useQueryClient();
  const {user} = useAuth();
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Queries
  const {data: purchases = [], isLoading: loadingPurchases, isError: errorPurchases} = useQuery<PurchaseFull[]>({
    queryKey: ["purchases", user?.username],
    queryFn: getPurchases,
    staleTime: 5 * 60 * 1000,
  });

  const {data: sales = [], isLoading: loadingSales, isError: errorSales} = useQuery<SaleFull[]>({
    queryKey: ["sales", user?.username],
    queryFn: getSales,
    staleTime: 5 * 60 * 1000,
  });

  // Sort State
  type SortKey = "timestamp" | "price" | "quantity" | "name" | "total";
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortTransactions = (data: (PurchaseFull | SaleFull)[]) => {
    return [...data].sort((a, b) => {
      let valA: any, valB: any;
      if (sortKey === "timestamp") {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      } else if (sortKey === "price") {
        valA = a.price;
        valB = b.price;
      } else if (sortKey === "quantity") {
        valA = a.quantity;
        valB = b.quantity;
      } else if (sortKey === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortKey === "total") {
        valA = a.price * a.quantity;
        valB = b.price * b.quantity;
      }
      return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  };

  const filteredPurchases = useTokenSearch(useMemo(() => sortTransactions(purchases), [purchases, sortKey, sortOrder]), search, (p) => p.name);
  const filteredSales = useTokenSearch(useMemo(() => sortTransactions(sales), [sales, sortKey, sortOrder]), search, (s) => s.name);

  // Virtualization
  const purchaseParentRef = useRef<HTMLDivElement>(null);
  const saleParentRef = useRef<HTMLDivElement>(null);

  const purchaseVirtualizer = useVirtualizer({
    count: filteredPurchases.length,
    getScrollElement: () => purchaseParentRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement,
    estimateSize: () => 64,
    overscan: 25,
  });

  const saleVirtualizer = useVirtualizer({
    count: filteredSales.length,
    getScrollElement: () => saleParentRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement,
    estimateSize: () => 64,
    overscan: 25,
  });

  const [editingPurchase, setEditingPurchase] = useState<PurchaseFull | null>(null);
  const [editingSale, setEditingSale] = useState<SaleFull | null>(null);

  const handleDeletePurchase = async (id: number) => {
    if (!confirm("Delete this purchase?")) return;
    try {
      await deletePurchase(id);
      toast({title: "Purchase deleted"});
      queryClient.invalidateQueries({queryKey: ["purchases"]});
      queryClient.invalidateQueries({queryKey: ["inventoryEntries"]});
    } catch {
      toast({title: "Failed to delete", variant: "destructive"});
    }
  };

  const handleDeleteSale = async (id: number) => {
    if (!confirm("Delete this sale?")) return;
    try {
      await deleteSale(id);
      toast({title: "Sale deleted"});
      await queryClient.invalidateQueries({queryKey: ["sales"]});
      await queryClient.invalidateQueries({queryKey: ["inventoryEntries"]});
    } catch {
      toast({title: "Failed to delete", variant: "destructive"});
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-full overflow-hidden space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 shrink-0 px-1">
        {/* SEARCH & ACTIONS ROW */}
        <div
          className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between w-full min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10"/>
            <Input
              placeholder="Filter by item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 md:h-9 w-full bg-background"
            />
            {search && (
              <button onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4"/>
              </button>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}
                  className="h-10 md:h-9 gap-2 shrink-0">
            <Upload className="h-4 w-4"/>
            <span className="font-bold text-xs uppercase tracking-tight">Import CSV</span>
          </Button>
        </div>
      </div>

      {/* TABS & TABLE CONTENT */}
      <Tabs defaultValue="purchases" className="flex-1 flex flex-col min-h-0 w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md self-start bg-muted/50 p-1 shrink-0 mb-4">
          <TabsTrigger value="purchases" className="flex gap-2 items-center text-xs font-bold uppercase tracking-tight">
            <ArrowDownLeft className="h-3.5 w-3.5 text-blue-500"/> Purchases
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex gap-2 items-center text-xs font-bold uppercase tracking-tight">
            <ArrowUpRight className="h-3.5 w-3.5 text-green-500"/> Sales
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 bg-card border rounded-xl shadow-sm overflow-hidden">
          <TabsContent value="purchases" className="h-full m-0 outline-none">
            <SingleTransactionTable
              title="Purchases"
              data={filteredPurchases}
              loading={loadingPurchases}
              error={errorPurchases}
              parentRef={purchaseParentRef}
              virtualizer={purchaseVirtualizer}
              onSort={handleSort}
              onEdit={setEditingPurchase}
              onDelete={handleDeletePurchase}
            />
          </TabsContent>

          <TabsContent value="sales" className="h-full m-0 outline-none">
            <SingleTransactionTable
              title="Sales"
              data={filteredSales}
              loading={loadingSales}
              error={errorSales}
              parentRef={saleParentRef}
              virtualizer={saleVirtualizer}
              onSort={handleSort}
              onEdit={setEditingSale}
              onDelete={handleDeleteSale}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* DIALOGS */}
      <ImportTransactionsDialog open={importOpen} onOpenChange={setImportOpen}/>
      {editingPurchase && (
        <AddPurchaseDialog open={true} onOpenChange={() => setEditingPurchase(null)} purchase={editingPurchase}
                           itemId={editingPurchase.itemId}/>
      )}
      {editingSale && (
        <AddSaleDialog open={true} onOpenChange={() => setEditingSale(null)} sale={editingSale}
                       itemId={editingSale.itemId}/>
      )}
    </div>
  );
}