
import React from 'react';
import { StarIconFilled, StarIconOutline } from '../constants';

interface StarRatingProps {
  rating: number; // Rating out of 5
  maxRating?: number;
  size?: 'sm' | 'md';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5, size = 'md' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0; // RAWG provides integer ratings_top, so half stars not directly from 'rating'
                                      // But we could calculate if needed based on rating vs rating_top
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  const starClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className={starClass}>{StarIconFilled}</span>
      ))}
      {/* For RAWG, rating is usually an integer up to rating_top (often 5) */}
      {/* If you wanted to show partial stars based on decimal rating:
      {hasHalfStar && (
        // Placeholder for a half-star icon if you have one
        <span className={starClass}>{StarIconFilled}</span> // Using full for now
      )} 
      */}
      {[...Array(Math.max(0, maxRating - fullStars))].map((_, i) => (
         <span key={`empty-${i}`} className={starClass}>{StarIconOutline}</span>
      ))}
    </div>
  );
};

export default StarRating;
    