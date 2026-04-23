import { getNews } from "@/lib/actions/finnhub.actions";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWatchlistByEmail } from "@/lib/actions/watchlist.actions";

export default async function NewsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    let news: MarketNewsArticle[] = [];

    if (session?.user?.email) {
        const watchlist = await getWatchlistByEmail(session.user.email);
        const symbols = watchlist.map(i => i.symbol);
        
        if (symbols.length > 0) {
            news = await getNews(symbols);
        } else {
             news = await getNews();
        }
    } else {
        news = await getNews();
    }

    return (
        <div className="flex flex-col gap-10 py-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">Market News</h1>
                <p className="text-gray-500 text-lg">Stay updated with the latest market trends and company updates.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {news.map((item) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="news-item group flex flex-col h-full hover:shadow-2xl hover:shadow-yellow-500/10 transition-all border-gray-600 bg-gray-800">
                        <span className="news-tag uppercase w-fit">{item.related || item.category}</span>
                        <h3 className="news-title group-hover:text-yellow-500 transition-colors line-clamp-2 text-xl mb-4">{item.headline}</h3>
                        <div className="news-meta mb-4">
                            <span className="font-medium text-gray-400">{item.source}</span>
                            <span className="mx-2 text-gray-600">•</span>
                            <span className="text-gray-500">{new Date(item.datetime * 1000).toLocaleDateString()}</span>
                        </div>
                        <p className="news-summary line-clamp-4 text-gray-400 leading-relaxed flex-1 mb-6">{item.summary}</p>
                        <span className="news-cta mt-auto font-bold flex items-center gap-2">
                            Read Full Article 
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </a>
                ))}
            </div>

            {news.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-gray-500">No news articles found at the moment. Please check back later.</p>
                </div>
            )}
        </div>
    );
}
