import { useState, useCallback } from "react";
import { Clipboard } from "@capacitor/clipboard";

/**
 * Returns [copied, copyFn].
 * copyFn accepts plain text (strips markdown symbols before writing).
 * `copied` is true for 2s after a successful copy.
 */
export function useCopy() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    // Strip common markdown so the clipboard contains readable plain text
    const plain = text
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .trim();

    try {
      await Clipboard.write({ string: plain });
    } catch {
      // Capacitor plugin unavailable (web browser) — fall back to the
      // Web Clipboard API so the feature still works in dev.
      await navigator.clipboard.writeText(plain);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return [copied, copy] as const;
}
