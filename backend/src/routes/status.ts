import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/status
 * System status endpoint
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        database: 'pending', // Will be updated when database is connected
        blockchain: 'pending', // Will be updated when blockchain connection is added
      },
    },
  });
});

export default router;
