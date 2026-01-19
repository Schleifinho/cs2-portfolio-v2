import {useState, useMemo, useRef} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {ImportedTransaction} from "@/types/ImportedTransaction";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "@/hooks/use-toast";
import {getItems} from "@/lib/itemsApi";
import {useAuth} from "@/lib/AuthContext.tsx";
import {Purchase} from "@/types/Purchase.ts";
import {Sale} from "@/types/Sale.ts";
import {addPurchasesBulk} from "@/lib/purchasesApi.ts";
import {addSalesBulk} from "@/lib/salesApi.ts";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import {
  FileUp,
  File,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  FilterX,
  CheckSquare
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportTransactionsDialog = ({open, onOpenChange}: Props) => {
  const [items, setItems] = useState<ImportedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const {user} = useAuth();

  const {data: allItems = []} = useQuery({
    queryKey: ["items", user?.username],
    queryFn: getItems,
    staleTime: 10 * 60 * 1000,
  });

  const itemMap = useMemo(() => {
    const map = new Map<string, { id: number; iconUrl: string }>();
    allItems.forEach((i: any) => {
      map.set(i.marketHashName, {id: i.id, iconUrl: i.iconUrl});
    });
    return map;
  }, [allItems]);

  const handleFile = async (file: File) => {
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").slice(1);
    const map = new Map<string, ImportedTransaction>();

    for (const line of lines) {
      if (!line.trim()) continue;
      const cols = line.split('","').map(c => c.replace(/"/g, ""));
      if (cols.length < 9) continue;

      const actedOn = cols[3];
      const displayPrice = parseFloat(cols[5]) / 100.0;
      const type = cols[6].toLowerCase();
      const marketName = cols[7];
      const appId = cols[8];

      if (appId !== "730") continue;

      const matchedItem = itemMap.get(marketName);
      const key = `${marketName}|${actedOn}|${type}|${displayPrice}`;

      if (map.has(key)) {
        map.get(key)!.quantity += 1;
      } else {
        map.set(key, {
          marketName,
          actedOn,
          type,
          displayPrice,
          quantity: 1,
          enabled: !!matchedItem,
          matched: !!matchedItem,
          itemId: matchedItem?.id,
          iconUrl: matchedItem?.iconUrl,
        });
      }
    }
    setItems(Array.from(map.values()));
  };

  const toggleItem = (index: number) => {
    setItems(prev => prev.map((item, i) => i === index ? {...item, enabled: !item.enabled} : item));
  };

  const setAll = (value: boolean) => {
    setItems(prev => prev.map(i => ({...i, enabled: value && i.matched})));
  };

  // 1. Updated Selection Logic inside the component
  const allEnabled = useMemo(() => {
    const matchedItems = items.filter(i => i.matched);
    return matchedItems.length > 0 && matchedItems.every(i => i.enabled);
  }, [items]);

  const handleToggleAll = () => {
    const targetValue = !allEnabled;
    setItems(prev => prev.map(i => ({
      ...i,
      enabled: i.matched ? targetValue : false
    })));
  };

  const handleClearList = () => {
    setItems([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast({
      title: "Buffer Purged",
      description: "The temporary import list has been cleared.",
    });
  };

  const startImport = async () => {
    const selected = items.filter(i => i.enabled && i.matched);
    if (selected.length === 0) return;

    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const purchases = selected
        .filter(i => i.type.includes('purchase'))
        .map(i => ({
          itemId: i.itemId!,
          quantity: i.quantity,
          price: i.displayPrice,
          timestamp: new Date(`${i.actedOn} ${currentYear}`),
        })) as Omit<Purchase, "id">[];

      const sales = selected
        .filter(i => i.type.includes('sale'))
        .map(i => ({
          itemId: i.itemId!,
          quantity: i.quantity,
          price: i.displayPrice,
          timestamp: new Date(`${i.actedOn} ${currentYear}`),
        })) as Omit<Sale, "id">[];

      if (purchases.length) await addPurchasesBulk(purchases);
      if (sales.length) await addSalesBulk(sales);

      toast({title: "Data Ingested", description: `${selected.length} entries committed to ledger.`});
      await Promise.all([
        queryClient.invalidateQueries({queryKey: ["purchases"]}),
        queryClient.invalidateQueries({queryKey: ["sales"]}),
        queryClient.invalidateQueries({queryKey: ["inventoryEntries"]}),
      ]);
      setItems([]);
      onOpenChange(false);
    } catch {
      toast({title: "Ingestion Failed", description: "CSV schema mismatch detected.", variant: "destructive"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-border/60 shadow-2xl">
        {/* HEADER */}
        <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <File className="h-5 w-5 text-primary"/>
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Data Ingestion</DialogTitle>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Batch Ledger
                Processing</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* DROPZONE / FILE SELECT */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
                            group cursor-pointer border-2 border-dashed rounded-xl p-8
                            flex flex-col items-center justify-center gap-3 transition-all
                            ${items.length > 0 ? 'bg-muted/10 border-border/40 py-4' : 'bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40'}
                        `}
          >
            <FileUp
              className={`h-8 w-8 transition-colors ${items.length > 0 ? 'text-muted-foreground/40' : 'text-primary'}`}/>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest">
                {items.length > 0 ? "Switch Data Source" : "Select Steam History CSV"}
              </p>
              <p className="text-[9px] text-muted-foreground font-bold">Standard Steam Market Export Schema Required</p>
            </div>
            <input type="file" ref={fileInputRef} accept=".csv" className="hidden"
                   onChange={(e) => e.target.files && handleFile(e.target.files[0])}/>
          </div>

          {/* PREVIEW AREA */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground"/>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Detected Entries ({items.length})
                </span>
                </div>
                <div className="flex gap-2">
                  {/* DYNAMIC TOGGLE BUTTON */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[9px] font-black uppercase tracking-tighter hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={handleToggleAll}
                  >
                    {allEnabled ? (
                      <><FilterX className="h-3 w-3 mr-1 text-primary"/> Unselect All</>
                    ) : (
                      <><CheckSquare className="h-3 w-3 mr-1 text-primary"/> Select All</>
                    )}
                  </Button>

                  {/* PURGE BUTTON */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[9px] font-black uppercase tracking-tighter hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground/60"
                    onClick={handleClearList}
                  >
                    <History className="h-3 w-3 mr-1"/> Purge List
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[350px] w-full border rounded-xl bg-card/50 overflow-hidden">
                <div className="divide-y divide-border/40">
                  {items.map((item, i) => (
                    <div key={i}
                         className={`flex items-center justify-between p-4 transition-colors ${!item.matched ? 'bg-destructive/5' : 'hover:bg-muted/30'}`}>
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className="h-12 w-12 shrink-0 bg-background border rounded-lg flex items-center justify-center overflow-hidden">
                          {item.iconUrl ? (
                            <img
                              src={`https://community.fastly.steamstatic.com/economy/image/${item.iconUrl}`}
                              className="h-9 w-9 object-contain" alt=""/>
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-muted-foreground/30"/>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                                              <span
                                                className="text-xs font-bold truncate tracking-tight">{item.marketName}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline"
                                   className={`h-4 px-1 text-[8px] font-black uppercase ${item.type.includes('sale') ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5'}`}>
                              {item.type}
                            </Badge>
                            <span
                              className="text-[9px] font-mono font-bold text-muted-foreground/60">{item.actedOn}</span>
                          </div>
                          {!item.matched && (
                            <span
                              className="text-[9px] font-black text-red-500/80 uppercase tracking-tight flex items-center gap-1 mt-1">
                                                            <AlertTriangle className="h-2.5 w-2.5"/> Registry Match Missing
                                                        </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right flex flex-col">
                                              <span
                                                className="text-[11px] font-mono font-black text-primary">{item.displayPrice.toFixed(2)}€</span>
                          <span
                            className="text-[9px] font-bold text-muted-foreground uppercase">Qty: {item.quantity}</span>
                        </div>
                        <Switch checked={item.enabled} disabled={!item.matched}
                                onCheckedChange={() => toggleItem(i)}
                                className="data-[state=checked]:bg-primary"/>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 border-t border-border/40 bg-muted/10 px-6 py-4">
          <Button variant="ghost" className="flex-1 text-[10px] font-black uppercase tracking-widest h-10"
                  onClick={() => onOpenChange(false)}>
            Abort
          </Button>
          <Button
            className="flex-1 h-10 shadow-md text-[10px] font-black uppercase tracking-widest gap-2"
            disabled={loading || items.every(i => !i.enabled || !i.matched)}
            onClick={startImport}
          >
            {loading ? "Re-Indexing..." : (
              <><CheckCircle2 className="h-3.5 w-3.5"/> Commit Ingestion</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};