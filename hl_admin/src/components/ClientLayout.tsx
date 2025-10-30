"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/login" || pathname === "/signup";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="container mx-auto py-6">{children}</main>
    </>
  );
} 