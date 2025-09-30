import axios from "axios";
import {InventoryEntry, Item, Purchase, Sale} from "@/types/inventory.ts";
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

export async function getPurchases(): Promise<Purchase[]> {
    const res = await api.get<Purchase[]>("/transactions/purchases"); // adjust endpoint to your backend
    return res.data;
}