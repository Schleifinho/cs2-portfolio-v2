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



