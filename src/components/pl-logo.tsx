import { cn } from "@/lib/utils";
import Image from "next/image";

type PLLogoProps = {
  className?: string;
}
export  default function PLLogo({ className }: PLLogoProps) {
  return (
    <div className={cn(
      "bg-primary/10 text-primary-foreground flex size-6 items-center justify-center rounded-md"
      , className)}
    >
      <div className="relative w-6 h-6 md:w-8 md:h-8">
        <Image
          src={'/pl-main-logo.png'}
          fill={true}
          className="w-6 h-6 md:w-8 md:h-8"
          sizes="20"
          alt={`pl-logo`}
        />`
      </div>
    </div>
  );
}
