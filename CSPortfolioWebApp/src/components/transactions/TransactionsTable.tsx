import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockItems, mockInventoryEntries, mockPurchases, mockSales } from "@/data/mockData";

interface TransactionsTableProps {
  type: 'purchases' | 'sales';
}

export function TransactionsTable({ type }: TransactionsTableProps) {
  const transactions = type === 'purchases' ? mockPurchases : mockSales;
  
  const transactionsWithDetails = transactions.map(transaction => {
    const inventoryEntry = mockInventoryEntries.find(entry => entry.id === transaction.inventoryEntryId);
    const item = inventoryEntry ? mockItems.find(item => item.id === inventoryEntry.itemId) : null;
    
    return {
      ...transaction,
      item,
      totalValue: transaction.price * transaction.quantity
    };
  });

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          {type === 'purchases' ? 'Purchase History' : 'Sales History'}
        </h2>
        <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add {type === 'purchases' ? 'Purchase' : 'Sale'}
        </Button>
      </div>

      <Tabs defaultValue={type} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases" className="space-y-4">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Purchase Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Item</TableHead>
                    <TableHead className="text-muted-foreground">Quantity</TableHead>
                    <TableHead className="text-muted-foreground">Unit Price</TableHead>
                    <TableHead className="text-muted-foreground">Total</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPurchases.map((purchase) => {
                    const inventoryEntry = mockInventoryEntries.find(entry => entry.id === purchase.inventoryEntryId);
                    const item = inventoryEntry ? mockItems.find(item => item.id === inventoryEntry.itemId) : null;
                    
                    return (
                      <TableRow key={purchase.id} className="border-border hover:bg-secondary/50">
                        <TableCell className="flex items-center space-x-3">
                          {item?.iconUrl && (
                            <img 
                              src={item.iconUrl} 
                              alt={item.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <span className="font-medium text-foreground">{item?.name || 'Unknown Item'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {purchase.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          ${purchase.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          ${(purchase.price * purchase.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(purchase.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-accent text-accent-foreground">
                            Purchase
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Sales Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Item</TableHead>
                    <TableHead className="text-muted-foreground">Quantity</TableHead>
                    <TableHead className="text-muted-foreground">Unit Price</TableHead>
                    <TableHead className="text-muted-foreground">Total</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSales.map((sale) => {
                    const inventoryEntry = mockInventoryEntries.find(entry => entry.id === sale.inventoryEntryId);
                    const item = inventoryEntry ? mockItems.find(item => item.id === inventoryEntry.itemId) : null;
                    
                    return (
                      <TableRow key={sale.id} className="border-border hover:bg-secondary/50">
                        <TableCell className="flex items-center space-x-3">
                          {item?.iconUrl && (
                            <img 
                              src={item.iconUrl} 
                              alt={item.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <span className="font-medium text-foreground">{item?.name || 'Unknown Item'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {sale.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          ${sale.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          ${(sale.price * sale.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(sale.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary text-primary-foreground">
                            Sale
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}