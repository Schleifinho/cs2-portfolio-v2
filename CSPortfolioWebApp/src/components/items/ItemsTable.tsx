import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { mockItems, mockInventoryEntries, mockPriceHistory } from "@/data/mockData";

export function ItemsTable() {
  const itemsWithDetails = mockItems.map(item => {
    const inventoryEntry = mockInventoryEntries.find(entry => entry.itemId === item.id);
    const latestPrice = mockPriceHistory
      .filter(price => price.itemId === item.id)
      .sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())[0];
    
    return {
      ...item,
      quantity: inventoryEntry?.quantityOnHand || 0,
      latestPrice: latestPrice?.price || 0
    };
  });

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Item Catalog
        </h2>
        <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">All Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Item</TableHead>
                <TableHead className="text-muted-foreground">Market Hash Name</TableHead>
                <TableHead className="text-muted-foreground">Current Price</TableHead>
                <TableHead className="text-muted-foreground">In Stock</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsWithDetails.map((item) => (
                <TableRow key={item.id} className="border-border hover:bg-secondary/50">
                  <TableCell className="flex items-center space-x-3">
                    {item.iconUrl && (
                      <img 
                        src={item.iconUrl} 
                        alt={item.name}
                        className="h-12 w-12 rounded object-cover border border-border"
                      />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {item.marketHashName}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    ${item.latestPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.quantity > 0 ? "default" : "secondary"}
                      className={item.quantity > 0 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-secondary text-secondary-foreground"
                      }
                    >
                      {item.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
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