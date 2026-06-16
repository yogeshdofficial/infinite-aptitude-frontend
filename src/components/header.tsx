import { Button } from "@/components/ui/button";
import { IonHeader, IonToolbar } from "@ionic/react";
import { IconMenu2, IconMenu2Filled } from "@tabler/icons-react";
import clsx from "clsx";
import type React from "react";

interface HeaderProps {
  children: React.ReactNode;
  isShadowEnabled?: boolean;
}

export default function Header({
  children,
  isShadowEnabled = false,
}: HeaderProps) {
  return (
    <IonHeader className={clsx({ "ion-no-border": !isShadowEnabled })}>
      <IonToolbar>{children}</IonToolbar>
    </IonHeader>
  );
}
