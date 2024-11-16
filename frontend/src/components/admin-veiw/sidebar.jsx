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

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {adminSidebarMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          onClick={() => {
            navigate(menuItem.path);
            if (setOpen) {
              setOpen(false);
            }
          }}
          className="flex text-xl items-center gap-2 rounded-md px-3 py-2 cursor-pointer
        text-muted-foreground hover:bg-muted- hover:text-foreground"
        >
          {menuItem.icon}
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
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center gap-2 justify-center my-6">
                <GrUserAdmin size={30} />
                <h1 className="text-2xl font-extrabold">Admin Panel</h1>
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} /> 
          </div>
        </SheetContent>
      </Sheet>
      <aside>
        <div className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
          <div
            onClick={() => navigate("/admin/dashboard")}
            className="flex gap-2 items-center cursor-pointer"
          >
            <GrUserAdmin size={30} />
            <h1 className="text-2xl font-extrabold">Admin Panel</h1>
          </div>
        </div>
        <div className="hidden lg:block pl-6">
          <MenuItems setOpen={setOpen} />
        </div>
      </aside>
    </Fragment>
  );
};

export default AdminSidebar;
