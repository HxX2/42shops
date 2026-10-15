import Link from "next/link";
import { PixelArt } from "./pixel-art";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5 rounded-md">
      <span className="transition-transform duration-300 ease-out-expo group-hover:-rotate-12 group-hover:scale-110">
        <PixelArt sprite="bag" scale={2} />
      </span>
      <span className="font-hand text-lg font-bold leading-none">Campus Shops</span>
    </Link>
  );
}
