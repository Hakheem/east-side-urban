const Features = require("../../models/Features");

const addFeatureImage = async (req, res) => {
  try { 
    const { image } = req.body;
    const newFeature = new Features({ image });
    await newFeature.save();
 
    res
      .status(201)
      .json({ message: "Feature image added successfully", newFeature });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Features.find({});

    res
      .status(200)
      .json({ message: "Feature images fetched successfully", images });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addFeatureImage, getFeatureImages };
