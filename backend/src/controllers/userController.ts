import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';

interface RatingInfo {
    rating: number;
}

interface UserWithStore {
    id: number;
    name: string;
    email: string;
    address: string;
    role: string;
    createdAt: Date;
    store: {
        id: number;
        name: string;
        ratings: RatingInfo[];
    } | null;
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            search,
            name,
            email,
            address,
            role,
            sortBy = 'name',
            sortOrder = 'asc',
            page = '1',
            limit = '10',
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { name: { contains: search as string } },
                { email: { contains: search as string } },
                { address: { contains: search as string } },
            ];
        }

        if (name) {
            where.name = { contains: name as string };
        }
        if (email) {
            where.email = { contains: email as string };
        }
        if (address) {
            where.address = { contains: address as string };
        }
        if (role) {
            where.role = role as string;
        }

        // Build orderBy
        const orderBy: Record<string, string> = {};
        if (['name', 'email', 'address', 'role', 'createdAt'].includes(sortBy as string)) {
            orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy,
                skip,
                take: limitNum,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    address: true,
                    role: true,
                    createdAt: true,
                    store: {
                        select: {
                            id: true,
                            name: true,
                            ratings: {
                                select: {
                                    rating: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        // Calculate average rating for store owners
        const usersWithRatings = (users as unknown as UserWithStore[]).map((user) => {
            let averageRating: string | null = null;
            if (user.store && user.store.ratings.length > 0) {
                const sum = user.store.ratings.reduce((acc: number, r: RatingInfo) => acc + r.rating, 0);
                averageRating = (sum / user.store.ratings.length).toFixed(1);
            }
            return {
                ...user,
                store: user.store ? { ...user.store, averageRating } : null,
            };
        });

        res.json({
            users: usersWithRatings,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                role: true,
                createdAt: true,
                store: {
                    select: {
                        id: true,
                        name: true,
                        ratings: {
                            select: {
                                rating: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Calculate average rating if store owner
        let averageRating: string | null = null;
        if (user.store && user.store.ratings.length > 0) {
            const sum = user.store.ratings.reduce((acc: number, r: RatingInfo) => acc + r.rating, 0);
            averageRating = (sum / user.store.ratings.length).toFixed(1);
        }

        res.json({
            user: {
                ...user,
                store: user.store ? { ...user.store, averageRating } : null,
            },
        });
    } catch (error) {
        console.error('Get user by id error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, address, role = 'USER' } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                address,
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                role: true,
                createdAt: true,
            },
        });

        res.status(201).json({
            message: 'User created successfully',
            user,
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
