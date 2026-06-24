/**
 * ResourcePage
 *
 * A full-screen page for displaying a single markdown resource
 * (overview, cheatsheet, or pattern revision note).
 *
 * Route params come from the URL:
 *   /tabs/practice/:chapterId/resource/:resourceType
 *   /tabs/practice/:chapterId/pattern/:patternId/doc
 *
 * The parent (ChapterPage) passes the markdown content via history state
 * so we never need an extra network fetch here.
 */

import { useHistory, useLocation, useParams } from "react-router-dom";
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
      {/* ── Header ── */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background px-3">
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

      {/* ── Content ── */}
      <IonContent fullscreen>
        <article className="prose-sm px-4 py-5">
          {markdown ? (
            <MarkdownViewer markdown={markdown} />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No content available.
            </p>
          )}
        </article>
      </IonContent>
    </IonPage>
  );
}
