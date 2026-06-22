import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { IconMenu2 } from "@tabler/icons-react";
interface GeneralHeaderProps {
  title?: string;
}

export default function GeneralHeader({ title }: Readonly<GeneralHeaderProps>) {
  const { toggleSidebar } = useSidebar();
  return (
    <Header>
      <div className="flex gap-2 items-center">
        <Button
          onClick={toggleSidebar}
          size={"icon-lg"}
          variant={"ghost"}
          className=""
        >
          <IconMenu2 className="size-7 " size={36} />
        </Button>
        <h1>{title}</h1>
      </div>
    </Header>
  );
}
