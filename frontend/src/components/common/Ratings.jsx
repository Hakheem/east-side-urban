import React from "react";
import { Button } from "../ui/button";
import { StarIcon } from "lucide-react";

const Ratings = ({ rating, handleRatingChange, readOnly = false }) => {
  const handleClick = (star) => {
    if (!readOnly && handleRatingChange) {
      handleRatingChange(star);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Button
          key={star}
          variant="ghost"
          size="icon"
          className={`h-8 w-8 p-0 relative transition-all duration-200 ${
            readOnly ? "cursor-default" : "cursor-pointer"
          } group`}
          onClick={() => handleClick(star)}
          disabled={readOnly}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          aria-pressed={star <= rating}
        >
          {/* Background star (always visible) */}
          <StarIcon
            className={`absolute h-5 w-5 ${
              star <= rating ? "text-yellow-500" : "text-gray-300"
            } ${star <= rating ? "fill-yellow-500" : "fill-transparent"} 
            group-hover:scale-110 transition-transform`}
          />
          
          {/* Hover effect star (only visible on hover) */}
          {!readOnly && (
            <StarIcon
              className={`absolute h-5 w-5 opacity-0 ${
                star <= rating 
                  ? "text-yellow-600 group-hover:text-yellow-400" 
                  : "text-gray-400 group-hover:text-yellow-300"
              } group-hover:opacity-100 group-hover:scale-110 transition-all`}
              fill="transparent"
            />
          )}
        </Button>
      ))}
    </div>
  );
};

export default Ratings;