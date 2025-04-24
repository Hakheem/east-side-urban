import React, { useState, useEffect } from "react";
import images from "@/assets/assets";

const DissolvingBanner = ({
  imagesArray,
  overlayText,
  overlayStyle,
  intervalMin = 5,
  intervalMax = 10,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const changeImage = () => {
      setOpacity(0);

      setTimeout(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % imagesArray.length
        );
        setOpacity(1);
      }, 1000);
    };

    const getRandomInterval = () => {
      return Math.floor(
        Math.random() * (intervalMax * 60000 - intervalMin * 60000 + 1) +
          intervalMin * 60000
      );
    };

    const interval = setInterval(changeImage, getRandomInterval());

    return () => clearInterval(interval);
  }, [imagesArray.length, intervalMin, intervalMax]);

  return (
    <div className="relative h-[330px] w-full overflow-hidden">
      {/* Image with */}
      <img
        src={imagesArray[currentImageIndex]}
        alt="Banner"
        className="h-full w-full object-cover object-center transition-opacity duration-1000"
        style={{ opacity }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 flex items-center justify-center"
        style={{
          zIndex: 1,
          ...overlayStyle,
        }}
      >
        {/* Text content  */}
        <div className="text-center text-white px-4">{overlayText}</div>
      </div>
    </div>
  );
};

export default DissolvingBanner;
