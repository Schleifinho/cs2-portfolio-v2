import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockItems, mockPriceHistory } from "@/data/mockData";
import { useState } from "react";

export function PriceHistoryChart() {
  const [selectedItemId, setSelectedItemId] = useState<string>("1");

  const chartData = mockPriceHistory
    .filter(price => price.itemId === parseInt(selectedItemId))
    .sort((a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime())
    .map(price => ({
      date: new Date(price.timeStamp).toLocaleDateString(),
      price: price.price,
      timestamp: price.timeStamp
    }));

  const selectedItem = mockItems.find(item => item.id === parseInt(selectedItemId));

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Price History
        </h2>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Price Trends</CardTitle>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger className="w-80 bg-secondary border-border">
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {mockItems.map((item) => (
                  <SelectItem key={item.id} value={item.id!.toString()}>
                    <div className="flex items-center space-x-2">
                      {item.iconUrl && (
                        <img 
                          src={item.iconUrl} 
                          alt={item.name}
                          className="h-6 w-6 rounded object-cover"
                        />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-4">
            {selectedItem?.iconUrl && (
              <img 
                src={selectedItem.iconUrl} 
                alt={selectedItem.name}
                className="h-12 w-12 rounded object-cover border border-border"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-foreground">{selectedItem?.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedItem?.marketHashName}</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {mockItems.slice(0, 3).map((item) => {
          const itemPrices = mockPriceHistory
            .filter(price => price.itemId === item.id)
            .sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime());
          
          const currentPrice = itemPrices[0]?.price || 0;
          const previousPrice = itemPrices[1]?.price || 0;
          const priceChange = currentPrice - previousPrice;
          const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

          return (
            <Card key={item.id} className="bg-gradient-card shadow-card hover:shadow-primary transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  {item.iconUrl && (
                    <img 
                      src={item.iconUrl} 
                      alt={item.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Price</span>
                    <span className="font-semibold text-foreground">${currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Change</span>
                    <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-accent' : 'text-destructive'}`}>
                      {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}