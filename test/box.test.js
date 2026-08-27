import { test } from "node:test";
import assert from "node:assert/strict";
import { box, boxDefaultOpts } from "../src/nodes/box.js";

test("box() applies node and box defaults", () => {
	const node = box([]);
	assert.equal(node.type, "box");
	assert.deepEqual(node.children, []);
	assert.equal(node.options.direction, boxDefaultOpts.direction);
	assert.equal(node.options.flexGrow, 0);
});

test("box() merges provided options over the defaults", () => {
	const node = box([], { direction: "row", gap: 2 });
	assert.equal(node.options.direction, "row");
	assert.equal(node.options.gap, 2);
	assert.equal(node.options.alignItems, boxDefaultOpts.alignItems);
});

test("box() accepts per-side padding", () => {
	const node = box([], { padding: { top: 1, left: 2 } });
	assert.deepEqual(node.options.padding, { top: 1, left: 2 });
});

test("box() throws on an invalid direction", () => {
	assert.throws(() => box([], { direction: "diagonal" }), /direction/);
});

test("box() throws on invalid padding", () => {
	assert.throws(() => box([], { padding: { top: -1 } }), /padding\.top/);
	assert.throws(() => box([], { padding: "wide" }), /padding/);
});

test("box() throws on an invalid children value", () => {
	assert.throws(() => box("not an array"), /children/);
});

