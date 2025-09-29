import { Item, InventoryEntry, PriceHistory, Purchase, Sale } from '@/types/inventory';

export const mockItems: Item[] = [
  {
    id: 1,
    name: "AK-47 | Redline",
    marketHashName: "AK-47 | Redline (Field-Tested)",
    iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV092lnYmGmOHxIITck29Y_chOhujT8om7jGu5rhBrYG-mI9XGd1NoaVuD-wS5kujxxcjr99vYBJc/512fx384f"
  },
  {
    id: 2,
    name: "AWP | Dragon Lore",
    marketHashName: "AWP | Dragon Lore (Factory New)",
    iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0lvnwDLfYkWNFppwkjrqQo4qn2gSx-0RtYW_7LYCUcVA9ZwzY-gC6w-y905W_vJXNyXYypGB8smoM3nQ/512fx384f"
  },
  {
    id: 3,
    name: "Karambit | Doppler",
    marketHashName: "★ Karambit | Doppler (Factory New)",
    iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI6_Vl2dU7dN_teXE8YXghQThqEFkZz30JYSVIwQ3ZQ7RqFLtk-rvgp--tZrJzHV9-n51V8n9yJo/512fx384f"
  },
  {
    id: 4,
    name: "M4A4 | Howl",
    marketHashName: "M4A4 | Howl (Factory New)",
    iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhoyszMcDFH_9mkgIWKkPvxDLDEm2JS_Nx_teTE9Y-niguyrB84v2qhLYTBcAVrZF3X_1C5wri5h8XvvJjPynBj6D5iuygR9HSsOg/512fx384f"
  },
  {
    id: 5,
    name: "Glock-18 | Fade",
    marketHashName: "Glock-18 | Fade (Factory New)",
    iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0vL3djFN79fnzL-YhMj5Nr_Yg2Yu_dR_h-3--YXygED6-RNrNjqmJoKSIVU4aVrU_VK_k7y5gsC86crMzCRr7CQg4XzUy0a0n1gSOVqOCJfJ/512fx384f"
  }
];

export const mockInventoryEntries: InventoryEntry[] = [
  { id: 1, itemId: 1, quantityOnHand: 5 },
  { id: 2, itemId: 2, quantityOnHand: 1 },
  { id: 3, itemId: 3, quantityOnHand: 2 },
  { id: 4, itemId: 4, quantityOnHand: 1 },
  { id: 5, itemId: 5, quantityOnHand: 3 }
];

export const mockPriceHistory: PriceHistory[] = [
  { id: 1, timeStamp: new Date('2024-01-01'), itemId: 1, price: 89.50 },
  { id: 2, timeStamp: new Date('2024-01-15'), itemId: 1, price: 92.30 },
  { id: 3, timeStamp: new Date('2024-02-01'), itemId: 1, price: 87.20 },
  { id: 4, timeStamp: new Date('2024-02-15'), itemId: 1, price: 95.80 },
  { id: 5, timeStamp: new Date('2024-03-01'), itemId: 1, price: 91.40 },
  
  { id: 6, timeStamp: new Date('2024-01-01'), itemId: 2, price: 8500.00 },
  { id: 7, timeStamp: new Date('2024-01-15'), itemId: 2, price: 8650.00 },
  { id: 8, timeStamp: new Date('2024-02-01'), itemId: 2, price: 8320.00 },
  { id: 9, timeStamp: new Date('2024-02-15'), itemId: 2, price: 8750.00 },
  { id: 10, timeStamp: new Date('2024-03-01'), itemId: 2, price: 8900.00 },
];

export const mockPurchases: Purchase[] = [
  { id: 1, inventoryEntryId: 1, quantity: 2, price: 89.50, timestamp: new Date('2024-01-05') },
  { id: 2, inventoryEntryId: 2, quantity: 1, price: 8500.00, timestamp: new Date('2024-01-10') },
  { id: 3, inventoryEntryId: 3, quantity: 1, price: 1250.00, timestamp: new Date('2024-01-15') },
];

export const mockSales: Sale[] = [
  { id: 1, inventoryEntryId: 1, quantity: 1, price: 95.80, timestamp: new Date('2024-02-20') },
  { id: 2, inventoryEntryId: 5, quantity: 2, price: 185.00, timestamp: new Date('2024-02-25') },
];