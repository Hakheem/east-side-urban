const Address = require("../../models/Address");

// Add Address
const addAddress = async (req, res) => {
  try {
    const { userId, address, city, zipcode, phone, notes } = req.body;

    if (!userId || !address || !city || !phone || !zipcode || !notes) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided",
      });
    }

    const newlyCreatedAddress = new Address({
      userId,
      address,
      city,
      zipcode,
      phone,
      notes,
    });

    await newlyCreatedAddress.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully.",
      data: newlyCreatedAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while adding address.",
    });
  }
};

// Fetch Addresses
const fetchAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const addressList = await Address.find({ userId });

    res.status(200).json({
      success: true,
      data: addressList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching addresses.",
    });
  }
};

// Edit Address
const editAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const formData = req.body;

    if (!addressId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user or address ID.",
      });
    }

    const editedAddress = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      formData,
      { new: true }
    );

    if (!editedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      data: editedAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while editing address.",
    });
  }
};

// Delete Address
const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (!addressId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user or address ID.",
      });
    }

    const deletedAddress = await Address.findOneAndDelete({
      _id: addressId,
      userId,
    });

    if (!deletedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting address.",
    });
  }
};

module.exports = {
  addAddress,
  fetchAddresses,
  editAddress,
  deleteAddress,
};
