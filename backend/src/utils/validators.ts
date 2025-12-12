// Validation utilities following the specified rules
export const validators = {
    // Name: Required (no character limit)
    name: (value: string): { valid: boolean; message: string } => {
        if (!value || value.trim().length === 0) {
            return { valid: false, message: 'Name is required' };
        }
        return { valid: true, message: '' };
    },

    // Email: Standard email validation
    email: (value: string): { valid: boolean; message: string } => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        return { valid: true, message: '' };
    },

    // Password: 8-16 characters, must include at least one uppercase letter and one special character
    password: (value: string): { valid: boolean; message: string } => {
        if (!value || value.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters' };
        }
        if (value.length > 16) {
            return { valid: false, message: 'Password must not exceed 16 characters' };
        }
        if (!/[A-Z]/.test(value)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
            return { valid: false, message: 'Password must contain at least one special character' };
        }
        return { valid: true, message: '' };
    },

    // Address: Max 400 characters
    address: (value: string): { valid: boolean; message: string } => {
        if (!value || value.trim().length === 0) {
            return { valid: false, message: 'Address is required' };
        }
        if (value.trim().length > 400) {
            return { valid: false, message: 'Address must not exceed 400 characters' };
        }
        return { valid: true, message: '' };
    },

    // Rating: 1-5 integer
    rating: (value: number): { valid: boolean; message: string } => {
        if (!Number.isInteger(value) || value < 1 || value > 5) {
            return { valid: false, message: 'Rating must be between 1 and 5' };
        }
        return { valid: true, message: '' };
    },
};

