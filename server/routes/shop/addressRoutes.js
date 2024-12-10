const express = require("express");

const {
  addAddress,
  fetchAddresses,
  editAddress,
  deleteAddress,
} = require("../../controllers/shop/AddressController");

const router = express.Router();

router.post("/add", addAddress);
router.get("/get/:userId", fetchAddresses);
router.delete("/delete/:userId/:addressId", deleteAddress);
router.put("/update/:userId/:addressId", editAddress);

module.exports = router;
