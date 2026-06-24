import { useHistory, useLocation } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";
import { Button } from "@/components/ui/button";
import { LuArrowLeft } from "react-icons/lu";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { CopyButton } from "@/components/CopyButton";

interface LocationState {
  title: string;
  markdown: string;
}

export default function ResourcePage() {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const state = location.state;

  const title = state?.title ?? "Document";
  const markdown = state?.markdown ?? "";

  return (
    <IonPage>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background px-6">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => history.goBack()}
          aria-label="Go back"
        >
          <LuArrowLeft className="size-5" />
        </Button>

        <h1 className="flex-1 truncate font-heading text-sm font-semibold">
          {title}
        </h1>

        {markdown && <CopyButton text={markdown} />}
      </header>

      <IonContent fullscreen>
        <div className="mx-auto max-w-3xl px-6 py-8">
          {markdown ? (
            <article className="prose prose-sm max-w-none">
              <MarkdownViewer markdown={markdown} />
            </article>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No content available.
            </p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
