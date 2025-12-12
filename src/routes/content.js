import { Router } from 'express';
import { Content } from '../models/Content.js';
import { authMiddleware } from '../middleware/auth.js';
import { defaultContent } from '../constants/defaults.js';

const router = Router();
const CONTENT_KEY = 'home';

router.get('/home', async (_req, res) => {
  let content = await Content.findOne({ key: CONTENT_KEY });
  if (!content) {
    content = await Content.create({ key: CONTENT_KEY, data: defaultContent });
  }
  res.json(content.data);
});

router.put('/home', authMiddleware, async (req, res) => {
  const content = await Content.findOneAndUpdate(
    { key: CONTENT_KEY },
    { data: req.body },
    { new: true, upsert: true }
  );
  res.json(content.data);
});

export default router;

