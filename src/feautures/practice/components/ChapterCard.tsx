import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Chapter } from "@/lib/schema";
import { Link } from "react-router-dom";

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({ chapter }: Readonly<ChapterCardProps>) {
  return (
    // <IonCard
    //   key={chapter.id}
    //   routerLink={`/tabs/practice/chapter/${chapter.id}`}
    // >
    <Link to={`/tabs/practice/${chapter.id}`}>
      <Card className="w-full">
        <CardHeader className="font-bold text-lg">
          <CardTitle>{chapter.display_name}</CardTitle>
          <CardContent>
            <div className="flex justify-between">
              <p className="font-light text-sm">65/98 Solved</p>
              <Button variant={"secondary"} className="text-blue-900">
                START
              </Button>
            </div>
          </CardContent>
          {/* <CardDescription>{chapter}</CardDescription> */}
        </CardHeader>
      </Card>
    </Link>
    // </IonCard>
  );
}
