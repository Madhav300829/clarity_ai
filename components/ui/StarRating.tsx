import React, { FC } from 'react';
import { StarIcon } from '../icons/Icons';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
}

export const StarRating: FC<StarRatingProps> = ({ rating, maxRating = 5 }) => {
    return (
        <div className="flex items-center">
            {[...Array(maxRating)].map((_, i) => (
                <StarIcon 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                />
            ))}
        </div>
    );
};