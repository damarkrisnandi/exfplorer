import "@/styles/globals.css";

import { type Metadata } from "next";
// import { Geist } from "next/font/google";
import { Outfit } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "exFPLorer",
  description: "FPL Prediction and Analysis",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-geist-sans",
// });

const outfit = Outfit({
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.className}`}>
      <body>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
        <Toaster toastOptions={
          {
            className: "bg-gray-700 text-white",
            style: {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
            },
          }
        }/>
      </body>
    </html>
  );
}
