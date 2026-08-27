import { test } from "node:test";
import assert from "node:assert/strict";
import { arrangeChildren, measureBox, paintBox } from "../src/nodes/box.js";
import { measureText, paintText } from "../src/nodes/text.js";
import { registry } from "../src/nodes/registry.js";

test("registry only knows about box and text", () => {
	assert.deepEqual(Object.keys(registry).sort(), ["box", "text"]);
});

test("registry.box wires up measure/arrange/paint from box.js", () => {
	assert.equal(registry.box.measure, measureBox);
	assert.equal(registry.box.arrange, arrangeChildren);
	assert.equal(registry.box.paint, paintBox);
});

test("registry.text wires up measure/paint from text.js, with no arrange", () => {
	assert.equal(registry.text.measure, measureText);
	assert.equal(registry.text.paint, paintText);
	assert.equal(registry.text.arrange, undefined);
});
