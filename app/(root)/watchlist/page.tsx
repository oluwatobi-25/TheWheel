import React from 'react'
import WatchlistTable from '@/components/WatchlistTable'
import { getWatchlistByEmail } from "@/lib/actions/watchlist.actions";
import { getWatchlistData, getNews } from "@/lib/actions/finnhub.actions";
import { getAlertsByUserId } from "@/lib/actions/alert.actions";
import { IAlert } from "@/database/models/alert.model";
import AlertPanel from "@/components/AlertPanel";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { Star, Plus } from 'lucide-react';
import Link from 'next/link';

const WatchlistPage = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    
    let watchlistData: StockWithData[] = [];
    let news: MarketNewsArticle[] = [];
    
    let alerts: IAlert[] = [];
    if (session?.user?.id) {
        alerts = await getAlertsByUserId(session.user.id);
    }
    
    if (session?.user?.email) {
        const watchlist = await getWatchlistByEmail(session.user.email);
        const symbols = watchlist.map(i => i.symbol);
        
        if (symbols.length > 0) {
            watchlistData = await getWatchlistData(symbols);
            const allNews = await getNews(symbols);
            news = allNews.slice(0, 3); // Limit to 3 news articles
        } else {
             const allNews = await getNews();
             news = allNews.slice(0, 3); // Limit to 3 news articles
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
            </div>

            {/* Main Content: Table & Alerts */}
            <div className="watchlist-container flex flex-col lg:flex-row gap-8">
                <div className="watchlist flex-1">
                    <WatchlistTable data={watchlistData} userId={session?.user?.id || ''} userEmail={session?.user?.email || ''} />
                </div>
                
                <div className="lg:w-[400px]">
                    <AlertPanel alerts={alerts} watchlistData={watchlistData} />
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
