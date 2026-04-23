"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import { Star, Bell, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AlertModal from "@/components/AlertModal";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const WatchlistTable = ({ data, userId, userEmail }: WatchlistTableProps) => {
    const [selectedStock, setSelectedStock] = useState<StockWithData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);
    const router = useRouter();

    const handleAddAlert = (stock: StockWithData) => {
        setSelectedStock(stock);
        setIsModalOpen(true);
    };

    const handleToggleWatchlist = async (symbol: string, company: string) => {
        setToggling(symbol);
        try {
            const res = await toggleWatchlist({
                email: userEmail,
                symbol,
                company,
                isInWatchlist: true // We know it's in the watchlist because we're on the watchlist page
            });
            if (res.success) {
                toast.success(`${symbol} removed from watchlist`);
                router.refresh();
            } else {
                toast.error("Failed to remove stock");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setToggling(null);
        }
    };

    return (
        <div className="watchlist-table">
            <Table>
                <TableHeader>
                    <TableRow className="table-header-row">
                        <TableHead className="table-header py-4 px-6 text-left border-none w-12"></TableHead>
                        {WATCHLIST_TABLE_HEADER.map((header) => (
                            <TableHead key={header} className="table-header py-4 px-4 text-left border-none">
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index} className="table-row">
                             <TableCell className="table-cell py-4 px-4 text-center">
                                <button 
                                    onClick={() => handleToggleWatchlist(item.symbol, item.company)}
                                    disabled={toggling === item.symbol}
                                    className="hover:scale-110 transition-transform"
                                >
                                    {toggling === item.symbol ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                                    ) : (
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mx-auto" />
                                    )}
                                </button>
                            </TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left font-medium min-w-[200px]">
                                <Link href={`/stocks/${item.symbol}`} className="hover:text-yellow-500 transition-colors">
                                    {item.company}
                                </Link>
                            </TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left font-mono">{item.symbol}</TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left font-mono">{item.priceFormatted}</TableCell>
                            <TableCell className={`table-cell py-4 px-4 text-left font-mono ${item.changePercent && item.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {item.changeFormatted}
                            </TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left font-mono">{item.marketCap}</TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left font-mono">{item.peRatio}</TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left">
                                <button 
                                    onClick={() => handleAddAlert(item)}
                                    className="add-alert flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#212328] hover:bg-[#30333A] transition-colors"
                                >
                                    <Bell className="h-3.5 w-3.5 text-yellow-500" />
                                    <span>Add Alert</span>
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {selectedStock && (
                <AlertModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    symbol={selectedStock.symbol}
                    company={selectedStock.company}
                    currentPrice={selectedStock.currentPrice || 0}
                    userId={userId}
                />
            )}
        </div>
    );
};

export default WatchlistTable;
