import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { Card, CardContent } from "@/components/ui/card";
import type { Question } from "@/lib/schema";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { questionRepository } from "@/db/repositories/questionRepository";
import { CopyButton } from "@/components/CopyButton";
import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
  question: Question;
}

/** Renders a list of strings as markdown bullets, or a fallback message. */
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
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
              {i + 1}
            </span>
            <MarkdownViewer markdown={item} />
          </div>
          <CopyButton
            text={item}
            className="absolute right-0 top-3"
          />
        </li>
      ))}
    </ul>
  );
}

/** A section inside the drawer with a label + copy button in the header */
function SectionHeader({
  label,
  textToCopy,
}: {
  label: string;
  textToCopy?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {textToCopy && <CopyButton text={textToCopy} />}
    </div>
  );
}

export default function QuestionCard({
  question,
}: Readonly<QuestionCardProps>) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: extras, isLoading: extrasLoading } = useQuery({
    queryKey: ["questionExtras", question.id],
    queryFn: () => questionRepository.getExtrasById(question.id),
    enabled: drawerOpen,
    staleTime: Infinity,
  });

  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        {/* Question body */}
        <div className="relative p-4">
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

        {/* Footer bar */}
        <div className="flex items-center justify-end border-t border-border/60 bg-muted/30 px-4 py-2">
          <Drawer onOpenChange={setDrawerOpen} open={drawerOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="h-7 rounded-full px-4 text-xs font-semibold"
              >
                Solution
              </Button>
            </DrawerTrigger>

            <DrawerContent className="max-h-[90dvh]">
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <DrawerTitle className="text-sm font-semibold">
                  Question {question.question_number}
                </DrawerTitle>
              </div>

              {/* Scrollable body */}
              <div className="no-scrollbar overflow-y-auto">
                <Tabs defaultValue="solution" className="flex flex-col">
                  {/* Sticky tab bar */}
                  <div className="sticky top-0 z-10 bg-background px-4 pt-3 pb-1">
                    <TabsList className="grid w-full grid-cols-4 rounded-xl">
                      <TabsTrigger
                        value="solution"
                        className="rounded-lg text-xs"
                      >
                        Solution
                      </TabsTrigger>
                      <TabsTrigger
                        value="shortcut"
                        className="rounded-lg text-xs"
                      >
                        Shortcut
                      </TabsTrigger>
                      <TabsTrigger value="hints" className="rounded-lg text-xs">
                        Hints
                      </TabsTrigger>
                      <TabsTrigger
                        value="formulas"
                        className="rounded-lg text-xs"
                      >
                        Formulas
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Tab panels */}
                  <div className="px-4 pb-8 pt-4">
                    <TabsContent value="solution" className="mt-0 min-h-[32vh]">
                      <SectionHeader
                        label="Traditional Solution"
                        textToCopy={question.traditional_solution ?? undefined}
                      />
                      <MarkdownViewer
                        markdown={
                          question.traditional_solution ??
                          "Solution not available."
                        }
                      />
                    </TabsContent>

                    <TabsContent value="shortcut" className="mt-0 min-h-[32vh]">
                      <SectionHeader
                        label="Shortcut / Fast Approach"
                        textToCopy={question.shortcut_solution ?? undefined}
                      />
                      <MarkdownViewer
                        markdown={
                          question.shortcut_solution ??
                          "No shortcut available for this question."
                        }
                      />
                    </TabsContent>

                    <TabsContent value="hints" className="mt-0 min-h-[32vh]">
                      <SectionHeader label="Hints" />
                      {extrasLoading ? (
                        <div className="flex flex-col gap-3">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-5/6" />
                          <Skeleton className="h-5 w-2/3" />
                        </div>
                      ) : (
                        <MarkdownList
                          items={extras?.hints}
                          emptyMessage="No hints available."
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="formulas" className="mt-0 min-h-[32vh]">
                      <SectionHeader label="Key Formulas" />
                      {extrasLoading ? (
                        <div className="flex flex-col gap-3">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-5/6" />
                          <Skeleton className="h-5 w-2/3" />
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
            </DrawerContent>
          </Drawer>
        </div>
      </CardContent>
    </Card>
  );
}
