export interface InventoryEntry {
    itemId: number;
    name: string;
    marketHashName: string;
    iconUrl: string;
    quantity: number;
    totalValue: number;
    currentPrice: number;
    trend: number;
}

export interface InventoryStats {
    totalItems: number;
    totalValue: number;
    totalQuantity: number;
    recentTransactions: number;
}
