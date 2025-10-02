import axios from "axios";
import {InventoryEntry, Item, PriceUpdateEvent, Purchase, Sale} from "@/types/inventory.ts";
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // dynamically picks from .env
    headers: {
        "Content-Type": "application/json",
    },
});

// Example typed function
export async function getItems(): Promise<Item[]> {
    const res = await api.get<Item[]>("/items"); // adjust endpoint to your backend
    return res.data;
}

export async function getInventoryEntries(): Promise<InventoryEntry[]> {
    const res = await api.get<InventoryEntry[]>("/inventoryentries/complete"); // adjust endpoint to your backend
    return res.data;
}

export async function getSales(): Promise<Sale[]> {
    const res = await api.get<Sale[]>("/transactions/sales"); // adjust endpoint to your backend
    return res.data;
}

export async function addSale(sale: Omit<Sale, "id">): Promise<Sale> {
    const res = await api.post<Sale>("/transactions/sale", sale); // adjust endpoint to your backend
    return res.data;
}

export async function updateSale(sale:Sale): Promise<Sale> {
    const res = await api.put<Sale>("/transactions/sale", sale); // adjust endpoint to your backend
    return res.data;
}

export async function deleteSale(id: number): Promise<void> {
    const res = await api.delete<void>(`/transactions/sale/${id}`); // send item as body
    return res.data;
}

export async function getPurchases(): Promise<Purchase[]> {
    const res = await api.get<Purchase[]>("/transactions/purchases"); // adjust endpoint to your backend
    return res.data;
}

export async function addPurchaseByItemId(purchase: Omit<Purchase, "id">): Promise<Purchase> {
    const res = await api.post<Purchase>("/transactions/purchase", purchase); // adjust endpoint to your backend
    return res.data;
}

export async function updatePurchase(purchase: Purchase): Promise<Purchase> {
    const res = await api.put<Purchase>("/transactions/purchase", purchase); // adjust endpoint to your backend
    return res.data;
}

export async function deletePurchase(id: number): Promise<void> {
    const res = await api.delete<void>(`/transactions/purchase/${id}`); // send item as body
    return res.data;
}


export async function addItem(item: Omit<Item, "id">): Promise<Item> {
    const res = await api.post<Item>("/items", item); // send item as body
    return res.data;
}

export async function updateItem(item: Item): Promise<Item> {
    const res = await api.put<Item>("/items", item); // send item as body
    return res.data;
}

export async function deleteItem(itemId: number): Promise<void> {
    const res = await api.delete<void>(`/items/${itemId}`); // send item as body
    return res.data;
}

export async function sendPriceUpdateEvent(item: PriceUpdateEvent): Promise<void> {
    const res = await api.post<void>("/event/priceupdate", item); // send item as body
    return res.data;
}
