import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const SpaceGrosTek = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
// config based metadata
export const metadata: Metadata = {
  title: "DevFlow App",
  description:
    "A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world. Explore topics in web development, mobile app development, algorithms, data structures, and more.",
  icons: {
    icon: "/images/site-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${SpaceGrosTek.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
