export interface Sale {
    id?: number;
    itemId: number;
    quantity: number;
    price: number;
    timestamp: Date;
}

export interface SaleFull {
    id?: number;
    itemId: number;
    name: string;
    iconUrl: string;
    quantity: number;
    price: number;
    timestamp: Date;
}