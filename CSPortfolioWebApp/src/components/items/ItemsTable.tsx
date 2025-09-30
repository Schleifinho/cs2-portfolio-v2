// src/pages/ItemsTable.tsx
import { useQuery } from "@tanstack/react-query";
import { getItems } from "@/lib/api";
import { Item } from "@/types/inventory";

import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";

import { FixedSizeList as List, ListChildComponentProps } from "react-window";

export function ItemsTable() {
  const { data: items = [], isLoading, isError, error } = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: getItems,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <p className="p-4">Loading items...</p>;
  if (isError) return <p className="p-4 text-red-500">Error: {(error as Error).message}</p>;

  // Render each row (react-window will pass style prop)
  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = items[index];
    return (
        <TableRow
            key={item.id}
            style={style}                         // important for virtualization
            className="border-border hover:bg-secondary/50"
        >
          <TableCell className="flex items-center space-x-3">
            {item.iconUrl && (
                <img
                    src={`https://community.steamstatic.com/economy/image/${item.iconUrl}`}
                    alt={item.name}
                    className="h-16 w-16 rounded object-cover border border-border"
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
            ${"latestPrice" in item ? (item as any).latestPrice.toFixed(2) : "0.00"}
          </TableCell>
          <TableCell>
            <Badge
                variant={"quantity" in item && (item as any).quantity > 0 ? "default" : "secondary"}
                className={
                  "quantity" in item && (item as any).quantity > 0
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                }
            >
              {"quantity" in item ? (item as any).quantity : 0}
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
    );
  };

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
              {/* Keep the table header static */}
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Item</TableHead>
                  <TableHead>Market Hash Name</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>In Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              {/* Virtualized body */}
              <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id} className="border-border hover:bg-secondary/50">
                      <TableCell className="flex items-center space-x-3">
                        {item.iconUrl && (
                            <img
                                src={"https://community.steamstatic.com/economy/image/" + item.iconUrl}
                                alt={item.name}
                                className="h-16 w-16 rounded object-cover border border-border"
                            />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {item.marketHashName}
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
