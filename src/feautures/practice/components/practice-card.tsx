import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PracticeCardProps {
  chapter: string;
}

export default function PracticeCard({ chapter }: Readonly<PracticeCardProps>) {
  return (
    <Card>
      <CardHeader className="font-bold text-lg">
        <CardTitle>{chapter}</CardTitle>
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
  );
}
