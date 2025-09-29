import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockItems, mockInventoryEntries, mockPriceHistory } from "@/data/mockData";

export function InventoryTable() {
  const inventoryWithDetails = mockInventoryEntries.map(entry => {
    const item = mockItems.find(item => item.id === entry.itemId);
    const latestPrice = mockPriceHistory
      .filter(price => price.itemId === entry.itemId)
      .sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())[0];
    
    return {
      ...entry,
      item,
      latestPrice: latestPrice?.price || 0,
      totalValue: (latestPrice?.price || 0) * entry.quantityOnHand
    };
  });

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Inventory Management
        </h2>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Item</TableHead>
                <TableHead className="text-muted-foreground">Market Name</TableHead>
                <TableHead className="text-muted-foreground">Quantity</TableHead>
                <TableHead className="text-muted-foreground">Unit Price</TableHead>
                <TableHead className="text-muted-foreground">Total Value</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryWithDetails.map((entry) => (
                <TableRow key={entry.id} className="border-border hover:bg-secondary/50">
                  <TableCell className="flex items-center space-x-3">
                    {entry.item?.iconUrl && (
                      <img 
                        src={entry.item.iconUrl} 
                        alt={entry.item.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{entry.item?.name || 'Unknown Item'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.item?.marketHashName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {entry.quantityOnHand}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    ${entry.latestPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    ${entry.totalValue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={entry.quantityOnHand > 0 ? "default" : "destructive"}
                      className={entry.quantityOnHand > 0 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {entry.quantityOnHand > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}