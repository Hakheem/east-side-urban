import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdMenu } from "react-icons/io";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { MdLogout } from "react-icons/md";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
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
import { logoutUser, resetAuthState } from "@/store/auth/auth";
import { fetchCartItems } from "@/store/shop/cartSlice";
import CartWrapper from "./cartWrapper";
import { Label } from "../ui/label";
import images from "@/assets/assets";

// Handle Navigation
function handleNavigation(menuItem, navigate) {
  const currentFilter =
    menuItem.id !== "home" &&
    menuItem.id !== "products" &&
    menuItem.id !== "search"
      ? { category: [menuItem.id] }
      : null;

  if (currentFilter) {
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    const query = new URLSearchParams();
    query.set("category", menuItem.id);
    navigate(`/listing?${query.toString()}`);
  } else {
    sessionStorage.removeItem("filters");
    navigate(menuItem.path);
  }
}

// MobileAuthSection component for sidebar
function MobileAuthSection({ closeSheet, navigate }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);

  function handleLogout() {
    dispatch(logoutUser());
    dispatch(resetAuthState());
    navigate("/home");
    closeSheet && closeSheet();
  }

  return (
    <div className="mt-auto pt-6 border-t">
      {user ? (
        <>
          <div
            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              navigate("/account");
              closeSheet && closeSheet();
            }}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-black font-semibold text-white">
                {user?.userName?.[0]?.toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">My Account</p>
              <p className="text-xs text-gray-500">Logged in as {user?.userName}</p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer mt-2"
            onClick={() => setShowLogoutOverlay(true)}
          >
            <MdLogout className="h-5 w-5 text-gray-700" />
            <p className="text-sm font-medium">Logout</p>
          </div>

          {/* Logout Confirmation */}
          {showLogoutOverlay && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg w-1/4 h-[23%]">
                <h3 className="text-lg font-semibold">
                  Are you sure you want to log out?
                </h3>
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
        </>
      ) : (
        <Button
          onClick={() => {
            navigate("/auth/login");
            closeSheet && closeSheet();
          }}
          className="w-full"
        >
          Sign In
        </Button>
      )}
    </div>
  );
}

// MenuItems component
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
          {menuItem.id === "search" ? (
            <CiSearch className="h-3 w-3" />
          ) : (
            menuItem.label
          )}
        </Label>
      ))}
    </nav>
  );
}

// MobileIcons component
function MobileIcons({ setOpenCartSheet }) {
  const { cartItems } = useSelector((state) => state.shopCart);
  const navigate = useNavigate();
  const totalItems =
    cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <Button
        onClick={() => navigate("/search")}
        variant="outline"
        size="icon"
        aria-label="Search"
      >
        <CiSearch className="h-6 w-6" />
      </Button>

      {/* Cart Button */}
      <Button
        onClick={() => setOpenCartSheet(true)}
        variant="outline"
        size="icon"
        aria-label="View Cart"
        className="relative"
      >
        <FaShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Button>
    </div>
  );
}

// RightContent component (for desktop)
function RightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user?.id));
    }
  }, [dispatch, user?.id]);

  const totalItems =
    cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  function handleLogout() {
    dispatch(logoutUser());
    dispatch(resetAuthState());
    navigate("/home");
  }

  return (
    <div className="hidden lg:flex items-center gap-4">
      {/* Search Button */}
      <Button
        onClick={() => navigate("/search")}
        variant="outline"
        size="icon"
        aria-label="Search"
      >
        <CiSearch className="h-6 w-6" />
      </Button>

      {/* Cart Button */}
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          aria-label="View Cart"
          className="relative"
        >
          <FaShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
        <SheetContent className="w-full max-w-sm">
          <CartWrapper setOpenCartSheet={setOpenCartSheet} />
        </SheetContent>
      </Sheet>

      {/* User Dropdown */}
      {user ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarFallback className="bg-black text-white">
                  {user?.userName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="w-56">
              <DropdownMenuLabel>
                Logged in as {user?.userName || "Guest"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/account")}
                className="cursor-pointer"
              >
                <FaUser className="mr-2 h-4 w-4" /> Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowLogoutOverlay(true)}
                className="cursor-pointer"
              >
                <MdLogout className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout Confirmation */}
          {showLogoutOverlay && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg w-1/4 h-[23%]">
                <h3 className="text-lg font-semibold">
                  Are you sure you want to log out?
                </h3>
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
        </>
      ) : (
        <Button
          onClick={() => navigate("/auth/login")}
          aria-label="Sign In"
          className="cursor-pointer"
        >
          Sign In
        </Button>
      )}
    </div>
  );
}

// Main ShopHeader component
const ShopHeader = () => {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 mr-4">
          <img src={images.logo} className="max-h-[4rem]" alt="Logo" />
        </Link>

        {/* Center Navigation (desktop only) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <MenuItems navigate={navigate} />
        </div>

        {/* Right Side Content */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Mobile Icons (search, cart, auth) */}
          <MobileIcons setOpenCartSheet={setOpenCartSheet} />

          {/* Mobile Menu Button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <IoMdMenu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full max-w-xs flex flex-col">
              <MenuItems
                closeSheet={() => setIsSheetOpen(false)}
                navigate={navigate}
              />
              <MobileAuthSection
                closeSheet={() => setIsSheetOpen(false)}
                navigate={navigate}
              />
            </SheetContent>
          </Sheet>

          {/* Desktop Right Content */}
          <RightContent />
        </div>
      </div>

      {/* Mobile Cart Sheet */}
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <SheetContent className="w-full max-w-sm">
          <CartWrapper setOpenCartSheet={setOpenCartSheet} />
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default ShopHeader;