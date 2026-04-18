'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      /* Avoid native form controls getting wrong forced colors vs our explicit input backgrounds */
      enableColorScheme={props.enableColorScheme ?? false}
    >
      {children}
    </NextThemesProvider>
  )
}
