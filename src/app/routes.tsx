import { Redirect, Route } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";
import PracticeTab from "@/app/pages/practice-tab";
import PatternsTab from "@/app/pages/patterns-tab";
import ProgressTab from "@/app/pages/progress-tab";
import SavedPage from "@/app/pages/saved-page";
import QuestionPage from "@/app/pages/questionPage";
import ChapterPage from "@/app/pages/ChapterPage";
import ResourcePage from "@/app/pages/ResourcePage";
import BrowsePage from "@/app/pages/browse-page";

export default function Routes() {
  return (
    <IonRouterOutlet>
      <Route exact path="/tabs/practice">
        <PracticeTab />
      </Route>

      <Route exact path="/tabs/practice/:chapterId">
        <ChapterPage />
      </Route>

      <Route exact path="/tabs/practice/:chapterId/learn">
        <QuestionPage />
      </Route>

      <Route exact path="/tabs/practice/:chapterId/resource">
        <ResourcePage />
      </Route>

      <Route exact path="/tabs/patterns">
        <PatternsTab />
      </Route>

      <Route exact path="/tabs/progress">
        <ProgressTab />
      </Route>

      <Route exact path="/tabs/saved">
        <SavedPage />
      </Route>

      <Route exact path="/tabs/browse">
        <BrowsePage />
      </Route>

      <Redirect exact from="/" to="/tabs/browse" />
    </IonRouterOutlet>
  );
}
