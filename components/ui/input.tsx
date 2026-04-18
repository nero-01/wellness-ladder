import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border px-3 py-2 text-base md:text-sm',
          /* Explicit contrast — avoids invisible text when CSS variables / autofill fight the theme */
          'border-neutral-300 bg-white text-neutral-900 caret-neutral-900',
          'placeholder:text-neutral-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:caret-zinc-50',
          'dark:placeholder:text-zinc-400',
          'selection:bg-primary/30 selection:text-inherit',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-900 dark:file:text-zinc-50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
