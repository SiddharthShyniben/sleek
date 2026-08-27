import { test } from "node:test";
import assert from "node:assert/strict";
import { globalStore } from "../src/util/global-scope.js";

test("globalStore holds the initial state", () => {
	const renderer = { requestRender: () => {} };
	const store = globalStore(renderer, { count: 0 });
	assert.equal(store.count, 0);
});

test("globalStore requests a render whenever the store is mutated", async () => {
	let renders = 0;
	const renderer = { requestRender: () => renders++ };
	const store = globalStore(renderer, { count: 0 });

	store.count++;
	await Promise.resolve();
	assert.equal(renders, 1);

	store.count++;
	await Promise.resolve();
	assert.equal(renders, 2);
});
