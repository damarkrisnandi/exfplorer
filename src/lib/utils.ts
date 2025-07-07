import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const bgMain = "flex min-h-screen flex-col items-center justify-center  bg-gradient-to-b from-[#2e026d] to-[#0f0f1a] text-white";

export const themeGradient = "bg-gradient-to-b from-[#2e026d] to-[#0f0f1a]"

export const BASE_API_URL: Readonly<string> = "https://fantasy-pl-vercel-proxy.vercel.app";
export const ARCHIVED_API_URL: Readonly<string> = "https://fpl-static-data.vercel.app";
export const currentSeason: Readonly<string> = '2024-2025';
export const previousSeason: Readonly<string> = '2023-2024';

export function getElementPhotoUrl(photo: string): string {
  const imageId = photo?.split(".")[0] ?? "";
  return `https://resources.premierleague.com/premierleague/photos/players/250x250/p${imageId}.png`;
}
