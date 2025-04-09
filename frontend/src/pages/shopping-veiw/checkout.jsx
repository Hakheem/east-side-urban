import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Address from "./address";
import CartContents from "@/components/shopping-veiw/cartContents";
import { Button } from "@/components/ui/button";
import images from "@/assets/assets";
import { createOrder } from "@/store/shop/shopOrdersSlice";
import { toast } from "react-toastify";

const Checkout = () => {
  const { cartItems = { items: [] } } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentStarted, setpaymentStarted] = useState(false);
  const [isPaypalLoading, setIsPaypalLoading] = useState(false);
  const { approvalUrl } = useSelector((state) => state.shopOrder);
  const dispatch = useDispatch();

  const total =
    cartItems?.items?.reduce(
      (acc, item) =>
        acc +
        (item.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
      0
    ) || 0;

  const initiatePaypalPayment = async () => {
    if (selectedAddress === null) {
      toast("Please select an address");
      return;
    }

    if (cartItems.items.length === 0) {
      toast("Your cart is empty");
      return;
    }

    setIsPaypalLoading(true);

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item.salePrice > 0 ? item.salePrice : item.price,
        quantity: item?.quantity,
      })),
      addressInfo: selectedAddress,
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: total,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    try {
      const data = await dispatch(createOrder(orderData)).unwrap();
      console.log("Order created successfully:", data);
      setpaymentStarted(true);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Payment failed. Please try again.");
      setpaymentStarted(false);
    } finally {
      setIsPaypalLoading(false);
    }
  };

  useEffect(() => {
    if (approvalUrl) {
      window.location.href = approvalUrl;
    }
  }, [approvalUrl]);

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={images.header_img}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 p-4">
        <Address setSelectedAddress={setSelectedAddress} />
        <div className="flex flex-col gap-4 px-4">
          {cartItems?.items?.length > 0 ? (
            cartItems.items.map((item) => (
              <CartContents key={item.id} cartItem={item} />
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>

            {/* Updated Payment Options Section */}
            <div className="mt-6 space-y-4">
              <div className="">
                <h3 className="font-medium text-lg mb-3">Payment Method</h3>

                <div className="flex flex-col lg:flex-row gap-3">
                  {/* PayPal Option */}
                  <div className="border rounded-md p-2 flex items-center gap-3 border-gray-200">
                    <input
                      type="radio"
                      id="paypal"
                      name="payment"
                      checked
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="paypal" className="font-medium">
                        PayPal
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Secure online payments
                      </p>
                    </div>
                    <div className="w-6 h-6 text-blue-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* M-Pesa Option (Disabled) */}
                  <div className="border rounded-md p-2 flex items-center gap-3 border-gray-200 opacity-50 cursor-not-allowed">
                    <input
                      type="radio"
                      id="mpesa"
                      name="payment"
                      disabled
                      className="h-4 w-4 text-green-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="mpesa" className="font-medium">
                        M-Pesa
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Mobile money payment
                      </p>
                      <span className="text-xs text-orange-500">
                        (Coming Soon)
                      </span>
                    </div>
                    <div className="w-6 h-6 text-green-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Cash on Delivery Option (Disabled) */}
                  <div className="border rounded-md p-2 flex items-center gap-3 border-gray-200 opacity-50 cursor-not-allowed">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      disabled
                      className="h-4 w-4 text-purple-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="cod" className="font-medium">
                        Cash on Delivery
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Pay when you receive
                      </p>
                      <span className="text-xs text-orange-500">
                        (Coming Soon)
                      </span>
                    </div>
                    <div className="w-6 h-6 text-purple-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

              {isPaypalLoading && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing PayPal payment...
                </div>
              )}

              <div className="mt-4 w-full">
                <Button
                  className="w-full"
                  onClick={initiatePaypalPayment}
                  disabled={isPaypalLoading}
                >
                  {isPaypalLoading ? "Processing..." : "Checkout with PayPal"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
