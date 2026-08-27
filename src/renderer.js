import validate from "@nuff-said/validate";
import { nanoid } from "nanoid";
import Canvas from "terminal-canvas";
import { disposeScope, renderComponent } from "./scope.js";

/** Class that handles low level access to the screen */
export class Renderer {
	/**
	 * Initialize a Renderer instance
	 * @param {Function} handlers 
	 * @param scope - The scope in which it applies
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

	/** Schedule a render */
	requestRender() {
		if (this.dirty) return;
		this.dirty = true;
		queueMicrotask(() => this.renderPass())
	}

	/**
	 * Create a new root element in the stack
	 * @param {Function} fn - The component function
	 * @param {*} props - The props to pass to the component on render
	 * @param {boolean} fullscreen - Whether the component is fullscreen
	 * @returns The scope of the component
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

	/** Remove the topmost component and dispose it's scope */
	pop() {
		const entry = this.stack.pop();
		if (entry) disposeScope(entry.scope)
		this.requestRender()
	}

	/**
	 * Replaces the topmost component with another
	 * @param {Function} fn - The component function
	 * @param {*} props - The props to pass to the component on render
	 * @param {boolean} fullscreen - Whether the component is fullscreen
	 * @returns The scope of the component
	 */
	replace(fn, props = {}, fullscreen = true) {
		const entry = this.stack.pop()
		if (entry) disposeScope(entry.scope)
		return this.push(fn, props, fullscreen)
	}

	/**
	 * Mount a component in fullscreen mode
	 * @param {Function} fn - The component function
	 * @param {*} props - The props to pass to the component on render
	 */
	mount(fn, props = {}) {
		this.push(fn, props, true);
	}

	/** Render the screen */
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

	/** Actually paint the components on the screen */
	paint(trees) {
		// TODO: Implement
		throw new Error("Not implemented");
	}
}

const constructorValidator = validate({
	mode: [validate.string(), str => ["inline", "screen"].includes(str) || `${str} must be one of "inline" or "screen"`]
})
