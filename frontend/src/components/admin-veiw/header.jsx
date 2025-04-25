import React, { useState } from 'react';
import { Button } from '../ui/button';
import { GiHamburgerMenu } from "react-icons/gi";
import { MdLogout } from "react-icons/md";
import { useDispatch } from 'react-redux';
import {  logoutUser } from '@/store/auth/auth'; 
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast"


const AdminHeader = ({ setOpen }) => {
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // dispatch(resetAuthState());
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
        <Button onClick={() => setOpen(true)} className='lg:hidden sm:block'>
          <GiHamburgerMenu />
          <span className='sr-only'>Toggle Menu</span>
        </Button>

        <div className="flex flex-1 justify-end"></div>
        <Button
          onClick={() => setShowLogoutOverlay(true)}
          className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow"
        >
          <MdLogout />
          Logout
        </Button>
      </header>

      {/* Logout Confirmation Overlay */}
      {showLogoutOverlay && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/4 h-[23%]">
            <h3 className="text-lg font-semibold">Are you sure you want to log out?</h3>
            <div className="flex justify-between mt-4">
              <Button
                className="px-8 h-12 bg-gray-300"
                variant="outline"
                onClick={() => setShowLogoutOverlay(false)}
              >
                Cancel
              </Button>
              <Button
                className="px-8 h-12"
                onClick={() => {
                  handleLogout();
                  setShowLogoutOverlay(false);
                }}
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHeader;