import {Item} from "@/types/Item.ts";
import {api} from "@/lib/api.ts";

export async function getItems(): Promise<Item[]> {
    const res = await api.get<Item[]>("/items"); // adjust endpoint to your backend
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