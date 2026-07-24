import { Router } from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();
const router = Router();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "WealthPilot AI",
  }
});

// POST /api/ai/chat
router.post('/chat', requireAuth(), async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your backend .env file.' });
    }

    const { message } = req.body;
    const userId = getAuth(req).userId || 'default-user-id';

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message
    const userMessage = await prisma.chatHistory.create({
      data: {
        userId,
        role: 'user',
        content: message,
      }
    });

    // Fetch previous context
    const history = await prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 10 // only use last 10 messages for context
    });

    // Fetch user's financial profile
    const userProfile = await prisma.user.findUnique({ where: { clerkId: userId } });
    const assets = await prisma.asset.findMany({ where: { userId } });
    const liabilities = await prisma.liability.findMany({ where: { userId } });
    const goals = await prisma.goal.findMany({ where: { userId } });
    const netWorth = assets.reduce((a, b) => a + b.value, 0) - liabilities.reduce((a, b) => a + b.value, 0);

    const contextStr = userProfile ? `
    USER CONTEXT:
    Name: ${userProfile.firstName} ${userProfile.lastName}
    Age: ${userProfile.age || 'Unknown'}, Occupation: ${userProfile.occupation || 'Unknown'}
    Monthly Income: ${userProfile.monthlyIncome}, Monthly Expenses: ${userProfile.monthlyExpenses}
    Risk Profile: ${userProfile.riskProfile}, Currency: ${userProfile.currency}
    Net Worth: ${netWorth}
    Assets: ${JSON.stringify(assets.map(a => ({ name: a.name, value: a.value, type: a.type })))}
    Liabilities: ${JSON.stringify(liabilities.map(l => ({ name: l.name, value: l.value, type: l.type })))}
    Goals: ${JSON.stringify(goals.map(g => ({ name: g.name, target: g.targetAmount, current: g.currentAmount })))}
    ` : 'USER CONTEXT: Not available.';

    const messages = [
      { 
        role: 'system', 
        content: `You are WealthPilot AI, a premium, professional fintech AI Advisor. 
        Your purpose is to provide personalized, data-driven financial advice based on the user's actual profile.
        
        ${contextStr}

        CRITICAL RULES:
        1. YOU MUST ONLY ANSWER questions related to stocks, ETFs, mutual funds, bonds, commodities, cryptocurrencies, and growing wealth.
        2. If the user asks about ANYTHING ELSE, YOU MUST REFUSE and state that you are an AI Financial Advisor.
        3. BE CONCISE. Use very short answers, heavy bullet points, and lots of relevant emojis 📈🚀💡.
        4. Tailor all advice to the user's specific Net Worth, Assets, Liabilities, and Goals.
        5. NEVER recommend an investment solely because prices recently increased. You must evaluate: Business quality, Financial statements, Cash flow, Profitability, Debt, Valuation, Competitive position, Economic conditions, Diversification, Risk, Liquidity, User goals, Investment horizon, Risk tolerance, and Income needs.
        6. ASSET LINKS (CRUCIAL): Whenever you mention a specific asset, you MUST format its EXACT Yahoo Finance ticker as a markdown link pointing to its company page. For international stocks, you MUST include the exchange suffix (e.g., .NS or .BO for Indian stocks, .L for UK, .AX for Australia). EXAMPLES: Apple is [AAPL](/company/AAPL). Reliance is [RELIANCE.NS](/company/RELIANCE.NS). Bitcoin is [BTC-USD](/company/BTC-USD). Indian ETFs MUST have .NS like [JUNIORBEES.NS](/company/JUNIORBEES.NS) or [NIFTYBEES.NS](/company/NIFTYBEES.NS). If you do not know the exact Yahoo Finance ticker, do NOT guess. Find a different asset you know the exact ticker for.
        7. EXPLICIT RECOMMENDATIONS: If the user asks for recommendations, you MUST provide explicit examples of popular, high-performing assets with their exact tickers formatted as links.
        8. INVESTMENT HORIZONS: When recommending an investment, you MUST explicitly recommend an appropriate holding period (Short Term: 1W, 1M, 3M, 6M; Medium Term: 1Y, 2Y, 3Y; Long Term: 5Y, 10Y, 15+Y) and explain WHY.
        9. FINANCIAL DISCLAIMER: EVERY SINGLE recommendation or analysis MUST include this exact disclaimer at the end: "This analysis is generated for educational purposes only and should not be considered personalized financial advice. Investing involves risk, and past performance does not guarantee future results. Always conduct your own research or consult a qualified financial professional before making investment decisions."` 
      },
      ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: messages as any,
      max_tokens: 2000,
    });

    const aiResponseContent = completion.choices[0]?.message?.content || 'I could not generate a response.';

    // Save AI response
    const aiMessage = await prisma.chatHistory.create({
      data: {
        userId,
        role: 'assistant',
        content: aiResponseContent,
      }
    });

    res.json({ message: aiMessage });
  } catch (error: any) {
    console.error('Error in AI Chat:', error);
    res.status(500).json({ error: error.message || 'Failed to process AI chat request' });
  }
});

// GET /api/ai/history
router.get('/history', requireAuth(), async (req, res) => {
  try {
    const userId = getAuth(req).userId || 'default-user-id';
    const history = await prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// DELETE /api/ai/history
router.delete('/history', requireAuth(), async (req, res) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    await prisma.chatHistory.deleteMany({
      where: { userId }
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting chat history:', error);
    res.status(500).json({ error: 'Failed to delete chat history' });
  }
});

// POST /api/ai/analyze-company
router.post('/analyze-company', requireAuth(), async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: 'OpenAI API key not configured.' });
    }

    const { symbol, marketData } = req.body;
    if (!symbol || !marketData) return res.status(400).json({ error: 'Symbol and marketData required' });

    // Fetch user portfolio for Portfolio Fit Analysis
    const userId = getAuth(req).userId;
    let portfolioStr = "No portfolio data provided.";
    if (userId) {
      const assets = await prisma.asset.findMany({ where: { userId } });
      if (assets.length > 0) {
        portfolioStr = JSON.stringify(assets.map(a => ({ name: a.name, value: a.value, type: a.type })));
      }
    }

    const prompt = `You are a strict, professional AI Investment Analyst.
    Analyze the following market data for ${symbol}:
    ${JSON.stringify(marketData)}
    
    The user's current portfolio is: ${portfolioStr}
    
    Generate a highly detailed, deeply analytical JSON breakdown. Keep text explanations concise and punchy to save tokens.
    
    Provide a JSON object with EXACTLY these keys:
    - overallScore: (number 0-100)
    - investmentRating: (string: "Strong Buy", "Buy", "Accumulate", "Hold", "Reduce", or "Avoid")
    - recommendationReasoning: (string explaining the rating)
    - horizons: Object with keys: "shortTerm" (1-3 months), "mediumTerm" (6-12 months), "longTerm" (3+ years). Each must be an object with: "recommendation" (string) and "reasoning" (string).
    - scenarios: Object with keys: "conservative", "expected", "optimistic". Each must be an object with: "projection" (string, e.g. "+5% per year") and "assumptions" (string).
    - riskAnalysis: Object with keys: "overall", "business", "financial", "market", "sector", "currency", "geopolitical", "volatility". Each must be a number 0-100. Also provide an "explanation" key inside riskAnalysis explaining the primary risks.
    - deepDive: Object with keys: "businessModel", "moat" (competitive advantage), "strengths", "weaknesses", "opportunities", "management", "sentiment". Each should be a concise string.
    - portfolioFit: Object with keys: "fit" (short string, e.g. "Excellent Diversification" or "Too Much Tech Exposure") and "reasoning" (string explaining why based on the user's portfolio).
    
    Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json.`;

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    let content = completion.choices[0]?.message?.content || '{}';
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(content);
    res.json(result);
  } catch (error: any) {
    console.error('Error in AI Analysis:', error);
    res.status(500).json({ error: 'Failed to analyze company' });
  }
});

// POST /api/ai/build-portfolio
router.post('/build-portfolio', requireAuth(), async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: 'OpenAI API key not configured.' });
    }

    const { amount, risk, goal, country, expectedReturn } = req.body;
    if (!amount || !risk) return res.status(400).json({ error: 'Amount and risk profile required' });

    const prompt = `You are a strict, professional AI Investment Advisor.
    Build a diversified investment portfolio for a user based in ${country || 'the world'} 
    with the following profile:
    - Investment Amount: ${amount}
    - Risk Tolerance: ${risk}
    - Goal: ${goal || 'General Growth'}
    - Expected Annual Return Target: ${expectedReturn || 'Reasonable market average'}%
    
    Provide a JSON breakdown with the following keys:
    - allocations (Array of objects with "assetClass", "symbol" (You MUST use real-world, exact Yahoo Finance ticker symbols like SPY, QQQ, RELIANCE.NS. DO NOT use generic placeholders like 'Large Cap'. For Indian assets, MUST append .NS or .BO), "percentage", "reasoning")
    - expectedAnnualReturn (string, e.g. "8-10%")
    - riskAnalysis (Concise professional paragraph)
    - summary (Concise professional paragraph explaining the strategy)
    
    Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json.`;

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    let content = completion.choices[0]?.message?.content || '{}';
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(content);

    // Fetch real market data for the recommended symbols
    if (result.allocations && Array.isArray(result.allocations)) {
      const symbols = result.allocations.filter((a: any) => a.symbol).map((a: any) => a.symbol);
      if (symbols.length > 0) {
        try {
          const quotes = await yahooFinance.quote(symbols);
          const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
          result.allocations = result.allocations.map((alloc: any) => {
            const quote = quotesArray.find(q => q.symbol === alloc.symbol);
            if (quote) {
              return { ...alloc, currentPrice: quote.regularMarketPrice, currency: quote.currency };
            }
            return alloc;
          });
        } catch (err) {
          console.error("Failed to fetch quotes for portfolio:", err);
        }
      }
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error in Portfolio Builder:', error);
    res.status(500).json({ error: 'Failed to build portfolio' });
  }
});

// GET /api/ai/health-score
router.get('/health-score', requireAuth(), async (req, res) => {
  try {
    if (!openai) return res.status(503).json({ error: 'OpenAI API key not configured.' });
    
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const assets = await prisma.asset.findMany({ where: { userId } });
    const liabilities = await prisma.liability.findMany({ where: { userId } });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    const totalAssets = assets.reduce((a, b) => a + b.value, 0);
    const totalLiabilities = liabilities.reduce((a, b) => a + b.value, 0);

    const prompt = `Analyze this user's financial health:
    Age: ${user?.age}
    Income: ${user?.monthlyIncome}
    Total Assets: ${totalAssets}
    Total Liabilities: ${totalLiabilities}
    
    Return a JSON object with:
    - score (0-100)
    - status (Excellent, Good, Fair, Poor)
    - advice (1 short sentence)`;

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    let content = completion.choices[0]?.message?.content || '{}';
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate health score' });
  }
});

// POST /api/ai/discover
router.post('/discover', requireAuth(), async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: 'OpenAI API key not configured.' });
    }

    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const aiPrompt = `You are an expert Global Investment Scanner AI.
    The user is asking to discover investments: "${prompt}"
    
    Find 5-10 real, highly relevant global assets (Stocks, ETFs, Mutual Funds, Bonds, Commodities, Crypto, etc.) that match this query.
    You MUST provide the EXACT Yahoo Finance ticker symbol for each asset. Include regional suffixes (e.g., .NS or .BO for India, .L for UK, .AX for Australia, etc.) for non-US assets. EXAMPLES: "AAPL", "BTC-USD", "RELIANCE.NS", "JUNIORBEES.NS". If you do not know the exact Yahoo Finance ticker suffix, do not suggest that asset.
    
    Return a JSON array of objects, where each object has:
    - "symbol" (the exact Yahoo Finance ticker string)
    - "name" (the human-readable name of the asset)
    - "reason" (a very short 1-sentence explanation of why it fits the query)
    
    Respond ONLY with the JSON array. Do not include markdown formatting like \`\`\`json.`;

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: aiPrompt }],
      max_tokens: 1000,
    });

    let content = completion.choices[0]?.message?.content || '[]';
    // Clean up potential markdown formatting if the model disobeys
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(content);
    res.json(result);
  } catch (error: any) {
    console.error('Error in AI Discovery:', error);
    res.status(500).json({ error: 'Failed to discover assets' });
  }
});

export default router;
