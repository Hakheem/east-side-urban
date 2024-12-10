import React from "react";
import images from "@/assets/assets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Orders from "./orders";
import Address from "./address";

const Account = () => {
  return (
    <div className="flex flex-col ">
      <div className="relative h-[330px] w-full overflow-hidden ">
        <img
          src={images.account}
          alt=""
          className="h-full w-full object-cover object-center "
        />
      </div>
      <div className="container grid mx-auto grid-cols-1 gap-8 py-8 ">
        <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm ">
          <Tabs defaultValue="order" className=" ">
            <TabsList className="mb-2 " >
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              {" "}
              <Orders />{" "}
            </TabsContent>
            <TabsContent value="address">
              {" "}
              <Address />{" "}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Account;
