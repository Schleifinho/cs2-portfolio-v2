import { ArrowUpDown, Edit, Trash, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define column width constants to ensure Header and Body stay perfectly aligned
const COL_WIDTHS = {
  item: "w-[35%]",
  qty: "w-[10%]",
  price: "w-[15%]",
  total: "w-[15%]",
  date: "w-[15%]",
  actions: "w-[10%]"
};

export default function SingleTransactionTable({data,
                                                 parentRef,
                                                 virtualizer,
                                                 onSort,
                                                 onEdit,
                                                 onDelete,
                                                 sortKey,   // Pass current sort state down for icons
                                                 sortOrder,
                                               }: any) {

  const SortIcon = ({ column }: { column: string }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 opacity-30 ml-1" />;
    return sortOrder === "asc" ? <ArrowUp className="h-3 w-3 ml-1 text-primary" /> : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
  };

  return (
    <div className="flex flex-col h-full w-full min-w-0 overflow-hidden">

      {/* 🔹 FIXED HEADER */}
      {/* pr-4 accounts for the scrollbar width in the body below */}
      <div className="bg-muted/5 border-b shrink-0 pr-4">
        <div className="flex w-full items-center px-4 py-3">
          <div onClick={() => onSort("name")} className={`${COL_WIDTHS.item} cursor-pointer flex items-center gap-1 uppercase text-[10px] font-black tracking-widest text-muted-foreground`}>
            Item <SortIcon column="name" />
          </div>
          <div onClick={() => onSort("quantity")} className={`${COL_WIDTHS.qty} cursor-pointer flex justify-center items-center gap-1 uppercase text-[10px] font-black tracking-widest text-muted-foreground`}>
            Qty <SortIcon column="quantity" />
          </div>
          <div onClick={() => onSort("price")} className={`${COL_WIDTHS.price} cursor-pointer flex justify-center items-center gap-1 uppercase text-[10px] font-black tracking-widest text-muted-foreground`}>
            Price <SortIcon column="price" />
          </div>
          <div onClick={() => onSort("total")} className={`${COL_WIDTHS.total} cursor-pointer flex justify-center items-center gap-1 uppercase text-[10px] font-black tracking-widest text-muted-foreground`}>
            Total <SortIcon column="total" />
          </div>
          <div onClick={() => onSort("timestamp")} className={`${COL_WIDTHS.date} cursor-pointer flex justify-center items-center gap-1 uppercase text-[10px] font-black tracking-widest text-muted-foreground`}>
            Date <SortIcon column="timestamp" />
          </div>
          <div className={`${COL_WIDTHS.actions} text-right uppercase text-[10px] font-black tracking-widest text-muted-foreground`}>
            Actions
          </div>
        </div>
      </div>

      {/* 🔹 VIRTUALIZED BODY */}
      <ScrollArea
        ref={parentRef}
        className="flex-1 w-full"
      >
        <div className="w-full relative">
          {/* Top spacer */}
          <div style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }} />

          {virtualizer.getVirtualItems().map((row: any) => {
            const tx = data[row.index];
            if (!tx) return null;
            return (
              <div
                key={tx.id}
                className="flex w-full items-center px-4 hover:bg-muted/30 transition-colors group border-b border-border/40"
                style={{ height: row.size }}
              >
                <div className={`${COL_WIDTHS.item} flex items-center gap-3 min-w-0`}>
                  <div className="h-10 w-10 shrink-0 bg-muted/20 rounded border flex items-center justify-center overflow-hidden">
                    <img src={tx.iconUrl ? `https://community.fastly.steamstatic.com/economy/image/${tx.iconUrl}` : "/default.jpg"} className="h-8 w-8 object-contain" alt={tx.name} />
                  </div>
                  <span className="text-sm font-bold truncate tracking-tight">{tx.name}</span>
                </div>

                <div className={`${COL_WIDTHS.qty} flex justify-center`}>
                  <Badge variant="secondary" className="font-mono font-bold text-[10px] px-1.5 h-5">{tx.quantity}x</Badge>
                </div>

                <div className={`${COL_WIDTHS.price} flex justify-center`}>
                  <span className="text-sm font-medium tabular-nums">{tx.price.toFixed(2)}€</span>
                </div>

                <div className={`${COL_WIDTHS.total} flex justify-center`}>
                  <span className="text-sm font-black tabular-nums text-primary">{(tx.quantity * tx.price).toFixed(2)}€</span>
                </div>

                <div className={`${COL_WIDTHS.date} flex justify-center`}>
                  <span className="text-[11px] font-bold text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</span>
                </div>

                <div className={`${COL_WIDTHS.actions} flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(tx)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-500/10" onClick={() => onDelete(tx.id!)}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom spacer */}
          <div style={{ height: virtualizer.getTotalSize() - (virtualizer.getVirtualItems().at(-1)?.end ?? 0) }} />
        </div>
      </ScrollArea>
    </div>
  );
}