import axios from "axios";
import {PriceUpdateEvent} from "@/types/PriceHistory.ts";
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // dynamically picks from .env
    headers: {
        "Content-Type": "application/json",
    },
});

// Example typed function

export async function sendPriceUpdateEvent(item: PriceUpdateEvent): Promise<void> {
    const res = await api.post<void>("/event/priceupdate", item); // send item as body
    return res.data;
}
