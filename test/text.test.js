import { test } from "node:test";
import assert from "node:assert/strict";
import { text, textDefaultOpts } from "../src/nodes/text.js";

test("text() applies node and text defaults", () => {
	const node = text("hello");
	assert.equal(node.type, "text");
	assert.equal(node.text, "hello");
	assert.equal(node.options.wrap, textDefaultOpts.wrap);
	assert.deepEqual(node.options.wrapOpts, {});
	assert.equal(node.options.flexShrink, 1);
});

test("text() merges wrapOpts instead of replacing them wholesale", () => {
	const node = text("hello", { wrap: true, wrapOpts: { width: 10 } });
	assert.equal(node.options.wrap, true);
	assert.deepEqual(node.options.wrapOpts, { width: 10 });
});

test("text() throws when text isn't a string", () => {
	assert.throws(() => text(42), /text/);
});

test("text() throws on invalid options", () => {
	assert.throws(() => text("hello", { wrap: "yes" }), /wrap/);
});

