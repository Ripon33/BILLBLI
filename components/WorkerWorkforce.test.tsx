import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WorkerWorkforce from "./WorkerWorkforce";

describe("WorkerWorkforce", () => {
  it("renders worker creation and the persisted worker directory", () => {
    const html = renderToStaticMarkup(<WorkerWorkforce />);

    expect(html).toContain("Create AI Worker");
    expect(html).toContain("Your workers");
  });
});
