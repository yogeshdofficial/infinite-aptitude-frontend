import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savedQuestionRepository } from "@/db/repositories/savedQuestionRepository";

const IDS_KEY = ["savedQuestionIds"];
const LIST_KEY = ["savedQuestionsList"];

/** Set of saved question ids — cheap membership checks in any list/card. */
export function useSavedQuestionIds() {
  return useQuery({
    queryKey: IDS_KEY,
    queryFn: () => savedQuestionRepository.getAllIds(),
    staleTime: Infinity, // mutated via the cache directly on toggle, below
  });
}

/** Full saved-question rows, for the Saved page. */
export function useSavedQuestionsList() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: () => savedQuestionRepository.getSavedQuestions(),
    staleTime: Infinity,
  });
}

/**
 * Toggle save state for one question. Updates the ids cache optimistically
 * so every bookmark icon on screen flips instantly, with no extra DB read —
 * the full list query is only invalidated (re-fetched lazily, on next view)
 * rather than re-run eagerly.
 */
export function useToggleSavedQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      savedQuestionRepository.toggle(id, saved),
    onMutate: async ({ id, saved }) => {
      queryClient.setQueryData<Set<string>>(IDS_KEY, (prev) => {
        const next = new Set(prev ?? []);
        if (saved) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
