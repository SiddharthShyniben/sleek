import { proxy, subscribe } from 'valtio/vanilla';

// TODO: document + add JSDoc type for scopet

/**
 * Create a scope for a component instance 
 * @param renderer - The renderer instance this component is attached to
 * @param [parent=null] - The parent component
 */
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

/**
 * Dispose of a scope and run all it's cleanup functions
 * @param scope - The scope to dispose
 */
export function disposeScope(scope) {
	for (const fn of scope.cleanups) fn();
	for (const child of scope.children.values()) disposeScope(child)
}

let currentScope = null;

/**
 * Render a component
 * @param scope - The scope of the component
 * @param {Function} fn - The component function
 * @param {*} props - The props to pass to the component
 */
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

/**
 * Create a child component
 * @param key - The unique key used to track children
 * @param {Function} fn - The component function
 * @param {*} props - The props to pass to the component
 */
export function child(key, fn, props) {
	const parentScope = currentScope;
	parentScope.visitedThisPass.add(key);

	if (!parentScope.children.has(key)) {
		parentScope.children.set(key, createScope(parentScope.renderer, parentScope))
	}

	const childScope = parentScope.children.get(key)
	return renderComponent(childScope, fn, props);
}

/**
 * Helper to add default values to store
 * @param {*} store - Store object 
 * @param {*} values - Default values
 */
export function defaults(store, values) {
	for (const key in values) {
		if (store[key] === undefined) store[key] = values[key];
	}
}

/**
 * Add a key handler to the current component
 * @param handlers - Handler functions
 */
export function useKey(handlers) {
	currentScope.renderer.registerKeyHandler(handlers, currentScope);
}

/**
 * On mount lifecycle hook
 * @param {Function} effect - The callback function
 */
export function onMount(effect) {
	const scope = currentScope;
	if (scope.mounted) return;
	const cleanup = effect();

	if (typeof cleanup === 'function') {
		scope.cleanups.push(cleanup)
	}
}
