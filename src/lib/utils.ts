import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const bgMain = "flex min-h-screen flex-col items-center justify-center  bg-gradient-to-b from-[#2e026d] to-[#0f0f1a] text-white";


export const BASE_API_URL: Readonly<string> = "https://fantasy-pl-vercel-proxy.vercel.app";
