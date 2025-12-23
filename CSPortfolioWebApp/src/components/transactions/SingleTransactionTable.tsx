import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SingleTransactionTable({
                                                   title,
                                                   data,
                                                   loading,
                                                   error,
                                                   parentRef,
                                                   virtualizer,
                                                   onSort,
                                                   onEdit,
                                                   onDelete,
                                               }: {
    title: string;
    data: any[];
    loading: boolean;
    error: boolean | null;
    parentRef: React.RefObject<HTMLDivElement>;
    virtualizer: any;
    onSort: (key: string) => void;
    onEdit: (item: any) => void;
    onDelete: (id: number) => void;
}) {
    return (
        <Card className="bg-gradient-card shadow-card">
            <CardHeader>
                <CardTitle>
                    {title} ({data.length})
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                {loading ? (
                    <p className="p-4">Loading...</p>
                ) : error ? (
                    <p className="p-4 text-red-500">Failed to load data</p>
                ) : (
                    <>
                        {/* 🔹 STATIC HEADER */}
                        <Table className="table-fixed border-collapse">
                            <TableHeader>
                                <TableRow>
                                    <TableHead onClick={() => onSort("name")} className="cursor-pointer">
                                        Item <ArrowUpDown className="inline-block h-4 w-4 ml-1" />
                                    </TableHead>
                                    <TableHead onClick={() => onSort("quantity")} className="cursor-pointer text-center">
                                        Quantity <ArrowUpDown className="inline-block h-4 w-4 ml-1" />
                                    </TableHead>
                                    <TableHead onClick={() => onSort("price")} className="cursor-pointer text-center">
                                        Price <ArrowUpDown className="inline-block h-4 w-4 ml-1" />
                                    </TableHead>
                                    <TableHead onClick={() => onSort("total")} className="cursor-pointer text-center">
                                        Total <ArrowUpDown className="inline-block h-4 w-4 ml-1" />
                                    </TableHead>
                                    <TableHead onClick={() => onSort("timestamp")} className="cursor-pointer text-center">
                                        Date <ArrowUpDown className="inline-block h-4 w-4 ml-1" />
                                    </TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                        </Table>

                        {/* 🔹 SCROLLABLE BODY */}
                        <ScrollArea
                            ref={parentRef}
                            className="w-full"
                            style={{ height: "calc(100vh - 350px)" }}
                        >
                            <Table className="table-fixed border-collapse">
                                <TableBody>
                                    {/* Top spacer */}
                                    <tr
                                        style={{
                                            height: virtualizer.getVirtualItems()[0]?.start ?? 0,
                                        }}
                                    />

                                    {virtualizer.getVirtualItems().map((row: any) => {
                                        const tx = data[row.index];
                                        return (
                                            <TableRow
                                                key={tx.id}
                                                style={{ height: row.size }}
                                                className="border-border hover:bg-secondary/50"
                                            >
                                                <TableCell className="flex items-center space-x-3">
                                                    {tx.iconUrl ? (
                                                        <img
                                                            src={`https://community.fastly.steamstatic.com/economy/image/${tx.iconUrl}`}
                                                            alt={tx.name}
                                                            className="h-20 w-20 rounded object-contain border"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={`${import.meta.env.VITE_BACKEND_URL}uploads/profile/default.jpg`}
                                                            alt={tx.name}
                                                            className="h-20 w-20 rounded object-contain border"
                                                        />
                                                    )}
                                                    <p className="font-medium">{tx.name}</p>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">{tx.quantity}</Badge>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">{tx.price.toFixed(2)}€</Badge>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">
                                                        {(tx.quantity * tx.price).toFixed(2)}€
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    {new Date(tx.timestamp).toLocaleDateString()}
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Button size="sm" variant="ghost" onClick={() => onEdit(tx)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => onDelete(tx.id!)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                    {/* Bottom spacer */}
                                    <tr
                                        style={{
                                            height:
                                                virtualizer.getTotalSize() -
                                                (virtualizer.getVirtualItems().at(-1)?.end ?? 0),
                                        }}
                                    />
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
