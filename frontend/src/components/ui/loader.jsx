import { motion } from "framer-motion";
import images from "@/assets/assets";

const CustomLoader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col items-center justify-center">
      {/* Main container with relative positioning */}
      <div className="relative flex flex-col items-center">
        {/* Pulse effect */}
        <motion.div
          className="absolute h-40 w-40 rounded-full bg-indigo-100"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />

        {/* Rotating border container */}
        <div className="relative h-32 w-32 flex items-center justify-center">
          {/* Rotating border  */}
          <motion.div
            className="absolute h-full w-full border-4 border-indigo-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ top: 0, left: 0 }}
          />

          {/* Logo */}
          <img
            src={images.logo}
            alt="Logo"
            className="h-16 w-16 object-contain z-10"
          />
        </div>

        {/* Typewriter text  */}
        <div className="flex justify-center mt-6 h-6">
          {"Loading...".split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 8 * 0.1 + 0.5,
                repeatType: "reverse",
              }}
              className="text-gray-600 font-medium"
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomLoader;
