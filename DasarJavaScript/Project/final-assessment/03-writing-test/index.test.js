import { test } from "node:test";
import assert from "node:assert";
import { sum } from "./index.js";

test("should return the sum of two numbers", () => {
  assert.strictEqual(sum(2, 3), 5);
  assert.strictEqual(sum(-1, 1), 0);
  assert.strictEqual(sum(0, 0), 0);
  assert.strictEqual(sum(10, 20), 30);
});
