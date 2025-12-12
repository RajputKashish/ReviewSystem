import { Request, Response, NextFunction } from 'express';
import { validators } from '../utils/validators';

export const validateSignup = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { name, email, password, address } = req.body;
    const errors: Record<string, string> = {};

    const nameResult = validators.name(name);
    if (!nameResult.valid) errors.name = nameResult.message;

    const emailResult = validators.email(email);
    if (!emailResult.valid) errors.email = emailResult.message;

    const passwordResult = validators.password(password);
    if (!passwordResult.valid) errors.password = passwordResult.message;

    const addressResult = validators.address(address);
    if (!addressResult.valid) errors.address = addressResult.message;

    if (Object.keys(errors).length > 0) {
        res.status(400).json({ message: 'Validation failed', errors });
        return;
    }

    next();
};

export const validateUser = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { name, email, password, address, role } = req.body;
    const errors: Record<string, string> = {};

    const nameResult = validators.name(name);
    if (!nameResult.valid) errors.name = nameResult.message;

    const emailResult = validators.email(email);
    if (!emailResult.valid) errors.email = emailResult.message;

    const passwordResult = validators.password(password);
    if (!passwordResult.valid) errors.password = passwordResult.message;

    const addressResult = validators.address(address);
    if (!addressResult.valid) errors.address = addressResult.message;

    if (role && !['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
        errors.role = 'Invalid role';
    }

    if (Object.keys(errors).length > 0) {
        res.status(400).json({ message: 'Validation failed', errors });
        return;
    }

    next();
};

export const validateStore = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { name, email, address } = req.body;
    const errors: Record<string, string> = {};

    const nameResult = validators.name(name);
    if (!nameResult.valid) errors.name = nameResult.message;

    const emailResult = validators.email(email);
    if (!emailResult.valid) errors.email = emailResult.message;

    const addressResult = validators.address(address);
    if (!addressResult.valid) errors.address = addressResult.message;

    if (Object.keys(errors).length > 0) {
        res.status(400).json({ message: 'Validation failed', errors });
        return;
    }

    next();
};

export const validateRating = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { rating } = req.body;
    const errors: Record<string, string> = {};

    const ratingResult = validators.rating(rating);
    if (!ratingResult.valid) errors.rating = ratingResult.message;

    if (Object.keys(errors).length > 0) {
        res.status(400).json({ message: 'Validation failed', errors });
        return;
    }

    next();
};

export const validatePassword = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { newPassword } = req.body;
    const errors: Record<string, string> = {};

    const passwordResult = validators.password(newPassword);
    if (!passwordResult.valid) errors.newPassword = passwordResult.message;

    if (Object.keys(errors).length > 0) {
        res.status(400).json({ message: 'Validation failed', errors });
        return;
    }

    next();
};
