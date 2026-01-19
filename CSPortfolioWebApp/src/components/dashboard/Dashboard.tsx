import {useEffect, useState} from "react";
import {MetricCard} from "./MetricCard";
import {Package, Euro, TrendingUp, LibraryBig, TrendingDown, Minus} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getDashBoardSummary} from "@/lib/dashboardApi";
import {getBottomInventoryEntries, getTopInventoryEntries} from "@/lib/inventoryApi";
import {DashBoard} from "@/types/DashBoard";
import {InventoryEntry} from "@/types/InventoryEntry";
import {Badge} from "@/components/ui/badge.tsx";
import {ScrollArea} from "@/components/ui/scroll-area";

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

  if (loading) return <div className="p-4 text-muted-foreground animate-pulse">Loading dashboard...</div>;
  if (!summary) return <div className="p-4 text-destructive">No data available</div>;

  return (
    /* w-full and overflow-hidden here are essential to respect the SidebarInset boundaries */
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-full overflow-hidden space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-2 shrink-0 px-1">
        <div className="flex items-center gap-2">
          {/* Static indicator instead of ping to represent "Snapshot" */}
          <div className="flex h-2 w-2 rounded-full bg-primary/40 flex items-center justify-center">
            <div className={`h-1 w-1 rounded-full ${summary.totalTrend >= 0 ? 'bg-primary' : 'bg-red-500'}`}></div>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">
            Portfolio Analytics
          </p>
        </div>
      </div>

      {/* METRICS - Forced to 2 columns on mobile, 4 columns on large screens */}
      <ScrollArea className="flex-1 w-full min-h-0">
        <div className="grid grid-cols-1 gap-3 pb-3 w-full max-w-full">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 shrink-0 w-full min-w-0">
            <MetricCard
              title="Total Items"
              value={summary.totalItems}
              icon={LibraryBig}
            />

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
              icon={Package}
            />

            <MetricCard
              title="Recent Transactions"
              value={summary.recentTransactions}
              icon={TrendingUp}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 w-full max-w-full">
          {/* LISTS - ScrollArea manages vertical overflow so sidebar inset stays fixed */}
          <ItemListCard title="Top Performing" entries={topEntries}/>
          <ItemListCard title="Biggest Drops" entries={bottomEntries}/>
        </div>
      </ScrollArea>
    </div>
  )
    ;
}

function ItemListCard({
                        title, entries
                      }: {
  title: string; entries: InventoryEntry[]
}) {
  return (
    <Card className="flex flex-col border shadow-sm w-full min-w-0 overflow-hidden">
      <CardHeader className="border-b py-3 bg-muted/5 shrink-0">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border overflow-hidden">
        {entries.map((entry) => (
          /* Each row is a grid with fixed column behavior to prevent overflow */
          <div
            key={entry.itemId}
            className="grid grid-cols-[auto_1fr_auto] gap-3 p-3 items-center w-full min-w-0 overflow-hidden hover:bg-muted/20 transition-colors"
          >
            {/* 1. ICON (Fixed size) */}
            <div
              className="h-10 w-10 shrink-0 rounded border bg-muted/10 flex items-center justify-center overflow-hidden">
              <img
                src={entry.iconUrl ? `https://community.fastly.steamstatic.com/economy/image/${entry.iconUrl}` : "/default.jpg"}
                alt=""
                className="h-8 w-8 object-contain"
              />
            </div>

            {/* 2. NAME & INFO (Flexible middle - will truncate) */}
            <div className="min-w-0 flex flex-col">
              <span className="text-sm font-bold truncate block leading-tight">
                {entry.name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1 h-4 font-mono shrink-0">
                  {entry.quantity}x
                </Badge>
                <span className="text-[11px] text-muted-foreground truncate">
                  {entry.currentPrice.toFixed(2)}€
                </span>
              </div>
            </div>

            {/* 3. TREND & TOTAL (Fixed size, right-aligned) */}
            <div className="shrink-0 flex flex-col items-end gap-1 min-w-0">
              {entry.trend !== 0 ? (
                <Badge
                  variant="outline"
                  className={`px-1.5 h-6 text-[10px] font-bold whitespace-nowrap ${
                    entry.trend > 0
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : "bg-red-500/10 text-red-600 border-red-500/20"
                  }`}
                >
                  {entry.trend > 0 ? <TrendingUp className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
                  {Math.abs(entry.trend).toFixed(2)}€
                </Badge>
              ) : (
                <Badge variant="outline" className="px-1.5 h-6 text-[10px] text-muted-foreground border-muted">
                  <Minus className="h-3 w-3 mr-1"/> 0.00€
                </Badge>
              )}
              <span className="text-xs font-black text-foreground shrink-0">
                {entry.totalValue.toFixed(2)}€
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}