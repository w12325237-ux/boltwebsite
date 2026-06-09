import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tierlist.boltpvp.online"),

  title: "BoltPvP Tierlist",
  description:
    "BoltPvP Tierlist — the #1 place to check the best BoltPvP players, rankings, tiers, and official PvP results.",

  icons: {
    icon: "/boltlogo.png",
    shortcut: "/boltlogo.png",
    apple: "/boltlogo.png",
  },

  openGraph: {
    title: "BoltPvP Tierlist",
    description:
      "BoltPvP Tierlist — the #1 place to check the best BoltPvP players, rankings, tiers, and official PvP results.",
    url: "https://tierlist.boltpvp.online",
    siteName: "BoltPvP Tierlist",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "BoltPvP Tierlist",
    description:
      "BoltPvP Tierlist — the #1 place to check the best BoltPvP players, rankings, tiers, and official PvP results.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}