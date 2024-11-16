const { imageUpload } = require("../../config/cloudinary"); // Assuming imageUpload is a function in cloudinary config

const handleImageUpload = async (req, res) => {
  try {
    const file = req.file; // Extract the uploaded file

    // Ensure the file exists before processing
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    // Call your cloudinary upload function
    const result = await imageUpload(file.buffer); 

    // Respond with the image URL
    res.json({
      success: true,
      message: "Image uploaded successfully.",
      imageURL: result.secure_url,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: "Error while uploading the image.",
    });
  }
};

module.exports = { handleImageUpload };
