import { proxy, subscribe } from 'valtio/vanilla';
/** @import { Renderer } from "./renderer.js" */

/**
 * Component state, tracking its reactive store, its position
 * in the scope tree, and cleanup for when it's unmounted.
 * @typedef {Object} Scope
 * @property {Renderer} renderer - The renderer this component is attached to
 * @property {?Scope} parent - The parent scope, or `null` for a root
 * @property {Object} state - The component's reactive state
 * @property {boolean} mounted - Whether the component has rendered at least once
 * @property {Map<*, Scope>} children - Child scopes, keyed by the key passed to `child()`
 * @property {Set<*>} visitedThisPass - Child keys visited during the current render pass
 * @property {Function[]} cleanups - Functions to run when this scope is disposed
 */

/**
 * Create a scope for a component instance.
 * @param {Renderer} renderer - The renderer instance this component is attached to
 * @param {?Scope} [parent=null] - The parent component's scope
 * @return {Scope}
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
 * Dispose of a scope and run all its cleanup functions, recursively.
 * @param {Scope} scope - The scope to dispose
 */
export function disposeScope(scope) {
	for (const fn of scope.cleanups) fn();
	for (const child of scope.children.values()) disposeScope(child)
}

let currentScope = null;

/**
 * Render a component within its scope.
 * @param {Scope} scope - The scope of the component
 * @param {Function} fn - The component function
 * @param {*} props - The props to pass to the component
 * @return {*} The component function's return value
 */
export function renderComponent(scope, fn, props) {
	const prevScope = currentScope;
	currentScope = scope;

	scope.visitedThisPass = new Set();

	const result = fn(props, scope.state);

	if (!scope.mounted) {
		subscribe(scope.state, () => {
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
 * Render a child component.
 * @param {*} key - The unique key used to track this child across renders
 * @param {Function} fn - The component function
 * @param {*} props - The props to pass to the component
 * @return {*} The component function's return value
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
 * Fill in default values on a store
 * @param {Object} store - Store object
 * @param {Object} values - Default values, keyed the same as `store`
 */
export function defaults(store, values) {
	for (const key in values) {
		if (store[key] === undefined) store[key] = values[key];
	}
}

/**
 * Register a key handler on the current component's scope.
 * @param {*} handlers - Handler functions
 */
export function useKey(handlers) {
	currentScope.renderer.registerKeyHandler(handlers, currentScope);
}

/**
 * On-mount lifecycle hook. If `effect` returns a function, it's
 * registered as a cleanup to run when the scope is disposed.
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
