"use client";
import dynamic from "next/dynamic";
import { ThemeProviderProps } from "next-themes";

const NextThemesProvider = dynamic(
  () => import("next-themes").then((mod) => mod.ThemeProvider),
  { ssr: false }
);

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;