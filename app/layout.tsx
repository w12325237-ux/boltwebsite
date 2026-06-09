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
    images: [
      {
        url: "/boltlogo.png",
        width: 1200,
        height: 630,
        alt: "BoltPvP Tierlist",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "BoltPvP Tierlist",
    description:
      "BoltPvP Tierlist — the #1 place to check the best BoltPvP players, rankings, tiers, and official PvP results.",
    images: ["/boltlogo.png"],
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