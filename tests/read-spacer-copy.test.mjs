import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("issue reading spacer uses compact copy to avoid orphaned characters", () => {
  assert.match(page, /\u77e5\u8bc6\u968f\u5904\u5883\u5c55\u5f00\uff0c\u968f\u8bfb\u968f\u89e3/);
  assert.doesNotMatch(page, /\u77e5\u8bc6\u968f\u5904\u5883\u51fa\u73b0\uff0c\u4e0d\u4e00\u6b21\u6027\u503e\u6cfb/);
});
