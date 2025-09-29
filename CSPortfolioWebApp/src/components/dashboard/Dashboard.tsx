import { MetricCard } from "./MetricCard";
import { Package, DollarSign, TrendingUp, Activity } from "lucide-react";
import { mockItems, mockInventoryEntries, mockPriceHistory, mockPurchases, mockSales } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  // Calculate metrics
  const totalItems = mockInventoryEntries.reduce((sum, entry) => sum + entry.quantityOnHand, 0);
  const totalValue = mockInventoryEntries.reduce((sum, entry) => {
    const item = mockItems.find(item => item.id === entry.itemId);
    const latestPrice = mockPriceHistory
      .filter(price => price.itemId === entry.itemId)
      .sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())[0];
    return sum + (latestPrice ? latestPrice.price * entry.quantityOnHand : 0);
  }, 0);
  
  const recentTransactions = mockPurchases.length + mockSales.length;
  
  // Prepare chart data for AK-47 Redline (itemId: 1)
  const chartData = mockPriceHistory
    .filter(price => price.itemId === 1)
    .sort((a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime())
    .map(price => ({
      date: new Date(price.timeStamp).toLocaleDateString(),
      price: price.price
    }));

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Items"
          value={totalItems}
          icon={Package}
          trend="+2.5% from last month"
          trendUp={true}
        />
        <MetricCard
          title="Portfolio Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={DollarSign}
          trend="+12.3% from last month"
          trendUp={true}
        />
        <MetricCard
          title="Unique Items"
          value={mockItems.length}
          icon={Activity}
          trend="+1 new item"
          trendUp={true}
        />
        <MetricCard
          title="Recent Transactions"
          value={recentTransactions}
          icon={TrendingUp}
          trend="5 this month"
          trendUp={true}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">AK-47 | Redline Price Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    color: "hsl(var(--foreground))"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Top Items by Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInventoryEntries
                .map(entry => {
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
                })
                .sort((a, b) => b.totalValue - a.totalValue)
                .slice(0, 5)
                .map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {entry.item?.name || 'Unknown Item'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {entry.quantityOnHand}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        ${entry.totalValue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${entry.latestPrice.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}