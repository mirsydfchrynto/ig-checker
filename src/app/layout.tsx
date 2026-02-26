import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghost Checker — Deteksi Unfollower Instagram Secara Privat",
  description: "Cara paling aman dan privat untuk mengetahui siapa yang tidak mengikuti kamu balik di Instagram tanpa login. 100% diproses di browser kamu.",
  keywords: ["instagram", "unfollower checker", "ghost checker", "privacy", "gen z tool"],
  authors: [{ name: "The Architect" }],
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
