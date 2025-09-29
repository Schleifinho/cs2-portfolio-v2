export interface InventoryEntry {
  id?: number;
  itemId: number;
  quantityOnHand: number;
}

export interface Item {
  id?: number;
  name: string;
  marketHashName: string;
  iconUrl?: string;
}

export interface PriceHistory {
  id?: number;
  timeStamp: Date;
  itemId: number;
  price: number;
}

export interface Purchase {
  id?: number;
  inventoryEntryId: number;
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface Sale {
  id?: number;
  inventoryEntryId: number;
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  totalQuantity: number;
  recentTransactions: number;
}