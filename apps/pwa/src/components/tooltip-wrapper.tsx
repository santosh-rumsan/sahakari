import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@rs/ui/tooltip";

interface TooltipWrapperProps {
  tip: string;
  children: ReactNode;
  disable?: boolean;
}

export default function TooltipWrapper({
  tip,
  children,
  disable = false,
}: TooltipWrapperProps) {
  if (disable || !tip.trim()) {
    return <>{children}</>;
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{children}</div>
        </TooltipTrigger>
        <TooltipContent className="bg-white" side="top">
          <p className="text-xs">{tip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
