import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Address from './address';
import CartContents from '@/components/shopping-veiw/cartContents';
import { Button } from '@/components/ui/button';
import images from '@/assets/assets';
import { createOrder } from '@/store/shop/shopOrdersSlice';

const Checkout = () => {
  const { cartItems = { items: [] } } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const dispatch = useDispatch()


  const total = cartItems?.items?.reduce(
    (acc, item) =>
      acc + (item.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
    0
  ) || 0;

  const initiatePaypalPayment = () => {
    const orderData = {
      userId: user?.id,
      cartItems: cartItems.items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item.salePrice > 0 ? item.salePrice : item.price,
        quantity: item?.quantity,
      })),
      addressInfo: selectedAddress,
      paymentMethod: 'paypal',
      paymentStatus: 'pending',
      totalAmount: total,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: '',
      payerId: '',
    };

    dispatch(createOrder(orderData))
    .unwrap()
    .then((data) => {
      console.log("Order created successfully:", data);
    })
    .catch((error) => {
      console.error("Error creating order:", error);
    });

  };

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
            <div className="mt-4 w-full">
              <Button className="w-full" onClick={initiatePaypalPayment}>
                Checkout with Paypal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
