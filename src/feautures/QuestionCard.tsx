import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { Card, CardContent } from "@/components/ui/card";
import type { Question } from "@/lib/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { questionRepository } from "@/db/repositories/questionRepository";
import { CopyButton } from "@/components/CopyButton";
import { Badge } from "@/components/ui/badge";
import { LuChevronUp, LuX, LuLightbulb } from "react-icons/lu";

interface QuestionCardProps {
  question: Question;
}

function MarkdownList({
  items,
  emptyMessage,
}: Readonly<{ items: string[] | undefined; emptyMessage: string }>) {
  if (!items || items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item, i) => (
        <li key={i} className="relative py-3">
          <div className="flex items-start gap-2 pr-8">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
              {i + 1}
            </span>
            <MarkdownViewer markdown={item} />
          </div>
          <CopyButton text={item} className="absolute right-0 top-3" />
        </li>
      ))}
    </ul>
  );
}

export default function QuestionCard({
  question,
}: Readonly<QuestionCardProps>) {
  const [showSolution, setShowSolution] = useState(false);

  const { data: extras, isLoading: extrasLoading } = useQuery({
    queryKey: ["questionExtras", question.id],
    queryFn: () => questionRepository.getExtrasById(question.id),
    staleTime: Infinity,
  });

  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        {/* Question */}
        <div className="relative p-4 pb-3">
          <div className="pr-8">
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 text-[10px] font-semibold"
              >
                Q{question.question_number}
              </Badge>
            </div>
            <MarkdownViewer
              markdown={question.question_text ?? "Question text missing"}
            />
          </div>
          <CopyButton
            text={question.question_text ?? ""}
            className="absolute right-3 top-3"
          />
        </div>

        {/* Reveal / Hide toggle — sits right below question text */}
        <div className="px-4 pb-3">
          {!showSolution ? (
            <Button
              variant="default"
              size="sm"
              className="h-8 w-full rounded-xl text-xs font-semibold gap-1.5"
              onClick={() => setShowSolution(true)}
            >
              <LuLightbulb className="size-3.5" />
              Show Solution
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full rounded-xl text-xs font-semibold gap-1.5 text-muted-foreground"
              onClick={() => setShowSolution(false)}
            >
              <LuChevronUp className="size-3.5" />
              Hide Solution
            </Button>
          )}
        </div>

        {/* Inline solution panel */}
        {showSolution && (
          <div className="border-t border-border/60 bg-muted/20">
            <Tabs defaultValue="solution">
              {/* Tab bar + inline X button for quick dismissal */}
              <div className="border-b border-border/60 px-3 pt-2.5 pb-0 flex items-center gap-1.5">
                <TabsList className="flex-1 grid grid-cols-4 rounded-xl bg-background/60 h-8">
                  <TabsTrigger value="solution" className="rounded-lg text-[11px] px-1">
                    Solution
                  </TabsTrigger>
                  <TabsTrigger value="shortcut" className="rounded-lg text-[11px] px-1">
                    Shortcut
                  </TabsTrigger>
                  <TabsTrigger value="hints" className="rounded-lg text-[11px] px-1">
                    Hints
                  </TabsTrigger>
                  <TabsTrigger value="formulas" className="rounded-lg text-[11px] px-1">
                    Formulas
                  </TabsTrigger>
                </TabsList>
                {/* Quick-dismiss X — always visible, easy to reach */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={() => setShowSolution(false)}
                  title="Hide solution"
                >
                  <LuX className="size-3.5" />
                </Button>
              </div>

              <div className="px-4 py-4">
                <TabsContent value="solution" className="mt-0">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Traditional Solution
                    </span>
                    {question.traditional_solution && (
                      <CopyButton text={question.traditional_solution} />
                    )}
                  </div>
                  <MarkdownViewer
                    markdown={
                      question.traditional_solution ?? "Solution not available."
                    }
                  />
                </TabsContent>

                <TabsContent value="shortcut" className="mt-0">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Shortcut / Fast Approach
                    </span>
                    {question.shortcut_solution && (
                      <CopyButton text={question.shortcut_solution} />
                    )}
                  </div>
                  <MarkdownViewer
                    markdown={
                      question.shortcut_solution ?? "No shortcut available."
                    }
                  />
                </TabsContent>

                <TabsContent value="hints" className="mt-0">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Hints
                  </p>
                  {extrasLoading ? (
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-5/6" />
                    </div>
                  ) : (
                    <MarkdownList
                      items={extras?.hints}
                      emptyMessage="No hints available."
                    />
                  )}
                </TabsContent>

                <TabsContent value="formulas" className="mt-0">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Key Formulas
                  </p>
                  {extrasLoading ? (
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-5/6" />
                    </div>
                  ) : (
                    <MarkdownList
                      items={extras?.formulas}
                      emptyMessage="No formulas listed."
                    />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
