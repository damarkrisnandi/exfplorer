import PLLogo from "./pl-logo";

export default function MiniBrand() {
  return (
    <a href="#" className="flex items-center gap-2 self-center font-medium">
      <PLLogo />
      <span>
        ex<span className="text-[hsl(280,100%,70%)]">FPL</span>orer.app
      </span>
    </a>
  )
}
