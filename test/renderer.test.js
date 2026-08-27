import { test } from "node:test";
import assert from "node:assert/strict";
import { Renderer } from "../src/renderer.js";

function makeRenderer() {
	const renderer = new Renderer({ mode: "inline" });
	renderer.paint = () => {};
	return renderer;
}

test("constructor validates mode, defaulting to 'screen'", () => {
	assert.throws(() => new Renderer({ mode: "bogus" }), /mode/);
	assert.doesNotThrow(() => new Renderer({ mode: "inline" }));
	assert.doesNotThrow(() => new Renderer());
	assert.equal(new Renderer().options.mode, "screen");
});

test("registerKeyHandler adds a listener and unregisters it via the scope's cleanups", () => {
	const renderer = makeRenderer();
	const scope = { cleanups: [] };
	renderer.registerKeyHandler({ enter: () => {} }, scope);

	assert.equal(renderer.keyListeners.length, 1);
	assert.equal(scope.cleanups.length, 1);

	scope.cleanups[0]();
	assert.equal(renderer.keyListeners.length, 0);
});

test("requestRender coalesces repeated calls into a single render pass", async () => {
	const renderer = makeRenderer();
	let paints = 0;
	renderer.paint = () => paints++;

	renderer.requestRender();
	renderer.requestRender();
	renderer.requestRender();
	assert.equal(renderer.dirty, true);

	await Promise.resolve();
	assert.equal(paints, 1);
	assert.equal(renderer.dirty, false);
});

test("push adds a root component to the stack and schedules a render", () => {
	const renderer = makeRenderer();
	const scope = renderer.push(() => "tree", { id: 1 });

	assert.equal(renderer.stack.length, 1);
	assert.equal(renderer.stack[0].scope, scope);
	assert.equal(renderer.dirty, true);
});

test("pop removes and disposes the topmost component", () => {
	const renderer = makeRenderer();
	renderer.push(() => "tree");
	let cleaned = false;
	renderer.stack[0].scope.cleanups.push(() => { cleaned = true; });

	renderer.pop();
	assert.equal(renderer.stack.length, 0);
	assert.equal(cleaned, true);
});

test("replace swaps out the topmost component", () => {
	const renderer = makeRenderer();
	renderer.push(() => "first");
	const firstScope = renderer.stack[0].scope;
	const newScope = renderer.replace(() => "second");

	assert.equal(renderer.stack.length, 1);
	assert.equal(renderer.stack[0].scope, newScope);
	assert.notEqual(newScope, firstScope);
});

test("mount pushes a fullscreen root component", () => {
	const renderer = makeRenderer();
	renderer.mount(() => "root");
	assert.equal(renderer.stack.length, 1);
	assert.equal(renderer.stack[0].fullscreen, true);
});

test("renderPass paints an empty tree when the stack is empty", () => {
	const renderer = makeRenderer();
	let painted;
	renderer.paint = trees => { painted = trees; };

	renderer.renderPass();
	assert.deepEqual(painted, []);
});

test("renderPass only renders from the topmost fullscreen entry down", () => {
	const renderer = makeRenderer();
	renderer.push(() => "hidden-root", {}, true);
	renderer.push(() => "visible-fullscreen", {}, true);
	renderer.push(() => "overlay", {}, false);
	let painted;
	renderer.paint = trees => { painted = trees; };

	renderer.renderPass();
	assert.deepEqual(painted, ["visible-fullscreen", "overlay"]);
});

