"use client"

import {ThemeProviderProps} from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
const ThemeProvider = ({children,...props}:ThemeProviderProps) => {
  return (
    <NextThemesProvider {...props}>
    {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;
