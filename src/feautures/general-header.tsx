import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { IconMenu2 } from "@tabler/icons-react";

export default function GeneralHeader() {
  const { toggleSidebar } = useSidebar();
  return (
    <Header>
      <Button
        onClick={toggleSidebar}
        size={"icon-lg"}
        variant={"ghost"}
        className=""
      >
        <IconMenu2 className="size-7 " size={36} />
      </Button>
    </Header>
  );
}
