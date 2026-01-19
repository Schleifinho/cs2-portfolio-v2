import {useEffect, useState} from "react";
import {MetricCard} from "./MetricCard";
import {Package, Euro, TrendingUp, Activity} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getDashBoardSummary} from "@/lib/dashboardApi";      // your API function
import {getBottomInventoryEntries, getTopInventoryEntries} from "@/lib/inventoryApi";  // your API function
import {DashBoard} from "@/types/DashBoard";
import {InventoryEntry} from "@/types/InventoryEntry";
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
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

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
    return <p className="p-4 sm:p-6 text-muted-foreground">Loading dashboard…</p>;
  }

  if (!summary) {
    return <p className="p-4 sm:p-6 text-destructive">No dashboard data available</p>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h2
          className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Last 7 days summary
        </p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Items" value={summary.totalItems} icon={Package}/>

        <MetricCard
          title="Overall Value"
          value={`${(summary.rawValue + summary.totalTrend).toFixed(2)}€`}
          icon={Euro}
          trend={`${summary.totalTrend > 0 ? "+" : ""}${summary.totalTrend.toFixed(2)}€`}
          trendUp={summary.totalTrend >= 0}
        />

        <MetricCard
          title="Unique Items"
          value={summary.totalUniqueItems}
          icon={Activity}
        />

        <MetricCard
          title="Recent Transactions"
          value={summary.recentTransactions}
          icon={TrendingUp}
        />
      </div>

      {/* TOP / BOTTOM */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ItemListCard title="Top Items" entries={topEntries}/>
        <ItemListCard title="Bottom Items" entries={bottomEntries}/>
      </div>
    </div>
  );
}

function ItemListCard({
                        title,
                        entries,
                      }: {
  title: string;
  entries: InventoryEntry[];
}) {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.itemId}
            className="rounded-lg border border-border/50
                      p-3 sm:border-none sm:p-0
                      flex flex-col gap-2
                      sm:flex-row sm:items-center sm:justify-between
                    "
          >
            {/* LEFT */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Rank */}
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">
                {index + 1}
              </div>

              {/* Image */}
              {entry.iconUrl && (
                <img
                  src={`https://community.fastly.steamstatic.com/economy/image/${entry.iconUrl}`}
                  alt={entry.name}
                  className="h-9 w-9 sm:h-14 sm:w-14 shrink-0 rounded object-contain border border-border bg-card"
                />
              )}

              {/* TEXT */}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {entry.name || "Unknown Item"}
                </p>

                <p className="text-xs text-muted-foreground leading-tight">
                  Qty {entry.quantity} · {entry.currentPrice.toFixed(2)}€
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="flex items-center justify-between
                      sm:flex-col sm:items-end sm:justify-center sm:gap-1
                      shrink-0
                    "
            >
              <Badge
                variant="secondary"
                className={
                  entry.trend > 0
                    ? "bg-green-700/10 text-green-600 border-green-700/20"
                    : entry.trend < 0
                      ? "bg-red-700/10 text-red-600 border-red-700/20"
                      : "bg-primary/10 text-primary border-primary/20"
                }
              >
                {entry.trend > 0 ? "+" : ""}
                {entry.trend.toFixed(2)}€
              </Badge>

              <span className="text-[11px] text-muted-foreground sm:text-xs">
                {entry.totalValue.toFixed(2)} € total
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

