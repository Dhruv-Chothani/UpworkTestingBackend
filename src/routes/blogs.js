import { Router } from 'express';
import { Blog } from '../models/Blog.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const blogs = await Blog.find({ published: true }).sort({ publishedAt: -1 });
  res.json(blogs);
});

router.get('/all', authMiddleware, async (_req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

router.get('/:slug', async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ message: 'Not found' });
  res.json(blog);
});

router.post('/', authMiddleware, async (req, res) => {
  const blog = await Blog.create(req.body);
  res.status(201).json(blog);
});

router.put('/:id', authMiddleware, async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!blog) return res.status(404).json({ message: 'Not found' });
  res.json(blog);
});

router.delete('/:id', authMiddleware, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;

