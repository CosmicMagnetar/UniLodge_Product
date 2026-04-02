import { Router } from 'express';
const router = Router();

// Mock data for initial commit
const properties = [
  { id: 1, name: 'Skyline Residency', price: 1200, location: 'Near Campus' },
  { id: 2, name: 'Green Valley', price: 950, location: 'Downtown' }
];

router.get('/', (_req, res) => {
  res.json(properties);
});

export default router;
