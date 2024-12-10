import images from '@/assets/assets'
import React from 'react'
import Address from './address'
import { useSelector } from 'react-redux'
import CartContents from '@/components/shopping-veiw/cartContents'
import { Button } from '@/components/ui/button'

const Checkout = () => {

  const {cartItems} = useSelector(state=>state.shopCart)
  const total = cartItems.items.reduce(
    (acc, item) =>
      acc +
      (item.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
    0
  );

  return (
   <div className="flex flex-col ">
<div className="relative h-[330px] w-full overflow-hidden ">
  <img src={images.header_img } alt="" className='h-full w-full object-cover object-center ' />
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 p-4 ">
  <Address/>
  <div className="flex flex-col gap-4 px-4 ">
  {
  cartItems && cartItems.items && cartItems.items.length > 0
    ? cartItems.items.map((item) => <CartContents key={item.id} cartItem={item} />)
    : null
}

<div className="mt-4 border-t pt-4 ">
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>
<div className="mt-4 w-full ">
<Button className=" w-full ">
Continue to checkout
</Button>

</div>
  </div>

  </div>


</div>
   </div>
  )
}

export default Checkout