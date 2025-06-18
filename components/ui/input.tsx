import * as React from "react"
import { cn } from "@/lib/utils"
import type { JSX } from "react"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: JSX.Element
    inputClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, inputClassName, icon, type = "text", ...props }, ref) => {
        return (
            <div className={cn("relative flex w-full items-center", className)}>
                {/* icon */}
                {icon && (
                    <span className="pointer-events-none absolute left-3 flex h-full items-center text-muted-foreground">
                {icon}
          </span>
                )}

                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        "border-input w-full rounded-md border bg-transparent shadow-xs outline-none",
                        "placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm",
                        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                        "h-10 px-3 py-2 text-base",
                        "md:h-9 md:text-sm",
                        icon && "pl-10",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
                        inputClassName
                    )}
                    {...props}
                />
            </div>
        )
    }
)

Input.displayName = "Input"
