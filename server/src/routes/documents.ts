import { Router } from 'express';
import { requireAuth, getAuth } from '@clerk/express';
import { prisma } from '../lib/prisma';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();

// GET /api/documents
router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// POST /api/documents/upload
router.post('/upload', requireAuth(), upload.single('file'), async (req, res) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type = 'OTHER', name } = req.body;
    const documentName = name || req.file.originalname;

    const document = await prisma.document.create({
      data: {
        userId,
        name: documentName,
        type,
        url: `/uploads/${req.file.filename}`
      }
    });

    res.json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const userId = getAuth(req).userId;
    const { id } = req.params;

    const document = await prisma.document.findUnique({ where: { id } });
    
    if (!document || document.userId !== userId) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../..', document.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await prisma.document.delete({ where: { id } });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
