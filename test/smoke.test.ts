import { describe, expect, it } from "vitest";

import { bootstrapSmokeTest } from "../src/index.js";

describe("package bootstrap", () => {
  it("loads the root named export", () => {
    expect(bootstrapSmokeTest()).toBe(true);
  });
});
