import {cn} from "@/lib/utils";
import React from "react";

export function Heading({className, ...props} : React.ComponentProps<"div">) {
        return (
            <h4 {...props}
                className={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)} />
        )
}