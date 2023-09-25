/// <reference types="vitest" />

import { describe, test } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils";

describe("graph tests", async () => {
  //   await setup({
  //     // test context options
  //   });

  test("test", () => {
    const airports = "PHX BKK OKC JFK LAX MEX EZE HEL LOS LAP LIM".split(" ");
    const routes = [
      ["PHX", "LAX"],
      ["PHX", "JFK"],
      ["JFK", "OKC"],
      ["JFK", "HEL"],
      ["JFK", "LOS"],
      ["MEX", "LAX"],
      ["MEX", "BKK"],
      ["MEX", "LIM"],
      ["MEX", "EZE"],
      ["LIM", "BKK"],
    ];

    const adjacencyList = new Map();

    function addNode(value) {
      adjacencyList.set(value, []);
    }

    function addEdge(origin, destination) {
      adjacencyList.get(origin).push(destination);
      adjacencyList.get(destination).push(origin);
    }

    function bfs(start) {
      const visited = new Set();
      const queue = [start];

      while (queue.length > 0) {
        const airport = queue.shift();
        const destinations = adjacencyList.get(airport);

        for (const destination of destinations) {
          if (destination === "BKK") {
            console.log("found it");
          }
          if (!visited.has(destination)) {
            visited.add(destination);
            queue.push(destination);
            console.log(destination);
          }
        }
      }
    }

    function dfs(start, visited = new Set()) {
      console.log(start);
      visited.add(start);

      const destinations = adjacencyList.get(start);

      for (const destination of destinations) {
        if (destination == "BKK") {
          console.log("DFS found it");
          return;
        }
        if (!visited.has(destination)) {
          dfs(destination, visited);
        }
      }
    }

    airports.forEach(addNode);
    routes.forEach((route) => addEdge(...route));

    console.log(adjacencyList);
    bfs("PHX");
    console.log("-------");
    dfs("PHX");
  });
});
