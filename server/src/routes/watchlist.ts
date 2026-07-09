import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { prisma } from '../lib/prisma';
import yahooFinance from 'yahoo-finance2';

const router = Router();

// GET /api/watchlist
router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.claims?.sub || 'default-user-id';
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (watchlist.length === 0) return res.json([]);

    // Fetch live quotes for all symbols in the watchlist
    const symbols = watchlist.map(w => w.symbol);
    const quotes = await yahooFinance.quote(symbols);
    
    // Map quotes back to watchlist items
    // yahooFinance.quote returns an array if multiple symbols, or single object if one symbol
    const quotesArray: any[] = Array.isArray(quotes) ? quotes : [quotes];
    
    const enrichedWatchlist = watchlist.map(item => {
      const quote = quotesArray.find((q: any) => q.symbol === item.symbol);
      return {
        ...item,
        price: quote?.regularMarketPrice,
        change: quote?.regularMarketChange,
        changePercent: quote?.regularMarketChangePercent,
        currency: quote?.currency
      };
    });

    res.json(enrichedWatchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// POST /api/watchlist
router.post('/', requireAuth(), async (req, res) => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.claims?.sub || 'default-user-id';
    const { symbol, name } = req.body;
    
    if (!symbol || !name) return res.status(400).json({ error: 'Symbol and name required' });

    const item = await prisma.watchlist.create({
      data: { userId, symbol, name }
    });

    res.json(item);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Asset already in watchlist' });
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// DELETE /api/watchlist/:symbol
router.delete('/:symbol', requireAuth(), async (req, res) => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.claims?.sub || 'default-user-id';
    const symbol = req.params.symbol as string;

    await prisma.watchlist.delete({
      where: {
        userId_symbol: {
          userId,
          symbol
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

export default router;
