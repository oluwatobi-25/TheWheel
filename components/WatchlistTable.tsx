import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import { Star } from 'lucide-react';
import Link from 'next/link';

const WatchlistTable = ({ data }: WatchlistTableProps) => {
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
                                <Star className="h-4 w-4 text-yellow-500 fill-current mx-auto" />
                            </TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left font-medium min-w-[200px]">
                                <Link href={`/stocks/${item.symbol}`} className="hover:text-yellow-500 transition-colors">
                                    {item.company}
                                </Link>
                            </TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left font-mono">{item.symbol}</TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left font-mono">{item.priceFormatted}</TableCell>
                            <TableCell className={`table-cell py-4 px-4 text-left font-mono ${item.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {item.changeFormatted}
                            </TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left font-mono">{item.marketCap}</TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left font-mono">{item.peRatio}</TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left">
                                <button className="add-alert">Add Alert</button>
                            </TableCell>
                            <TableCell className="table-cell py-4 px-4 text-left">
                                <span className="text-gray-600">...</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default WatchlistTable;
