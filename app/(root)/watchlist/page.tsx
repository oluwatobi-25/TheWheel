import React from 'react'
import WatchlistTable from '@/components/WatchlistTable'
import { getWatchlistByEmail } from "@/lib/actions/watchlist.actions";
import { getWatchlistData, getNews } from "@/lib/actions/finnhub.actions";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { Star, Plus } from 'lucide-react';
import Link from 'next/link';

const WatchlistPage = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    
    let watchlistData: StockWithData[] = [];
    let news: MarketNewsArticle[] = [];
    
    if (session?.user?.email) {
        const watchlist = await getWatchlistByEmail(session.user.email);
        const symbols = watchlist.map(i => i.symbol);
        
        if (symbols.length > 0) {
            watchlistData = await getWatchlistData(symbols);
            news = await getNews(symbols);
        } else {
             news = await getNews();
        }
    }

    if (watchlistData.length === 0) {
        return (
            <div className="watchlist-empty-container">
                <div className="watchlist-empty">
                    <Star className="watchlist-star mx-auto" />
                    <h2 className="empty-title">Your Watchlist is Empty</h2>
                    <p className="empty-description mx-auto">
                        Start tracking your favorite stocks by searching for them and clicking "Add to Watchlist".
                    </p>
                    <Link href="/search" className="search-btn mx-auto mt-4">
                        <Plus className="h-4 w-4" />
                        Explore Stocks
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-gray-100">Watchlist</h1>
                 <Link href="/search" className="search-btn">
                    Add Stock
                 </Link>
            </div>

            {/* Main Content: Table & Alerts */}
            <div className="watchlist-container">
                <div className="watchlist">
                    <WatchlistTable data={watchlistData} />
                </div>
                
                {/* Alerts Sidebar - Placeholder */}
                <div className="watchlist-alerts">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-100">Alerts</h2>
                        <button className="search-btn text-sm py-1.5 px-3">Create Alert</button>
                     </div>
                     <div className="alert-list">
                        <div className="alert-empty">No active alerts set.</div>
                     </div>
                </div>
            </div>

            {/* News Section */}
            <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-gray-100">News</h2>
                <div className="watchlist-news">
                    {news.map((item) => (
                        <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="news-item group">
                            <span className="news-tag uppercase">{item.related || item.category}</span>
                            <h3 className="news-title group-hover:text-yellow-500 transition-colors line-clamp-2">{item.headline}</h3>
                            <div className="news-meta">
                                <span>{item.source}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(item.datetime * 1000).toLocaleDateString()}</span>
                            </div>
                            <p className="news-summary line-clamp-3">{item.summary}</p>
                            <span className="news-cta">Read More →</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default WatchlistPage;
