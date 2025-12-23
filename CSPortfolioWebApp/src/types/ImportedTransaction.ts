export interface ImportedTransaction {
  marketName: string;
  actedOn: string;
  type: string;
  displayPrice: number;
  quantity: number;
  enabled: boolean;
  // 🔥 enriched
  itemId?: number;
  iconUrl?: string;
  matched?: boolean;
}
