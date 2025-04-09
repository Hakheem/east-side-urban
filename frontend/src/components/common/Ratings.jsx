import React from "react";
import { Button } from "../ui/button";
import { StarIcon } from "lucide-react";

const Ratings = ({ rating, handleRatingChange }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Button
          key={star}
          variant="outline"
          size="icon"
          className={`ml-1 p-2 transition-colors ${
            star <= rating
              ? "text-yellow-500 hover:bg-black "
              : "text-gray-300 hover:bg-primary hover:text-primary-foreground"
          }`}
          onClick={() => handleRatingChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <StarIcon
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-500" : "fill-gray-500"
            }`}
          />
        </Button>
      ))}
    </div>
  );
};

export default Ratings;
