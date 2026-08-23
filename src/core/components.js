import { proxy, subscribe } from 'valtio/vanilla';

// TODO: document + add JSDoc type for scopet

export function createScope(renderer, parent = null) {
	return {
		renderer,
		parent,
		state: proxy({}),
		mounted: false,
		children: new Map(),
		visitedThisPass: new Set(),
		cleanups: []
	}
}

export function disposeScope(scope) {
	for (const fn of scope.cleanups) fn();
	for (const child of scope.children.values()) disposeScope(child)
}

let currentScope = null;

export function renderComponent(scope, fn, props) {
	const prevScope = currentScope;
	currentScope = scope;

	scope.visitedThisPass = new Set();

	const result = fn(props, scope.store);

	if (!scope.mounted) {
		subscribe(scope.store, () => {
			scope.renderer.requestRender();
		})
		scope.mounted = true;
	}

	for (const [key, childScope] of scope.children) {
		if (!scope.visitedThisPass.has(key)) {
			disposeScope(childScope)
			scope.children.delete(key)
		}
	}

	currentScope = prevScope;
	return result;
}

export function child(key, fn, props) {
	const parentScope = currentScope;
	parentScope.visitedThisPass.add(key);

	if (!parentScope.children.has(key)) {
		parentScope.children.set(key, createScope(parentScope.renderer, parentScope))
	}

	const childScope = parentScope.children.get(key)
	return renderComponent(childScope, fn, props);
}

export function defaults(store, values) {
	for (const key in values) {
		if (store[key] === undefined) store[key] = values[key];
	}
}

export function useKey(handlers) {
	currentScope.renderer.registerKeyHandler(handlers, currentScope);
}

export function onMount(effect) {
	const scope = currentScope;
	if (scope.mounted) return;
	const cleanup = effect();

	if (typeof cleanup === 'function') {
		scope.cleanups.push(cleanup)
	}
}
