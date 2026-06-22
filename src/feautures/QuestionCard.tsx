import { MarkdownViewer } from "@/components/MarkdownViewer";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionHintSchema, type Question } from "@/lib/schema";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { questionRepository } from "@/db/repositories/questionRepository";
interface QuestionCardProps {
  question: Question;
}
export default function QuestionCard({
  question,
}: Readonly<QuestionCardProps>) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["questionDetails", question.id],
    queryFn: () => questionRepository.getById(question.id),
    enabled: drawerOpen,
  });
  if (isLoading) return <p>Loading</p>;

  return (
    <Card className="">
      <CardContent>
        <MarkdownViewer markdown={question.question_text ?? "missing"} />
        <Drawer onOpenChange={setDrawerOpen} open={drawerOpen}>
          <DrawerTrigger asChild>
            <Button className="" variant={"outline"}>
              Solution
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="no-scrollbar overflow-y-auto px-4 pb-4">
              <Tabs
                defaultValue="account"
                className="flex min-h-[40vh] flex-col gap-4"
              >
                <TabsList>
                  <TabsTrigger value="account">Solution</TabsTrigger>
                  <TabsTrigger value="password">Shortcut</TabsTrigger>
                  <TabsTrigger value="hints">Shortcut</TabsTrigger>
                  <TabsTrigger value="formulas">Shortcut</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="min-h-[32vh]">
                  <MarkdownViewer
                    markdown={
                      question.traditional_solution ?? "solution missing"
                    }
                  />
                </TabsContent>
                <TabsContent value="password" className="min-h-[32vh]">
                  <MarkdownViewer
                    markdown={question.shortcut_solution ?? "shortcut missing"}
                  />
                </TabsContent>

                <TabsContent value="formulas" className="min-h-[32vh]">
                  <MarkdownViewer
                    markdown={data?.formulas ?? "formulas missing"}
                  />
                </TabsContent>
                <TabsContent value="hints" className="min-h-[32vh]">
                  <MarkdownViewer markdown={data?.hints ?? "hints missing"} />
                </TabsContent>
                <TabsContent value="commonMistakes" className="min-h-[32vh]">
                  <MarkdownViewer
                    markdown={data?.mistakes ?? "common mistakes missing"}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>
  );
}
