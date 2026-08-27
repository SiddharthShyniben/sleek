import { proxy, subscribe } from "valtio/vanilla";
/** @import { Renderer } from "../renderer.js" */

/**
 * Create a reactive store that isn't tied to any one component's scope, for
 * state shared across the whole app. Mutating it schedules a render.
 * @param {Renderer} renderer - The renderer to request a render on
 * @param {Object} initial - The store's initial state
 * @return {Object} The reactive (valtio) store
 */
export function globalStore(renderer, initial) {
	const store = proxy(initial);
	subscribe(store, () => renderer.requestRender());
	return store;
}
