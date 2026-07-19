"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/context/Theme";

interface RootProvidersProps {
  session: Session | null;
  children: React.ReactNode;
}

export default function RootProviders({ session, children }: RootProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
