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

export interface PriceUpdateEvent {
  itemId: number;
  marketHashName: string;
}


export interface Purchase {
  id?: number;
  itemId: number;
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface Sale {
  id?: number;
  itemId: number;
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