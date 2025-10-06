import { useState, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  getPurchases,
  getSales,
  deletePurchase,
  deleteSale,
} from "@/lib/api";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

import { AddPurchaseDialog } from "@/components/transactions/AddPurchasesDialog";
import { AddSaleDialog } from "@/components/transactions/AddSaleDialog";

import { PurchaseFull, SaleFull } from "@/types/inventory";
import SingleTransactionTable from "@/components/transactions/SingleTransactionTable";

export function TransactionsTable() {
  const queryClient = useQueryClient();
  // Queries
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

  // Sort
  type SortKey = "timestamp" | "price" | "quantity" | "name";
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
        valA = a.name;
        valB = b.name;
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

  // Virtualization
  const purchaseParentRef = useRef<HTMLDivElement>(null);
  const saleParentRef = useRef<HTMLDivElement>(null);

  const purchaseVirtualizer = useVirtualizer({
    count: sortedPurchases.length,
    getScrollElement: () => purchaseParentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  const saleVirtualizer = useVirtualizer({
    count: sortedSales.length,
    getScrollElement: () => saleParentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  // Editing
  const [editingPurchase, setEditingPurchase] = useState<PurchaseFull | null>(null);
  const [editingSale, setEditingSale] = useState<SaleFull | null>(null);

  // Handlers
  const handleDeletePurchase = async (id: number) => {
    if (!confirm("Delete this purchase?")) return;
    try {
      await deletePurchase(id);
      toast({ title: "Purchase deleted" });
      await queryClient.invalidateQueries({queryKey: ["purchases"]});
      await queryClient.invalidateQueries({queryKey: ["inventoryEntries"]});
    } catch {
      toast({ title: "Failed to delete purchase", variant: "destructive" });
    }
  };

  const handleDeleteSale = async (id: number) => {
    if (!confirm("Delete this sale?")) return;
    try {
      await deleteSale(id);
      toast({ title: "Sale deleted" });
      await queryClient.invalidateQueries({queryKey: ["sales"]});
      await queryClient.invalidateQueries({queryKey: ["inventoryEntries"]});
    } catch {
      toast({ title: "Failed to delete sale", variant: "destructive" });
    }
  };

  return (
      <div className="flex-1 space-y-6 p-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Transactions
        </h2>

        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-secondary">
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-4">
            <SingleTransactionTable
                title="Purchase Transactions"
                data={sortedPurchases}
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
                title="Sales Transactions"
                data={sortedSales}
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
