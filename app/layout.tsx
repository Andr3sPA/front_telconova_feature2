"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "https://telconovaf2api.onrender.com/api/auth/logout",
        {},
        {
          headers: {
            Accept: "*/*",
          },
          withCredentials: true, // importante si usas cookies
        }
      );
      if (response.status === 200 || response.status === 204) {
        console.log("Logout successful");
        router.push("/");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const showLogout = pathname !== "/" && pathname !== "/login";

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-full`}
      >
        <div className="flex justify-between items-center px-4 md:px-6 pt-4">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Globe className="size-4" />
            </div>
            <div className="text-black text-2xl font-semibold leading-loose">
              TelcoNova
            </div>
          </a>

          {showLogout && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Cerrar sesión
            </button>
          )}
        </div>

        <main className="flex-grow">{children}</main>

        <div className="p-4 md:p-6 text-left">Términos | Privacidad</div>
      </body>
    </html>
  );
}
