'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose?.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function getWatchlistByEmail(email: string): Promise<any[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose?.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();
        return JSON.parse(JSON.stringify(items));
    } catch (err) {
        console.error('getWatchlistByEmail error:', err);
        return [];
    }
}


export async function toggleWatchlist({
  symbol,
  company,
  email,
  isInWatchlist,
}: {
  symbol: string;
  company: string;
  email: string;
  isInWatchlist: boolean;
}) {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose?.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ id?: string; _id?: unknown }>({ email });
    if (!user) throw new Error('User not found');

    const userId = user.id || String(user._id);

    if (isInWatchlist) {
      await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });
      return { success: true, message: 'Removed from watchlist' };
    } else {
      await Watchlist.create({
        userId,
        symbol: symbol.toUpperCase(),
        company,
      });
      return { success: true, message: 'Added to watchlist' };
    }
  } catch (error) {
    console.error('Error toggling watchlist:', error);
    return { success: false, error: 'Failed to update watchlist' };
  }
}