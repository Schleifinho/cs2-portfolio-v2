import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {useEffect} from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const COL_WIDTHS = {
  item: "w-[35%]",
  qty: "w-[10%]",
  price: "w-[15%]",
  total: "w-[15%]",
  date: "w-[15%]",
  actions: "w-[10%]",
};

export default function SingleTransactionTable({
                                                 data,
                                                 parentRef,
                                                 virtualizer,
                                                 onSort,
                                                 onEdit,
                                                 onDelete,
                                                 sortKey,
                                                 sortOrder,
                                               }: any) {

  const isMobile = useIsMobile();

  useEffect(() => {
    virtualizer.measure();
    virtualizer.scrollToIndex(0);
  }, [data.length]);

  useEffect(() => {
    if (!isMobile) {
      requestAnimationFrame(() => {
        virtualizer.measure();
        virtualizer.scrollToIndex(0);
      });
    }
  }, [isMobile, data.length, sortKey, sortOrder]);

  const SortIcon = ({ column }: { column: string }) => {
    if (sortKey !== column)
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;

    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 text-primary" />
    );
  };

  return (
    <div className="flex flex-col h-full w-full min-w-0 overflow-hidden bg-card">

      {/* ───────────────── DESKTOP HEADER ───────────────── */}
      <div className="hidden md:block shrink-0 border-b bg-muted/5">
        <div className="flex items-center px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <div
            onClick={() => onSort("name")}
            className={`${COL_WIDTHS.item} flex items-center cursor-pointer`}
          >
            Asset <SortIcon column="name" />
          </div>
          <div
            onClick={() => onSort("quantity")}
            className={`${COL_WIDTHS.qty} flex justify-center cursor-pointer`}
          >
            Qty <SortIcon column="quantity" />
          </div>
          <div
            onClick={() => onSort("price")}
            className={`${COL_WIDTHS.price} flex justify-center cursor-pointer`}
          >
            Price <SortIcon column="price" />
          </div>
          <div
            onClick={() => onSort("total")}
            className={`${COL_WIDTHS.total} flex justify-center cursor-pointer`}
          >
            Total <SortIcon column="total" />
          </div>
          <div
            onClick={() => onSort("timestamp")}
            className={`${COL_WIDTHS.date} flex justify-center cursor-pointer`}
          >
            Date <SortIcon column="timestamp" />
          </div>
          <div className={`${COL_WIDTHS.actions} text-right`}>Actions</div>
        </div>
      </div>

      {/* ───────────────── DESKTOP (VIRTUALIZED) ───────────────── */}
      <div className="hidden md:block flex-1 min-h-0">
        <ScrollArea ref={parentRef} className="h-full">
          <div className="relative w-full">

            <div style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }} />

            {virtualizer.getVirtualItems().map((row: any) => {
              const tx = data[row.index];
              if (!tx) return null;

              return (
                <div
                  key={tx.id}
                  style={{ height: row.size }}
                  className="border-b last:border-0"
                >
                  <div className="flex items-center px-6 h-full hover:bg-muted/20 group">

                    {/* Asset */}
                    <div className={`${COL_WIDTHS.item} flex items-center gap-3 min-w-0`}>
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-muted/20 border flex items-center justify-center">
                        <img
                          src={
                            tx.iconUrl
                              ? `https://community.fastly.steamstatic.com/economy/image/${tx.iconUrl}`
                              : "/default.jpg"
                          }
                          className="h-8 w-8 object-contain"
                          alt={tx.name}
                        />
                      </div>
                      <span className="truncate font-bold text-sm">
                        {tx.name}
                      </span>
                    </div>

                    {/* Qty */}
                    <div className={`${COL_WIDTHS.qty} flex justify-center`}>
                      <Badge className="h-5 px-2 text-[10px] font-mono">
                        {tx.quantity}x
                      </Badge>
                    </div>

                    {/* Price */}
                    <div className={`${COL_WIDTHS.price} flex justify-center text-sm`}>
                      {tx.price.toFixed(2)}€
                    </div>

                    {/* Total */}
                    <div className={`${COL_WIDTHS.total} flex justify-center font-black text-primary`}>
                      {(tx.quantity * tx.price).toFixed(2)}€
                    </div>

                    {/* Date */}
                    <div className={`${COL_WIDTHS.date} flex justify-center text-[11px] font-mono text-muted-foreground`}>
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className={`${COL_WIDTHS.actions} flex justify-end gap-1 opacity-0 group-hover:opacity-100`}>
                      <Button size="icon" variant="ghost" onClick={() => onEdit(tx)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => onDelete(tx.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                  </div>
                </div>
              );
            })}

            <div
              style={{
                height:
                  virtualizer.getTotalSize() -
                  (virtualizer.getVirtualItems().at(-1)?.end ?? 0),
              }}
            />
          </div>
        </ScrollArea>
      </div>

      {/* ───────────────── MOBILE (NOT VIRTUALIZED) ───────────────── */}
      <div className="md:hidden flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-3 p-3">

            {data.map((tx: any) => (
              <div
                key={tx.id}
                className="border rounded-lg p-3 bg-card space-y-3"
              >
                {/* Header */}
                <div className="flex gap-3 items-center">
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-muted/20 border flex items-center justify-center">
                    <img
                      src={
                        tx.iconUrl
                          ? `https://community.fastly.steamstatic.com/economy/image/${tx.iconUrl}`
                          : "/default.jpg"
                      }
                      className="h-10 w-10 object-contain"
                      alt={tx.name}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm">{tx.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-[9px] uppercase font-black text-muted-foreground">
                      Total
                    </div>
                    <div className="font-black text-primary">
                      {(tx.quantity * tx.price).toFixed(2)}€
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase font-black text-muted-foreground">
                      Unit
                    </div>
                    <div>
                      {tx.price.toFixed(2)}€ × {tx.quantity}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Button
                    variant="secondary"
                    className="h-9 text-[10px] font-black uppercase"
                    onClick={() => onEdit(tx)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Modify
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 text-red-500"
                    onClick={() => onDelete(tx.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
