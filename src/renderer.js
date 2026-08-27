import validate from "@nuff-said/validate";
import Canvas from "terminal-canvas";

import { createScope, disposeScope, renderComponent } from "./scope.js";
import { oneOf } from "./util/validate.js";
/** @import { Scope } from "./scope.js" */

/**
 * One entry in the renderer's component stack.
 * @typedef {Object} StackEntry
 * @property {Scope} scope
 * @property {Function} fn - The component function
 * @property {*} props - The props passed to the component on render
 * @property {boolean} fullscreen - Whether this entry replaces everything beneath it
 */

/** Class that handles low level access to the screen */
export class Renderer {
	constructor(options) {
		constructorValidator(options);
		this.options = options;
	}

	/**
	 * Register a key handler, scoped to a component.
	 * @param {*} handlers - Handler functions
	 * @param {Scope} scope - The scope the handler is registered against
	 */
	registerKeyHandler(handlers, scope) {
		// TODO: Actually track keypresses - allow them to propagate on if needed
		const entry = { handlers, scope };
		this.keyListeners.push(entry)
		scope.cleanups.push(() => {
			const i = this.keyListeners.indexOf(entry);
			if (i !== -1) this.keyListeners.splice(i, 1);
		})
	}

	/** Schedule a render for the next microtask */
	requestRender() {
		if (this.dirty) return;
		this.dirty = true;
		queueMicrotask(() => this.renderPass())
	}

	/**
	 * Push a new root component onto the stack.
	 * @param {Function} fn - The component function
	 * @param {*} [props={}] - The props to pass to the component on render
	 * @param {boolean} [fullscreen=true] - Whether the component is fullscreen
	 * @return {?Scope} The scope of the component (`undefined` if deferred until the current render pass finishes)
	 */
	push(fn, props = {}, fullscreen = true) {
		if (this._rendering) {
			this._pendingActions.push(() => this.push(fn, props, fullscreen))
			return;
		}

		const scope = createScope(this, null);
		this.stack.push({ scope, fn, props, fullscreen });
		this.requestRender();
		return scope;
	}

	/** Remove the topmost component and dispose its scope */
	pop() {
		const entry = this.stack.pop();
		if (entry) disposeScope(entry.scope)
		this.requestRender()
	}

	/**
	 * Replace the topmost component with another.
	 * @param {Function} fn - The component function
	 * @param {*} [props={}] - The props to pass to the component on render
	 * @param {boolean} [fullscreen=true] - Whether the component is fullscreen
	 * @return {?Scope} The scope of the new component
	 */
	replace(fn, props = {}, fullscreen = true) {
		const entry = this.stack.pop()
		if (entry) disposeScope(entry.scope)
		return this.push(fn, props, fullscreen)
	}

	/**
	 * Mount a component in fullscreen mode.
	 * @param {Function} fn - The component function
	 * @param {*} [props={}] - The props to pass to the component on render
	 */
	mount(fn, props = {}) {
		this.push(fn, props, true);
	}

	/**
	 * Render and paint the stack.
	 */
	renderPass() {
		this.dirty = false;

		if (this.stack.length === 0) {
			this.paint([]);
			return;
		}

		let start = this.stack.length - 1;
		while (start > 0 && !this.stack[start].fullscreen) start--;

		this._rendering = true;

		const trees = [];
		for (let i = start; i < this.stack.length; i++) {
			const { scope, fn, props } = this.stack[i];
			trees.push(renderComponent(scope, fn, props));
		}

		this._rendering = false;

		this.paint(trees);

		if (this._pendingActions.length > 0) {
			const actions = this._pendingActions;
			this._pendingActions = [];
			for (const action of actions) action();
		}
	}

	/**
	 * Paint the given trees onto the screen.
	 * @param {*[]} trees - The rendered trees
	 * @todo Implement
	 */
	paint(trees) {
		throw new Error("Not implemented");
	}
}

/**
 * Validator for `Renderer` constructor options.
 * @private
 */
const constructorValidator = validate({
	mode: [validate.string(), oneOf("screen", "inline")]
})
