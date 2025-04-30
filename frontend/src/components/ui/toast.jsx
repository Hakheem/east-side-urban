import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex max-h-screen lg:w-[23rem] max-w-sm flex-col gap-3 p-2 sm:right-6 md:right-8",
      className
    )}
    {...props}   
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start overflow-hidden rounded-xl border p-0 shadow-sm transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-90 data-[state=closed]:fade-out-90 data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-4",
  {
    variants: {
      variant: {
        default: "bg-white border-neutral-200 text-neutral-900",
        destructive: "bg-white border-red-200 text-red-500",
        success: "bg-white border-green-200 text-green-500",
        info: "bg-white border-blue-200 text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({ className, variant, children, ...props }, ref) => {
  const iconMap = {
    success: (
      <div className="flex h-full w-12 items-center justify-center text-green-500">
        <CheckCircle2 className="h-10 w-10" />
      </div>
    ),
    destructive: (
      <div className="flex h-full w-12 items-center justify-center text-red-600">
        <AlertTriangle className="h-10 w-10" />
      </div>
    ),
    info: (
      <div className="flex h-full w-12 items-center justify-center text-blue-600">
        <Info className="h-10 w-10" />
      </div>
    ),
    default: (
      <div className="flex h-full w-12 items-center justify-center text-neutral-600">
        <Info className="h-10 w-10" />
      </div>
    ),
  };

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-center w-full h-full pl-1 ">
        {iconMap[variant] || iconMap.default}
        <div className="flex-1 p-4 pr-8 ">
          {children}
          <ToastPrimitives.Close
            className="absolute right-3 top-3 text-neutral-400 transition-opacity hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            toast-close=""
          >
            <X className="h-4 w-4" />
          </ToastPrimitives.Close>
        </div>
      </div>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center justify-center rounded-md border border-neutral-300 bg-neutral-50 px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-500",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 text-neutral-400 transition-opacity hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-md font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-neutral-600 mt-1", className)}
    {...props}
  />
));


ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};