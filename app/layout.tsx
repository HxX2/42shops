import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geist";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/silkscreen/400.css";
import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "Campus Shops", template: "%s - Campus Shops" },
  description: "Browse the intra shop of every 42 campus, grouped by country.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#e9e9ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh p-2 sm:p-4">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
