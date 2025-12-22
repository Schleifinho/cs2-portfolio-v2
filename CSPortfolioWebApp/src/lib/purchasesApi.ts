import {Purchase, PurchaseFull} from "@/types/Purchase";
import {api} from "@/lib/api.ts";

export async function getPurchases(): Promise<PurchaseFull[]> {
    const res = await api.get<PurchaseFull[]>("/transactions/purchases"); // adjust endpoint to your backend
    return res.data;
}

export async function addPurchaseByItemId(purchase: Omit<Purchase, "id">): Promise<Purchase> {
    const res = await api.post<Purchase>("/transactions/purchase", purchase); // adjust endpoint to your backend
    return res.data;
}

export async function addPurchasesBulk(purchases: Omit<Purchase, "id">[]): Promise<Purchase[]> {
    const res = await api.post<Purchase[]>("/transactions/purchase/bulk", purchases); // backend bulk endpoint
    return res.data;
}

export async function updatePurchase(purchase: Purchase): Promise<Purchase> {
    const res = await api.put<Purchase>(`/transactions/purchase/${purchase.id}`, purchase); // adjust endpoint to your backend
    return res.data;
}

export async function deletePurchase(id: number): Promise<void> {
    const res = await api.delete<void>(`/transactions/purchase/${id}`); // send item as body
    return res.data;
}

