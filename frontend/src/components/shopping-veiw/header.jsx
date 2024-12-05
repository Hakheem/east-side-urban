import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdHome, IoMdMenu } from "react-icons/io";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSelector, useDispatch } from "react-redux";
import { shopHeaderMenuItems } from "@/config/config";
import { logoutUser } from "@/store/auth/auth";
import { fetchCartItems } from "@/store/shop/cartSlice";
import CartWrapper from "./cartWrapper";
import { Label } from "../ui/label";

// Handles navigation and filter storage
function handleNavigation(menuItem, navigate) {
  sessionStorage.removeItem("filters");
  const currentFilter =
    menuItem.id !== "home" ? { category: [menuItem.id] } : null;

  sessionStorage.setItem("filters", JSON.stringify(currentFilter));
  navigate(menuItem.path);
}

function MenuItems({ closeSheet, navigate }) {
  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center lg:flex-row gap-6">
      {shopHeaderMenuItems.map((menuItem) => (
        <Label
          key={menuItem._id}
          className="text-sm font-medium cursor-pointer"
          onClick={() => {
            handleNavigation(menuItem, navigate);
            closeSheet && closeSheet();
          }}
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

function RightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  // Fetch cart items when the user logs in
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user?.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      {/* Cart Button */}
      <Sheet
        open={openCartSheet}
        onOpenChange={(state) => setOpenCartSheet(state)}
      >
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          aria-label="View Cart"
        >
          <FaShoppingCart className="h-6 w-6" />
          <span className="sr-only">Cart</span>
        </Button>
        <SheetContent className="w-full max-w-sm">
          <CartWrapper
            cartItems={
              cartItems && cartItems.items && cartItems.items.length > 0
                ? cartItems.items
                : []
            }
          />
        </SheetContent>
      </Sheet>

      {/* User Avatar and Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-black cursor-pointer">
            <AvatarFallback className="bg-black text-white font-extrabold">
              {user?.userName ? user.userName[0].toUpperCase() : "G"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56">
          <DropdownMenuLabel>
            Logged in as {user?.userName || "Guest"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/account")} className='cursor-pointer' >
            <FaUser className="mr-2 h-4 w-4 " /> Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className='cursor-pointer' >
            <MdLogout className="mr-2 h-4 w-4 " /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const ShopHeader = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to={"/home"} className="flex items-center gap-2">
          <IoMdHome className="h-6 w-6" />
          <span className="font-bold">East Side</span>
        </Link>

        {/* Mobile Menu Button */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Toggle header menu"
              onClick={() => setIsSheetOpen(true)}
            >
              <IoMdMenu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-xs" side="left">
            <MenuItems closeSheet={closeSheet} navigate={navigate} />
            <RightContent />
          </SheetContent>
        </Sheet>

        {/* Desktop Menu */}
        <div className="hidden lg:block">
          <MenuItems navigate={navigate} />
        </div>
        <div className="hidden lg:block">
          <RightContent />
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;
