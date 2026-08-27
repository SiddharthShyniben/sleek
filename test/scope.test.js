import { test } from "node:test";
import assert from "node:assert/strict";
import { child, createScope, defaults, disposeScope, onMount, renderComponent, useKey } from "../src/scope.js";

function fakeRenderer() {
	const calls = [];
	return {
		calls,
		requestRender: () => calls.push("requestRender"),
		registerKeyHandler: (handlers, scope) => calls.push({ handlers, scope }),
	};
}

test("createScope has the expected shape", () => {
	const renderer = fakeRenderer();
	const scope = createScope(renderer);
	assert.equal(scope.renderer, renderer);
	assert.equal(scope.parent, null);
	assert.equal(scope.mounted, false);
	assert.deepEqual(scope.state, {});
	assert.equal(scope.children.size, 0);
	assert.equal(scope.cleanups.length, 0);
});

test("renderComponent calls the component with (props, state) and marks it mounted", () => {
	const renderer = fakeRenderer();
	const scope = createScope(renderer);
	const result = renderComponent(scope, (props, state) => {
		state.count = 1;
		return `hi ${props.name}`;
	}, { name: "sleek" });

	assert.equal(result, "hi sleek");
	assert.equal(scope.mounted, true);
	assert.equal(scope.state.count, 1);
});

test("renderComponent subscribes state so mutating it requests a render", async () => {
	const renderer = fakeRenderer();
	const scope = createScope(renderer);
	renderComponent(scope, () => {}, {});

	scope.state.anything = "changed";
	await Promise.resolve();
	assert.ok(renderer.calls.includes("requestRender"));
});

test("disposeScope runs cleanups depth-first", () => {
	const order = [];
	const scope = createScope(fakeRenderer());
	scope.cleanups.push(() => order.push("root"));
	const kid = createScope(fakeRenderer(), scope);
	kid.cleanups.push(() => order.push("child"));
	scope.children.set("kid", kid);

	disposeScope(scope);
	assert.deepEqual(order, ["root", "child"]);
});

test("child() reuses the same scope across renders, keyed by key", () => {
	const renderer = fakeRenderer();
	const root = createScope(renderer);
	let firstScope;

	renderComponent(root, () => {
		firstScope = child("a", (props, state) => { state.seen = (state.seen || 0) + 1; }, {});
	}, {});
	renderComponent(root, () => {
		child("a", () => {}, {});
	}, {});

	assert.equal(root.children.size, 1);
	assert.equal(root.children.get("a").state.seen, 1);
});

test("child() disposes scopes for keys no longer rendered", () => {
	const renderer = fakeRenderer();
	const root = createScope(renderer);
	let cleaned = false;

	renderComponent(root, () => {
		child("a", () => { onMount(() => () => { cleaned = true; }); }, {});
	}, {});
	assert.equal(root.children.size, 1);

	renderComponent(root, () => {
		// "a" isn't visited this pass
	}, {});

	assert.equal(root.children.size, 0);
	assert.equal(cleaned, true);
});

test("defaults() only fills in keys that are undefined", () => {
	const store = { a: 1 };
	defaults(store, { a: 99, b: 2 });
	assert.deepEqual(store, { a: 1, b: 2 });
});

test("onMount() runs the effect once and registers its cleanup", () => {
	const renderer = fakeRenderer();
	const root = createScope(renderer);
	let mounts = 0;
	let cleanups = 0;

	function Component() {
		onMount(() => {
			mounts++;
			return () => cleanups++;
		});
	}

	renderComponent(root, Component, {});
	renderComponent(root, Component, {});
	assert.equal(mounts, 1);

	disposeScope(root);
	assert.equal(cleanups, 1);
});

test("useKey() registers a handler against the current component's scope", () => {
	const renderer = fakeRenderer();
	const root = createScope(renderer);
	const handlers = { enter: () => {} };

	renderComponent(root, () => {
		useKey(handlers);
	}, {});

	assert.equal(renderer.calls.length, 1);
	assert.equal(renderer.calls[0].handlers, handlers);
	assert.equal(renderer.calls[0].scope, root);
});
