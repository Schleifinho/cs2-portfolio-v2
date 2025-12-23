import {Sale, SaleFull} from "@/types/Sale";
import {api} from "@/lib/api.ts";

export async function getSales(): Promise<SaleFull[]> {
    const res = await api.get<SaleFull[]>("/transactions/sales"); // adjust endpoint to your backend
    return res.data;
}

export async function addSale(sale: Omit<Sale, "id">): Promise<Sale> {
    const res = await api.post<Sale>("/transactions/sale", sale); // adjust endpoint to your backend
    return res.data;
}

export async function addSalesBulk(sales: Omit<Sale, "id">[]): Promise<Sale[]> {
    const res = await api.post<Sale[]>("/transactions/sale/bulk", sales); // backend bulk endpoint
    return res.data;
}

export async function updateSale(sale:Sale): Promise<Sale> {
    const res = await api.put<Sale>(`/transactions/sale/${sale.id}`, sale); // adjust endpoint to your backend
    return res.data;
}

export async function deleteSale(id: number): Promise<void> {
    const res = await api.delete<void>(`/transactions/sale/${id}`); // send item as body
    return res.data;
}