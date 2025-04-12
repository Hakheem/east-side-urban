import React from 'react';
import { Button } from '../ui/button';
import { GiHamburgerMenu } from "react-icons/gi";
import { MdLogout } from "react-icons/md";
import { useDispatch } from 'react-redux';
import { logoutUser, resetTokenAndCridentials } from '@/store/auth/auth';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({setOpen}) => {
  const navigate = useNavigate();
const dispatch = useDispatch()

  function handleLogout(){
// dispatch(logoutUser())
dispatch(resetTokenAndCridentials())
sessionStorage.clear()
navigate('/auth/login')
  }

  return (
    <div>
      
<header className="flex items-center justify-between px-4 py-3 bg-background border-b ">
<Button onClick={()=> setOpen(true)} className='lg:hidden sm:block'>
<GiHamburgerMenu  />
<span className='sr-only ' >Toggle Menu</span>
</Button>

<div className="flex flex-1 justify-end "></div>
<Button onClick={handleLogout} className=' inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow '>
<MdLogout />
  Logout</Button>

</header>

    </div>
  );
}

export default AdminHeader;
