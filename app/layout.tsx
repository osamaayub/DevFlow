import type { Metadata } from "next";
// eslint-disable-next-line import/order
import { Inter, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/context/Theme";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const SpaceGrosTek = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "DevFlow App",
  description:
    "A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world. Explore topics in web development, mobile app development, algorithms, data structures, and more.",
  icons: {
    icon: "/images/site-logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning={true}>
 
      <SessionProvider session={session}>
        <body
          className={`${inter.className} ${SpaceGrosTek.variable} antialiased`}
        >
          <header>

          <link rel="stylesheet" type='text/css' href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />

        </header>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
          
        </body>
        
      </SessionProvider>
    </html>
  );
}
