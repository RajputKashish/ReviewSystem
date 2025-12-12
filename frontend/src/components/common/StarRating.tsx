import React, { useState } from 'react';
import './Common.css';

interface StarRatingProps {
    value: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
    value,
    onChange,
    readonly = false,
    size = 'md',
}) => {
    const [hoverValue, setHoverValue] = useState(0);

    const handleClick = (rating: number) => {
        if (!readonly && onChange) {
            onChange(rating);
        }
    };

    const handleMouseEnter = (rating: number) => {
        if (!readonly) {
            setHoverValue(rating);
        }
    };

    const handleMouseLeave = () => {
        setHoverValue(0);
    };

    const displayValue = hoverValue || value;

    return (
        <div className={`star-rating star-rating-${size} ${readonly ? 'readonly' : ''}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star ${displayValue >= star ? 'filled' : ''}`}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => handleMouseEnter(star)}
                    onMouseLeave={handleMouseLeave}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;
