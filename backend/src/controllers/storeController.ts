import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

interface RatingInfo {
    id: number;
    rating: number;
    userId: number;
}

interface StoreWithRatings {
    id: number;
    name: string;
    email: string;
    address: string;
    createdAt: Date;
    ratings: RatingInfo[];
}

export const getStores = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            search,
            name,
            address,
            sortBy = 'name',
            sortOrder = 'asc',
            page = '1',
            limit = '10',
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;
        const userId = req.user?.id;

        // Build where clause
        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { address: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        if (name) {
            where.name = { contains: name as string, mode: 'insensitive' };
        }
        if (address) {
            where.address = { contains: address as string, mode: 'insensitive' };
        }

        // Build orderBy
        const orderBy: Record<string, string> = {};
        if (['name', 'email', 'address', 'createdAt'].includes(sortBy as string)) {
            orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
        }

        const [stores, total] = await Promise.all([
            prisma.store.findMany({
                where,
                orderBy,
                skip,
                take: limitNum,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    address: true,
                    createdAt: true,
                    ratings: {
                        select: {
                            id: true,
                            rating: true,
                            userId: true,
                        },
                    },
                },
            }),
            prisma.store.count({ where }),
        ]);

        // Calculate average rating and user's submitted rating for each store
        const storesWithRatings = (stores as unknown as StoreWithRatings[]).map((store) => {
            const ratings = store.ratings;
            const averageRating = ratings.length > 0
                ? (ratings.reduce((acc: number, r: RatingInfo) => acc + r.rating, 0) / ratings.length).toFixed(1)
                : null;

            const userRating = userId
                ? ratings.find((r: RatingInfo) => r.userId === userId)
                : null;

            return {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                createdAt: store.createdAt,
                averageRating,
                totalRatings: ratings.length,
                userRating: userRating ? userRating.rating : null,
                userRatingId: userRating ? userRating.id : null,
            };
        });

        res.json({
            stores: storesWithRatings,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getStoreById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const store = await prisma.store.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                createdAt: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                ratings: {
                    select: {
                        id: true,
                        rating: true,
                        userId: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        const averageRating = store.ratings.length > 0
            ? (store.ratings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / store.ratings.length).toFixed(1)
            : null;

        res.json({
            store: {
                ...store,
                averageRating,
                totalRatings: store.ratings.length,
            },
        });
    } catch (error) {
        console.error('Get store by id error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createStore = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, address, ownerId } = req.body;

        // Check if store email already exists
        const existingStore = await prisma.store.findUnique({
            where: { email },
        });

        if (existingStore) {
            res.status(400).json({ message: 'Store email already registered' });
            return;
        }

        // If ownerId is provided, verify the user exists and is a STORE_OWNER
        if (ownerId) {
            const owner = await prisma.user.findUnique({
                where: { id: ownerId },
            });

            if (!owner) {
                res.status(400).json({ message: 'Owner not found' });
                return;
            }

            // Check if user already owns a store
            const existingOwnership = await prisma.store.findUnique({
                where: { ownerId },
            });

            if (existingOwnership) {
                res.status(400).json({ message: 'User already owns a store' });
                return;
            }

            // Update user role to STORE_OWNER
            await prisma.user.update({
                where: { id: ownerId },
                data: { role: 'STORE_OWNER' },
            });
        }

        // Create store
        const store = await prisma.store.create({
            data: {
                name,
                email,
                address,
                ownerId: ownerId || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                createdAt: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(201).json({
            message: 'Store created successfully',
            store,
        });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyStore = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;

        const store = await prisma.store.findUnique({
            where: { ownerId: userId },
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                createdAt: true,
                ratings: {
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
                },
            },
        });

        if (!store) {
            res.status(404).json({ message: 'You do not own a store' });
            return;
        }

        const averageRating = store.ratings.length > 0
            ? (store.ratings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / store.ratings.length).toFixed(1)
            : null;

        res.json({
            store: {
                ...store,
                averageRating,
                totalRatings: store.ratings.length,
            },
        });
    } catch (error) {
        console.error('Get my store error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
