import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import ResearchPage from "./workspace/research/page";
import StudyPage from "./workspace/study/page";
import DecisionsPage from "./workspace/decisions/page";
import TasksPage from "./workspace/tasks/page";
import HistoryPage from "./workspace/history/page";
import SettingsPage from "./workspace/settings/page";
import ProfilePage from "./workspace/profile/page";

describe("BILLBLI workspace destinations", () => {
  const routes = [
    ["Research", ResearchPage],
    ["Study", StudyPage],
    ["Decisions", DecisionsPage],
    ["Tasks", TasksPage],
    ["History", HistoryPage],
    ["Settings", SettingsPage],
    ["Profile", ProfilePage],
  ] as const;

  it.each(routes)(
    "%s renders a real workspace destination",
    async (label, Page) => {
      const html = renderToStaticMarkup(await Page());

      expect(html).toContain(label);
      expect(html).not.toContain("404");
    },
  );
});
