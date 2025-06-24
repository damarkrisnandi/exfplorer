

import { bgMain, cn } from "@/lib/utils"
import PLLogo from "@/components/pl-logo"
import { LogoutForm } from "@/components/logout-form"

export default function LoginPage() {
  return (
    <div className={
      cn(
        bgMain,
        "flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
      )
    }>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <PLLogo />
          <span>
            ex<span className="text-[hsl(280,100%,70%)]">FPL</span>orer.app
          </span>
        </a>
        <LogoutForm/>
      </div>
    </div>
  )
}
