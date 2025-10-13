import {InventoryEntry} from "@/types/InventoryEntry";
import {api} from "@/lib/api.ts";

export async function getInventoryEntries(): Promise<InventoryEntry[]> {
    const res = await api.get<InventoryEntry[]>("/inventoryentries/complete"); // adjust endpoint to your backend
    return res.data;
}


export async function getTopInventoryEntries(count: number): Promise<InventoryEntry[]> {
    const res = await api.get<InventoryEntry[]>(`/inventoryentries/complete/top/${count}`); // adjust endpoint to your backend
    return res.data;
}

export async function getBottomInventoryEntries(count: number): Promise<InventoryEntry[]> {
    const res = await api.get<InventoryEntry[]>(`/inventoryentries/complete/bottom/${count}`); // adjust endpoint to your backend
    return res.data;
}
