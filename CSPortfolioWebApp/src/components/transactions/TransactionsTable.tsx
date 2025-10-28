import {useState, useMemo, useRef, useEffect} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  getSales,
  deleteSale,
} from "@/lib/salesApi";
import {
  getPurchases,
  deletePurchase,
} from "@/lib/purchasesApi";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

import { AddPurchaseDialog } from "@/components/transactions/AddPurchasesDialog";
import { AddSaleDialog } from "@/components/transactions/AddSaleDialog";

import { PurchaseFull} from "@/types/Purchase";
import { SaleFull } from "@/types/Sale";
import SingleTransactionTable from "@/components/transactions/SingleTransactionTable";

// 🔹 UI imports
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {useTokenSearch} from "@/lib/searchbar.ts";

export function TransactionsTable() {
  const queryClient = useQueryClient();

  // 🔹 Queries
  const {
    data: purchases = [],
    isLoading: loadingPurchases,
    isError: errorPurchases,
  } = useQuery<PurchaseFull[]>({
    queryKey: ["purchases"],
    queryFn: getPurchases,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: sales = [],
    isLoading: loadingSales,
    isError: errorSales,
  } = useQuery<SaleFull[]>({
    queryKey: ["sales"],
    queryFn: getSales,
    staleTime: 5 * 60 * 1000,
  });

  const [activeTab, setActiveTab] = useState<"purchases" | "sales">("purchases");

  useEffect(() => {
    if (activeTab === "purchases") {
      purchaseParentRef.current?.scrollTo(0, 0);
    } else {
      saleParentRef.current?.scrollTo(0, 0);
    }
  }, [activeTab]);

  // 🔹 Sort
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
      let valA: any;
      let valB: any;

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

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  };

  const sortedPurchases = useMemo(
      () => sortTransactions(purchases),
      [purchases, sortKey, sortOrder]
  );
  const sortedSales = useMemo(
      () => sortTransactions(sales),
      [sales, sortKey, sortOrder]
  );

  // 🔹 Search
  const [search, setSearch] = useState("");

  const filteredPurchases = useTokenSearch(sortedPurchases, search, (p) => p.name);
  const filteredSales = useTokenSearch(sortedSales, search, (s) => s.name);

  // 🔹 Virtualization
  const purchaseParentRef = useRef<HTMLDivElement>(null);
  const saleParentRef = useRef<HTMLDivElement>(null);

  const purchaseVirtualizer = useVirtualizer({
    count: filteredPurchases.length, // <- this must reflect the current data length
    getScrollElement: () => purchaseParentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  const saleVirtualizer = useVirtualizer({
    count: filteredSales.length, // <- must update when switching tabs
    getScrollElement: () => saleParentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  // 🔹 Editing
  const [editingPurchase, setEditingPurchase] = useState<PurchaseFull | null>(null);
  const [editingSale, setEditingSale] = useState<SaleFull | null>(null);

  // 🔹 Handlers
  const handleDeletePurchase = async (id: number) => {
    if (!confirm("Delete this purchase?")) return;
    try {
      await deletePurchase(id);
      toast({ title: "Purchase deleted" });
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["inventoryEntries"] });
    } catch {
      toast({ title: "Failed to delete purchase", variant: "destructive" });
    }
  };

  const handleDeleteSale = async (id: number) => {
    if (!confirm("Delete this sale?")) return;
    try {
      await deleteSale(id);
      toast({ title: "Sale deleted" });
      await queryClient.invalidateQueries({ queryKey: ["sales"] });
      await queryClient.invalidateQueries({ queryKey: ["inventoryEntries"] });
    } catch {
      toast({ title: "Failed to delete sale", variant: "destructive" });
    }
  };

  return (
      <div className="flex-1 space-y-6 p-8">
        {/* 🔹 Header with Search */}
        <div className="flex items-center gap-4">
          <h2 className="w-1/2 text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Transactions
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
          </div>
        </div>

        {/* 🔹 Tabs */}
        <Tabs defaultValue="purchases" className="w-full" onValueChange={(val) => setActiveTab(val as "purchases" | "sales")}>
          <TabsList className="grid grid-cols-2 w-full bg-secondary">
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-4">
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

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
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
        </Tabs>

        {/* Edit dialogs */}
        {editingPurchase && (
            <AddPurchaseDialog
                open={true}
                onOpenChange={() => setEditingPurchase(null)}
                purchase={editingPurchase}
                itemId={editingPurchase.itemId}
            />
        )}
        {editingSale && (
            <AddSaleDialog
                open={true}
                onOpenChange={() => setEditingSale(null)}
                sale={editingSale}
                itemId={editingSale.itemId}
            />
        )}
      </div>
  );
}
