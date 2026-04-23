"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, Loader2, Star, X, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "@/hooks/useDebounce";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { useRouter } from "next/navigation";

const SearchCommand = ({
  renderAs = "button",
  label = "Search stocks...",
  initialStocks,
  userEmail,
  buttonVariant = "secondary",
  className,
}: SearchCommandProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks || []);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isSearchMode = query.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus input & lock scroll when open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const debouncedSearch = useDebounce(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
        const results = await searchStocks(query);
        setStocks(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, 300);

  useEffect(() => {
    if (isSearchMode) {
      debouncedSearch();
    } else {
      setStocks(initialStocks || []);
    }
  }, [query, initialStocks, isSearchMode]);

  const handleToggleWatchlist = async (
    symbol: string,
    company: string,
    isInWatchlist: boolean
  ) => {
    if (!userEmail) return;
    setToggling(symbol);
    try {
      const res = await toggleWatchlist({ symbol, company, email: userEmail, isInWatchlist });
      if (res.success) {
        setStocks((prev) =>
          prev.map((s) =>
            s.symbol === symbol ? { ...s, isInWatchlist: !isInWatchlist } : s
          )
        );
        router.refresh();
      }
    } catch (error) {
      console.error("Toggle error:", error);
    } finally {
      setToggling(null);
    }
  };

  const handleSelect = () => {
    setOpen(false);
    setQuery("");
  };

  const sectionLabel = isSearchMode
    ? `Results (${stocks.length})`
    : `Popular Stocks (${stocks.length})`;

  // ─── Modal Portal ──────────────────────────────────────────────
  const modal =
    mounted && open
      ? createPortal(
          <div
            className="fixed inset-0 z-50 flex items-start justify-center"
            style={{ paddingTop: "13vh" }}
            onClick={() => setOpen(false)}
          >
            {/* Blurred backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Glass panel */}
            <div
              className="relative w-full max-w-[560px] mx-4 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: "rgba(18, 18, 18, 0.92)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search input row */}
              <div
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Search className="h-4 w-4 shrink-0 text-gray-500" />
                <input
                  ref={inputRef}
                  placeholder="Search by symbol or company name"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-md text-gray-600 hover:text-gray-300 hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Section header */}
              {!loading && stocks.length > 0 && (
                <div
                  className="px-4 py-2.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {sectionLabel}
                  </span>
                </div>
              )}

              {/* Results list */}
              <ul className="max-h-[400px] overflow-y-auto py-1">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                  </div>
                ) : (
                  <>
                    {stocks.map((stock) => (
                      <li
                        key={stock.symbol}
                        className="group flex items-center gap-3 px-4 py-3 hover:bg-white/4 transition-colors"
                      >
                        {/* Icon */}
                        <div
                          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
                        </div>

                        {/* Name + meta */}
                        <Link
                          href={`/stocks/${stock.symbol}`}
                          onClick={handleSelect}
                          className="flex-1 min-w-0"
                        >
                          <div className="text-sm font-semibold text-white truncate leading-tight">
                            {stock.name}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-500">
                            <span className="font-mono uppercase">{stock.symbol}</span>
                            <span className="opacity-40">•</span>
                            <span>{stock.exchange}</span>
                            {stock.type && (
                              <>
                                <span className="opacity-40">•</span>
                                <span>{stock.type}</span>
                              </>
                            )}
                          </div>
                        </Link>

                        {/* Watchlist star */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWatchlist(
                              stock.symbol,
                              stock.name,
                              stock.isInWatchlist
                            );
                          }}
                          disabled={toggling === stock.symbol}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          {toggling === stock.symbol ? (
                            <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                          ) : (
                            <Star
                              className={`h-4 w-4 transition-colors ${
                                stock.isInWatchlist
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-600 group-hover:text-gray-400"
                              }`}
                            />
                          )}
                        </button>
                      </li>
                    ))}

                    {stocks.length === 0 && query && (
                      <div className="py-12 text-center text-sm text-gray-500">
                        No stocks found for &quot;{query}&quot;
                      </div>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>,
          document.body
        )
      : null;

  // ─── Trigger ───────────────────────────────────────────────────
  return (
    <>
      {renderAs === "button" ? (
        <Button
          variant={buttonVariant}
          onClick={() => setOpen(true)}
          className={className}
        >
          <Search className="mr-2 h-4 w-4" />
          {label}
        </Button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={`hover:text-yellow-500 transition-colors font-medium bg-transparent border-none p-0 cursor-pointer ${className}`}
        >
          {label}
        </button>
      )}

      {modal}
    </>
  );
};

export default SearchCommand;