import { proxy, subscribe } from "valtio";

// TODO: global export
export function globalStore(renderer, initial) {
	const store = proxy(initial);
	subscribe(store, () => renderer.requestRender());
	return store;
}
