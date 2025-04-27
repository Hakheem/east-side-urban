import React, { useEffect } from "react";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import images from "@/assets/assets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Orders from "./orders";
import Address from "./address";
import DissolvingBanner from "@/components/common/DissolvingBanner";
import { useSelector, useDispatch } from "react-redux";
import { getAllOrdersByUserId } from "@/store/shop/shopOrdersSlice"; 
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Account = () => {
  const bannerImages = [
    images.account,
    images.accesoriesHeader,
    images.cover_photo,
  ];
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { orderList, isLoading } = useSelector((state) => state.shopOrder);
  const { addresses } = useSelector((state) => state.addresses);
  const { user } = useSelector((state) => state.auth);

  const handleRefreshOrders = async () => {
    try {
      await dispatch(getAllOrdersByUserId(user?.id)).unwrap();
      toast({
        title: "Orders Updated",
        description: "Your order list has been refreshed",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: error.message || "Could not update orders",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  const orderStats = {
    total: orderList?.length || 0,
    active:
      orderList?.filter((order) =>
        ["processing", "confirmed", "shipped", "outForDelivery"].includes(
          order?.orderStatus
        )
      )?.length || 0,
    delivered:
      orderList?.filter((order) => order?.orderStatus === "delivered")
        ?.length || 0,
    cancelled:
      orderList?.filter((order) => order?.orderStatus === "cancelled")
        ?.length || 0,
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DissolvingBanner
        imagesArray={bannerImages}
        overlayText={
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Your Account
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto"></p>
          </div>
        }
        overlayStyle={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))",
        }}
      />

      <div className="container mx-auto px-4 py-8 -mt-12 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{orderStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Orders</p>
                <p className="text-2xl font-bold">{orderStats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold">{orderStats.delivered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold">{orderStats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="w-full bg-gray-50 px-2 py-2 border-b">
              <TabsTrigger
                value="orders"
                className="px-6 py-3 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary flex items-center gap-2"
              >
                <Package className="h-5 w-5" />
                Your Orders
                {orderStats.total > 0 && (
                  <span className="ml-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {orderStats.total}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="px-6 py-3 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary flex items-center gap-2"
              >
                <MapPin className="h-5 w-5" />
                Saved Addresses
                {addresses?.length > 0 && (
                  <span className="ml-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {addresses.length}
                  </span>
                )}
              </TabsTrigger>
              <Button
  variant="ghost"
  size="sm"
  onClick={handleRefreshOrders}
  disabled={isLoading}
  className="ml-auto flex items-center gap-2"
>
  {isLoading ? (
    <>
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span>Refreshing...</span>
    </>
  ) : (
    <>
      <RefreshCw className="h-4 w-4" />
      <span>Refresh</span>
    </>
  )}
</Button>
            </TabsList>

            <div className="p-6">
              <TabsContent
                value="orders"
                className="focus-visible:outline-none"
              >
                <Orders />
              </TabsContent>
              <TabsContent
                value="address"
                className="focus-visible:outline-none"
              >
                <Address />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Account;