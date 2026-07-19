"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10", className)}
      {...props}
    />
  );
}
export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium text-white/60 transition-colors data-[state=active]:bg-racing-red data-[state=active]:text-white",
        className
      )}
      {...props}
    />
  );
}
export function TabsContent(props: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content {...props} />;
}
