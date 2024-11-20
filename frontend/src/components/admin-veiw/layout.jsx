import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./sidebar";
import AdminHeader from "./header";

 
const AdminLayout = () => {

  const [openSidebar, setOpenSidebar] = useState(false)

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <AdminSidebar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <AdminHeader setOpen={setOpenSidebar}  />
        <main className="flex flex-1 flex-col bg-muted/40 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
