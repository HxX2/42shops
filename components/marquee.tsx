import { PixelArt } from "./pixel-art";
import { cn } from "@/lib/utils";

export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-display text-xl italic">{item}</span>
          <PixelArt sprite="sparkle" scale={2} className="[&_rect]:fill-white" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("group overflow-hidden bg-ink py-2.5 text-white", className)}>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
