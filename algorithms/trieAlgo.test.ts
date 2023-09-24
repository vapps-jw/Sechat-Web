/// <reference types="vitest" />

import { describe, test } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils";
import { Trie } from "./trieAlgo";

describe("algo tests", async () => {
  //   await setup({
  //     // test context options
  //   });

  test("trie test", () => {
    const t = new Trie();
    t.insert("amazon");
    t.insert("amazon prime");
    t.insert("amazing");
    t.insert("amazing spider man");
    t.insert("amazed");
    t.insert("ebay");
    t.insert("apple");

    const res = t.autocomplete("amaz");
    expect(res.length).toBe(5);
  });
});
