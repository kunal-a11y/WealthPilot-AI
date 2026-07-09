import { Router } from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import { prisma } from '../lib/prisma';

const router = Router();

const getUserId = (req: any) => getAuth(req).userId;

// ==============================
// ASSETS
// ==============================

router.get('/assets', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const assets = await prisma.asset.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  res.json(assets);
});

router.post('/assets', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { type, name, value, currency, category, notes } = req.body;
  const asset = await prisma.asset.create({
    data: { userId, type, name, value: parseFloat(value), currency, category, notes }
  });
  res.json(asset);
});

router.delete('/assets/:id', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  await prisma.asset.delete({ where: { id: req.params.id, userId } });
  res.json({ success: true });
});

// ==============================
// LIABILITIES
// ==============================

router.get('/liabilities', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const liabilities = await prisma.liability.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  res.json(liabilities);
});

router.post('/liabilities', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { type, name, value, interestRate, notes } = req.body;
  const liability = await prisma.liability.create({
    data: { userId, type, name, value: parseFloat(value), interestRate: parseFloat(interestRate) || null, notes }
  });
  res.json(liability);
});

router.delete('/liabilities/:id', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  await prisma.liability.delete({ where: { id: req.params.id, userId } });
  res.json({ success: true });
});

// ==============================
// TRANSACTIONS
// ==============================

router.get('/transactions', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const tx = await prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' } });
  res.json(tx);
});

router.post('/transactions', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { type, amount, date, description, category } = req.body;
  const tx = await prisma.transaction.create({
    data: { userId, type, amount: parseFloat(amount), date: new Date(date), description, category }
  });
  res.json(tx);
});

// ==============================
// GOALS
// ==============================

router.get('/goals', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const goals = await prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  res.json(goals);
});

router.post('/goals', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { name, targetAmount, currentAmount, targetDate, monthlyContribution, category } = req.body;
  const goal = await prisma.goal.create({
    data: { 
      userId, name, targetAmount: parseFloat(targetAmount), 
      currentAmount: parseFloat(currentAmount) || 0, 
      targetDate: targetDate ? new Date(targetDate) : null, 
      monthlyContribution: parseFloat(monthlyContribution) || null, 
      category 
    }
  });
  res.json(goal);
});

router.delete('/goals/:id', requireAuth(), async (req, res) => {
  const userId = getUserId(req);
  await prisma.goal.delete({ where: { id: req.params.id, userId } });
  res.json({ success: true });
});

export default router;
