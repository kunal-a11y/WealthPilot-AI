import { Router } from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/user/profile
router.get('/profile', requireAuth(), async (req, res) => {
  try {
    const clerkId = getAuth(req).userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    let user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      // First time user, create basic profile
      user = await prisma.user.create({
        data: {
          clerkId,
          email: clerkId + "@placeholder.com", // Adjust if you have actual email access
        }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/user/onboard
router.post('/onboard', requireAuth(), async (req, res) => {
  try {
    const clerkId = getAuth(req).userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    const { 
      firstName, lastName, age, country, currency, occupation, 
      monthlyIncome, monthlyExpenses, riskProfile, financialLevel 
    } = req.body;

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        firstName, lastName, age, country, currency, occupation,
        monthlyIncome, monthlyExpenses, riskProfile, financialLevel
      },
      create: {
        clerkId,
        email: clerkId + "@placeholder.com",
        firstName, lastName, age, country, currency, occupation,
        monthlyIncome, monthlyExpenses, riskProfile, financialLevel
      }
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error onboarding user:', error);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

export default router;
