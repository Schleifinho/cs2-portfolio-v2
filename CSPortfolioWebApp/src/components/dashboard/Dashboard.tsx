import { useEffect, useState } from "react";
import { MetricCard } from "./MetricCard";
import { Package, Euro, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashBoardSummary } from "@/lib/dashboardApi";      // your API function
import {getBottomInventoryEntries, getTopInventoryEntries} from "@/lib/inventoryApi";  // your API function
import { DashBoard } from "@/types/DashBoard";
import { InventoryEntry } from "@/types/InventoryEntry";
import {Badge} from "@/components/ui/badge.tsx";

export function Dashboard() {
  const [summary, setSummary] = useState<DashBoard | null>(null);
  const [topEntries, setTopEntries] = useState<InventoryEntry[]>([]);
  const [bottomEntries, setBottomEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Example: last 7 days for dashboard summary
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // Fetch all data in parallel
        const [summaryData, topData, bottomData] = await Promise.all([
          getDashBoardSummary(startDate),
          getTopInventoryEntries(5),
          getBottomInventoryEntries(5),
        ]);

        setSummary(summaryData);
        setTopEntries(topData);
        setBottomEntries(bottomData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p className="p-8 text-muted-foreground">Loading dashboard...</p>;
  }

  if (!summary) {
    return <p className="p-8 text-destructive">No dashboard data available</p>;
  }

  return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
              title="Total Items"
              value={summary.totalItems}
              icon={Package}
              //trend="+2.5% from last month"
              //trendUp={true}
          />
          <MetricCard
              title="Overall Value"
              value={`${(summary.rawValue + summary.totalTrend).toFixed(2)}€`}
              icon={Euro}
              trend={`+ ${(summary.totalTrend).toFixed(2)}€`}
              trendUp={summary.totalTrend >= 0}
          />
          <MetricCard
              title="Unique Items"
              value={summary.totalUniqueItems}
              icon={Activity}
              //trend="tbd"
              //trendUp={true}
          />
          <MetricCard
              title="Recent Transactions"
              value={summary.recentTransactions}
              icon={TrendingUp}
              //trend="5 this month"
              trendUp={true}
          />
        </div>

        {/* Top & Bottom Items */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Items by Value */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Top Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topEntries.map((entry, index) => (
                    <div key={entry.itemId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-3">
                          {entry.iconUrl && (
                              <img
                                  src={`https://community.fastly.steamstatic.com/economy/image/${entry.iconUrl}`} //https://steamcommunity-a.akamaihd.net/economy/image
                                  alt={entry.name}
                                  className="h-16 w-16 rounded object-contain border border-border"
                              />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {entry.name || "Unknown Item"}
                            </p>
                            <p className="text-xs text-muted-foreground">Qty: {entry.quantity}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                        <Badge
                              variant="secondary"
                              className={`${
                                  entry.trend > 0
                                      ? "bg-green-700/10 text-green-700 border-green-700/20"
                                      : entry.trend < 0
                                          ? "bg-red-700/10 text-red-700 border-red-700/20"
                                          : "bg-primary/10 text-primary border-primary/20"
                              }`}
                          >
                            {entry.trend.toFixed(2)}€
                          </Badge>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.totalValue.toFixed(2)} € total, {entry.currentPrice.toFixed(2)}€ each
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bottom Items by Value */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Bottom Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bottomEntries.map((entry, index) => (
                    <div key={entry.itemId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-3">
                          {entry.iconUrl && (
                              <img
                                  src={`https://community.fastly.steamstatic.com/economy/image/${entry.iconUrl}`}
                                  alt={entry.name}
                                  className="h-16 w-16 rounded object-contain border border-border"
                              />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {entry.name || "Unknown Item"}
                            </p>
                            <p className="text-xs text-muted-foreground">Qty: {entry.quantity}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          <Badge
                              variant="secondary"
                              className={`${
                                  entry.trend > 0
                                      ? "bg-green-700/10 text-green-700 border-green-700/20"
                                      : entry.trend < 0
                                          ? "bg-red-700/10 text-red-700 border-red-700/20"
                                          : "bg-primary/10 text-primary border-primary/20"
                              }`}
                          >
                            {entry.trend.toFixed(2)}€
                          </Badge>
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {entry.totalValue.toFixed(2)} € total, {entry.currentPrice.toFixed(2)}€ each
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