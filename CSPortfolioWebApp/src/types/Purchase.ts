export interface Purchase {
    id?: number;
    itemId: number;
    quantity: number;
    price: number;
    timestamp: Date;
}

export interface PurchaseFull {
    id?: number;
    itemId: number;
    name: string;
    iconUrl: string;
    quantity: number;
    price: number;
    timestamp: Date;
}