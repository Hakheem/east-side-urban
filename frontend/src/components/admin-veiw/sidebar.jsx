import { Fragment } from "react";
import { GrUserAdmin } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaBagShopping } from "react-icons/fa6";
import { LuPackage } from "react-icons/lu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <MdDashboard />,
    path: "/admin/dashboard",
  },
  {
    id: "products",
    label: "Products",
    icon: <FaBagShopping />,
    path: "/admin/products",
  },
  {
    id: "orders",
    label: "Orders",
    icon: <LuPackage />,
    path: "/admin/orders",
  },
];

const MenuItems = ({ setOpen }) => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  return (
    <nav className="mt-8 flex-col flex gap-1">
      {adminSidebarMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          onClick={() => {
            navigate(menuItem.path);
            if (setOpen) {
              setOpen(false);
            }
          }}
          className={`flex text-base items-center gap-3 rounded-md px-4 py-3 cursor-pointer transition-colors
            ${
              currentPath.startsWith(menuItem.path)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
        >
          <span className="text-lg">{menuItem.icon}</span>
          <span>{menuItem.label}</span>
        </div>
      ))}
    </nav>
  );
};

const AdminSidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();

  return (
    <Fragment>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center gap-3 my-6">
                <GrUserAdmin size={24} />
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Structure remains exactly the same */}
      <aside className="hidden lg:block w-64 border-r bg-background p-6">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex gap-3 items-center cursor-pointer mb-8"
        >
          <GrUserAdmin size={24} />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
};

export default AdminSidebar;