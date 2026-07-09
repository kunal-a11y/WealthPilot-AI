import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();
const router = Router();

// GET /api/market/quote/:symbol
router.get('/quote/:symbol', requireAuth(), async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await yahooFinance.quote(symbol);
    res.json(quote);
  } catch (error: any) {
    console.error(`Error fetching quote for ${req.params.symbol}:`, error.message);
    res.status(404).json({ error: 'Asset not found or invalid symbol' });
  }
});

// GET /api/market/history/:symbol
router.get('/history/:symbol', requireAuth(), async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = '1mo' } = req.query; // 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    
    // Map human-readable ranges to yahoo-finance periods
    const period1 = new Date();
    if (range === '1d') period1.setDate(period1.getDate() - 1);
    else if (range === '5d') period1.setDate(period1.getDate() - 5);
    else if (range === '1mo') period1.setMonth(period1.getMonth() - 1);
    else if (range === '3mo') period1.setMonth(period1.getMonth() - 3);
    else if (range === '6mo') period1.setMonth(period1.getMonth() - 6);
    else if (range === '1y') period1.setFullYear(period1.getFullYear() - 1);
    else if (range === '2y') period1.setFullYear(period1.getFullYear() - 2);
    else if (range === '3y') period1.setFullYear(period1.getFullYear() - 3);
    else if (range === '5y') period1.setFullYear(period1.getFullYear() - 5);
    else if (range === '10y') period1.setFullYear(period1.getFullYear() - 10);
    else if (range === 'max') period1.setFullYear(1970);
    
    const period2 = new Date();
    const period1Str = period1.toISOString().split('T')[0];
    const period2Str = period2.toISOString().split('T')[0];

    const history = await yahooFinance.historical(symbol, { 
      period1: period1Str, 
      period2: period2Str 
    });
    
    res.json(history);
  } catch (error: any) {
    console.error(`Error fetching history for ${req.params.symbol}:`, error.message);
    res.status(404).json({ error: 'Historical data not found' });
  }
});

// GET /api/market/search
router.get('/search', requireAuth(), async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') return res.status(400).json({ error: 'Missing query parameter q' });
    
    const results = await yahooFinance.search(q);
    res.json(results);
  } catch (error) {
    console.error('Error searching market data:', error);
    res.status(500).json({ error: 'Failed to search market data' });
  }
});

// GET /api/market/trending
router.get('/trending', requireAuth(), async (req, res) => {
  try {
    // yahoo-finance2 trending symbols for a specific region (default US)
    const result = await yahooFinance.trendingSymbols('US');
    res.json(result);
  } catch (error) {
    console.error('Error fetching trending symbols:', error);
    res.status(500).json({ error: 'Failed to fetch trending symbols' });
  }
});

// GET /api/market/quotes
router.get('/quotes', requireAuth(), async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols || typeof symbols !== 'string') return res.status(400).json({ error: 'Missing query parameter symbols' });
    
    const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);
    const quotes = await yahooFinance.quote(symbolList);
    res.json({ quotes });
  } catch (error) {
    console.error('Error fetching bulk quotes:', error);
    res.status(500).json({ error: 'Failed to fetch bulk quotes' });
  }
});

// GET /api/market/sparklines
router.get('/sparklines', requireAuth(), async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols || typeof symbols !== 'string') return res.status(400).json({ error: 'Missing query parameter symbols' });
    
    const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);
    
    const period1 = new Date();
    period1.setDate(period1.getDate() - 14); // 14 days of history
    const period2 = new Date();
    const period1Str = period1.toISOString().split('T')[0];
    const period2Str = period2.toISOString().split('T')[0];

    // Fetch history for all symbols concurrently to save time
    const promises = symbolList.map(async (sym) => {
      try {
        const hist = await yahooFinance.historical(sym, { period1: period1Str, period2: period2Str });
        return { symbol: sym, history: hist.map(h => h.close) };
      } catch (e) {
        return { symbol: sym, history: [] }; // fail gracefully for individual symbols
      }
    });

    const results = await Promise.all(promises);
    const sparklines = results.reduce((acc, curr) => {
      acc[curr.symbol] = curr.history;
      return acc;
    }, {} as Record<string, number[]>);

    res.json(sparklines);
  } catch (error) {
    console.error('Error fetching sparklines:', error);
    res.status(500).json({ error: 'Failed to fetch sparklines' });
  }
});

// GET /api/market/company/:symbol
router.get('/company/:symbol', requireAuth(), async (req, res) => {
  try {
    const { symbol } = req.params;
    const summary = await yahooFinance.quoteSummary(symbol, { 
      modules: ['summaryProfile', 'financialData', 'defaultKeyStatistics', 'price', 'summaryDetail'] 
    });
    res.json(summary);
  } catch (error: any) {
    console.error(`Error fetching company details for ${req.params.symbol}:`, error.message);
    res.status(404).json({ error: 'Company details not found or invalid symbol' });
  }
});

// GET /api/market/overview
router.get('/overview', requireAuth(), async (req, res) => {
  try {
    const symbols = [
      '^NSEI', '^BSESN', '^GSPC', '^DJI', '^IXIC', // Indices
      'BTC-USD', 'ETH-USD', // Crypto
      'GC=F', 'SI=F', 'CL=F', // Commodities
      'INR=X', 'EURUSD=X' // Forex
    ];
    const quotes = await yahooFinance.quote(symbols);
    res.json(quotes);
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

export default router;
