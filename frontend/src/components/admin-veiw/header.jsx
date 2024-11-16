import React from 'react';
import { Button } from '../ui/button';
import { GiHamburgerMenu } from "react-icons/gi";
import { MdLogout } from "react-icons/md";

const AdminHeader = ({setOpen}) => {
  return (
    <div>
      
<header className="flex items-center justify-between px-4 py-3 bg-background border-b ">
<Button onClick={()=> setOpen(true)} className='lg:hidden sm:block'>
<GiHamburgerMenu  />
<span className='sr-only ' >Toggle Menu</span>
</Button>

<div className="flex flex-1 justify-end "></div>
<Button className='inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow '>
<MdLogout />
  Logout</Button>

</header>

    </div>
  );
}

export default AdminHeader;
