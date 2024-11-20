import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdHome, IoMdMenu } from "react-icons/io";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { Button } from "../ui/button";
import { useSelector, useDispatch } from "react-redux";
import { shopHeaderMenuItems } from "@/config/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FaShoppingCart } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { logoutUser } from "@/store/auth/auth";

function MenuItems({ closeSheet }) {
  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center lg:flex-row gap-6">
      {shopHeaderMenuItems.map((menuItem) => (
        <Link
          key={menuItem._id}
          to={menuItem.path}
          className="text-sm font-medium"
          onClick={closeSheet} // Close the sidebar on link click
        >
          {menuItem.label}
        </Link>
      ))}
    </nav>
  );
}

function RightContent() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <Button variant="outline" size="icon">
        <FaShoppingCart className="h-6 w-6" />
        <span className="sr-only">Cart</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-black">
            <AvatarFallback className="bg-black text-white font-extrabold">
              {user?.userName ? user.userName[0].toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56">
          <DropdownMenuLabel>
            Logged in as {user?.userName || "Guest"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/account")}>
            <FaUser className="mr-2 h-4 w-4" /> Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <MdLogout className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const ShopHeader = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to={"/home"} className="flex items-center gap-2">
          <IoMdHome className="h-6 w-6" />
          <span className="font-bold">East Side</span>
        </Link>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSheetOpen(true)}
            >
              <IoMdMenu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-xs" side="left">
            <MenuItems closeSheet={closeSheet} />
            <RightContent />
          </SheetContent>
        </Sheet>

        <div className="hidden lg:block">
          <MenuItems />
        </div>
        <div className="hidden lg:block">
          <RightContent />
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;
