'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, StarOff, Loader2 } from 'lucide-react';
import { toggleWatchlist } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface ExtendedWatchlistButtonProps extends WatchlistButtonProps {
    userEmail?: string;
}

const WatchlistButton = ({ symbol, company, isInWatchlist: initialStatus, userEmail }: ExtendedWatchlistButtonProps) => {
    const [isInWatchlist, setIsInWatchlist] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        if (!userEmail) {
            toast.error('Please sign in to add to watchlist');
            return;
        }

        setIsLoading(true);
        try {
            const result = await toggleWatchlist({
                symbol,
                company,
                email: userEmail,
                isInWatchlist
            });

            if (result.success) {
                setIsInWatchlist(!isInWatchlist);
                toast.success(result.message);
            } else {
                toast.error(result.error || 'Failed to update watchlist');
            }
        } catch (error) {
            console.error('Watchlist toggle error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(
                "watchlist-btn h-14 transition-all duration-300",
                isInWatchlist && "watchlist-remove"
            )}
        >
            {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : isInWatchlist ? (
                <>
                    <StarOff className="h-5 w-5 fill-current" />
                    Remove from Watchlist
                </>
            ) : (
                <>
                    <Star className="h-5 w-5" />
                    Add to Watchlist
                </>
            )}
        </Button>
    );
};

export default WatchlistButton;
