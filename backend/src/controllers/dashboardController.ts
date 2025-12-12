import { Request, Response } from 'express';
import prisma from '../config/database';

export const getStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const [totalUsers, totalStores, totalRatings] = await Promise.all([
            prisma.user.count(),
            prisma.store.count(),
            prisma.rating.count(),
        ]);

        res.json({
            stats: {
                totalUsers,
                totalStores,
                totalRatings,
            },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
