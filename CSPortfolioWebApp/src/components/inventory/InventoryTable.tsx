import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getInventoryEntries } from "@/lib/api";
import {InventoryEntry} from "@/types/inventory";

export function InventoryTable() {
  const { data: inventoryEntries = [], isLoading, isError, error } = useQuery<InventoryEntry[]>({
    queryKey: ["inventoryentries"],
    queryFn: getInventoryEntries,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <p className="p-4">Loading items...</p>;
  if (isError) return <p className="p-4 text-red-500">Error: {(error as Error).message}</p>;

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
              {inventoryEntries.map((inventoryEntry) => (
                <TableRow key={inventoryEntry.id} className="border-border hover:bg-secondary/50">
                  <TableCell className="flex items-center space-x-3">
                    {inventoryEntry.iconUrl && (
                        <img
                            src={`https://community.steamstatic.com/economy/image/${inventoryEntry.iconUrl}`}
                            alt={inventoryEntry.name}
                            className="h-24 w-24 rounded object-cover border border-border"
                        />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {inventoryEntry.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {inventoryEntry.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {inventoryEntry.currentPrice}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {inventoryEntry.total}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={inventoryEntry.quantity > 0 ? "default" : "destructive"}
                      className={inventoryEntry.quantity > 0
                        ? "bg-accent text-accent-foreground" 
                        : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {inventoryEntry.quantity > 0 ? 'In Stock' : 'Out of Stock'}
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