import TradingViewWidgets from '@/components/TradingViewWidgets'
import {
    BASELINE_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG, COMPANY_FINANCIALS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    SYMBOL_INFO_WIDGET_CONFIG, TECHNICAL_ANALYSIS_WIDGET_CONFIG
} from "@/lib/constants";
import WatchlistButton from "@/components/WatchlistButton";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {getWatchlistSymbolsByEmail} from "@/lib/actions/watchlist.actions";

const StockDetails = async ({ params }: StockDetailsPageProps) => {
    const { symbol } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    
    let isInWatchlist = false;
    if (session?.user?.email) {
        const watchlistSymbols = await getWatchlistSymbolsByEmail(session.user.email);
        isInWatchlist = watchlistSymbols.includes(symbol.toUpperCase());
    }

    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`

    return (
        <section className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Charts and Info */}
                <div className="lg:col-span-2 flex flex-col gap-10">
                    <TradingViewWidgets
                        scriptUrl={`${scriptUrl}symbol-info.js`}
                        config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
                        height={170}
                    />
                    <TradingViewWidgets
                        title="Candle Chart"
                        scriptUrl={`${scriptUrl}advanced-chart.js`}
                        config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
                        height={600}
                    />
                    <TradingViewWidgets
                        title="Baseline Chart"
                        scriptUrl={`${scriptUrl}advanced-chart.js`}
                        config={BASELINE_WIDGET_CONFIG(symbol)}
                        height={600}
                    />
                </div>

                {/* Right Column: Analysis and Profile */}
                <div className="flex flex-col gap-10">
                    <WatchlistButton 
                        symbol={symbol.toUpperCase()} 
                        company={symbol.toUpperCase()} 
                        isInWatchlist={isInWatchlist} 
                        userEmail={session?.user?.email}
                    />
                    <TradingViewWidgets
                        title="Technical Analysis"
                        scriptUrl={`${scriptUrl}technical-analysis.js`}
                        config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
                        height={400}
                    />
                    <TradingViewWidgets
                        title="Company Profile"
                        scriptUrl={`${scriptUrl}symbol-profile.js`}
                        config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
                        height={440}
                    />
                    <TradingViewWidgets
                        title="Financials"
                        scriptUrl={`${scriptUrl}financials.js`}
                        config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
                        height={464}
                    />
                </div>
            </div>
        </section>
    )
}

export default StockDetails;
