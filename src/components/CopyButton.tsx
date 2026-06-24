import { LuCheck, LuCopy } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  /** Extra Tailwind classes forwarded to the Button */
  className?: string;
}

/**
 * A small icon-only button that copies `text` to the clipboard via
 * Capacitor's Clipboard plugin (with a Web API fallback).
 *
 * Shows a green check for 2 seconds after a successful copy.
 */
export function CopyButton({ text, className }: Readonly<CopyButtonProps>) {
  const [copied, copy] = useCopy();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      className={cn(
        "size-7 shrink-0 rounded-md transition-colors",
        copied && "text-emerald-500",
        className,
      )}
      onClick={() => copy(text)}
    >
      {copied ? (
        <LuCheck className="size-3.5" />
      ) : (
        <LuCopy className="size-3.5 text-muted-foreground" />
      )}
    </Button>
  );
}
