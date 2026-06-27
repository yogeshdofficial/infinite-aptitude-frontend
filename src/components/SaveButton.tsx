import { LuBookmark, LuBookmarkCheck } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useSavedQuestionIds,
  useToggleSavedQuestion,
} from "@/hooks/use-saved-questions";

interface SaveButtonProps {
  questionId: string;
  className?: string;
}

/** Icon-only "save for later" toggle. Mirrors CopyButton's footprint/style. */
export function SaveButton({ questionId, className }: Readonly<SaveButtonProps>) {
  const { data: savedIds } = useSavedQuestionIds();
  const { mutate, isPending } = useToggleSavedQuestion();

  const saved = savedIds?.has(questionId) ?? false;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={saved ? "Remove from saved" : "Save for later"}
      aria-pressed={saved}
      disabled={isPending}
      className={cn(
        "size-7 shrink-0 rounded-md transition-colors",
        saved && "text-primary",
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        mutate({ id: questionId, saved });
      }}
    >
      {saved ? (
        <LuBookmarkCheck className="size-3.5" />
      ) : (
        <LuBookmark className="size-3.5 text-muted-foreground" />
      )}
    </Button>
  );
}
