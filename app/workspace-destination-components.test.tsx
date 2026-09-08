import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import TasksPage from "./workspace/tasks/page";
import SettingsPage from "./workspace/settings/page";

describe("BILLBLI workspace destination integrations", () => {
  it("renders the existing Work Engine creation experience on Tasks", () => {
    const html = renderToStaticMarkup(<TasksPage />);

    expect(html).toContain("Tasks");
    expect(html).toContain("Work Engine");
    expect(html).toContain("Create Work");
    expect(html).toContain("Work title");
    expect(html).toContain("Work goal");
  });

  it("renders the existing account settings experience on Settings", () => {
    const html = renderToStaticMarkup(<SettingsPage />);

    expect(html).toContain("Settings");
    expect(html).toContain("Account settings");
    expect(html).toContain("Sign out");
    expect(html).toContain("Delete account");
  });
});
