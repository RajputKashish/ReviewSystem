import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const submitRating = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { storeId, rating } = req.body;
        const userId = req.user!.id;

        // Check if store exists
        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        // Check if user has already rated this store
        const existingRating = await prisma.rating.findUnique({
            where: {
                userId_storeId: {
                    userId,
                    storeId,
                },
            },
        });

        if (existingRating) {
            res.status(400).json({ message: 'You have already rated this store. Use update to modify.' });
            return;
        }

        // Create rating
        const newRating = await prisma.rating.create({
            data: {
                rating,
                userId,
                storeId,
            },
            select: {
                id: true,
                rating: true,
                storeId: true,
                createdAt: true,
            },
        });

        res.status(201).json({
            message: 'Rating submitted successfully',
            rating: newRating,
        });
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateRating = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const { rating } = req.body;
        const userId = req.user!.id;

        // Check if rating exists
        const existingRating = await prisma.rating.findUnique({
            where: {
                userId_storeId: {
                    userId,
                    storeId: parseInt(storeId),
                },
            },
        });

        if (!existingRating) {
            res.status(404).json({ message: 'Rating not found' });
            return;
        }

        // Update rating
        const updatedRating = await prisma.rating.update({
            where: {
                userId_storeId: {
                    userId,
                    storeId: parseInt(storeId),
                },
            },
            data: { rating },
            select: {
                id: true,
                rating: true,
                storeId: true,
                updatedAt: true,
            },
        });

        res.json({
            message: 'Rating updated successfully',
            rating: updatedRating,
        });
    } catch (error) {
        console.error('Update rating error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getStoreRatings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const userId = req.user!.id;

        // Verify user owns this store
        const store = await prisma.store.findUnique({
            where: { id: parseInt(storeId) },
            select: { ownerId: true },
        });

        if (!store || store.ownerId !== userId) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        const ratings = await prisma.rating.findMany({
            where: { storeId: parseInt(storeId) },
            select: {
                id: true,
                rating: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const averageRating = ratings.length > 0
            ? (ratings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / ratings.length).toFixed(1)
            : null;

        res.json({
            ratings,
            averageRating,
            totalRatings: ratings.length,
        });
    } catch (error) {
        console.error('Get store ratings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserRatings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;

        const ratings = await prisma.rating.findMany({
            where: { userId },
            select: {
                id: true,
                rating: true,
                store: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({ ratings });
    } catch (error) {
        console.error('Get user ratings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
