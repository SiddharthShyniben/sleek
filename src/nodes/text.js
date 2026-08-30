import validate from "@nuff-said/validate";
import wrap from "word-wrap";

import { allNodeDefaultOpts, exactString, nodeOptionsSchema } from "../util/validate.js";

/**
 * Word-wrap options.
 * @typedef {Object} WrapOptions
 * @property {number} [width] - Maximum line width
 * @property {number} [indent] - Number of spaces to indent each line with
 * @property {string} [newline] - String used to separate lines
 * @property {boolean} [trim] - Whether to trim trailing whitespace from each line
 * @property {boolean} [cut] - Whether to break words longer than `width`
 */

/**
 * A text node's options, along with
 * {@link import('../util/validate.js').NodeOptions}
 * @typedef {Object} TextOptions
 * @property {boolean} [forceNoWrap=false] - Whether to force absolutely no wrapping
 * @property {WrapOptions} [wrapOpts] - word-wrap options, used unless `forceNoWrap` is true
 */

/**
 * A leaf node that renders a run of text.
 * @typedef {Object} TextNode
 * @property {"text"} type
 * @property {string} text - The text to render
 * @property {TextOptions} options
 */

/**
 * Create a text node.
 * @param {string} text - The text to render
 * @param {TextOptions} [options={}] - Layout and wrapping options
 * @return {TextNode} The created (and validated) node
 * @throws {Error} If `options` fails validation
 */
export function text(text, options = {}) {
	const leaf = {
		type: "text",
		text,
		options: Object.assign({}, allNodeDefaultOpts, textDefaultOpts, options, {
			wrapOpts: { ...textDefaultOpts.wrapOpts, ...(options.wrapOpts || {}) },
		}),
	};
	validateText(leaf);
	return leaf;
}

/**
 * Default {@link TextOptions} for a text node.
 * @type {TextOptions}
 */
export const textDefaultOpts = {
	forceNoWrap: false,
	wrapOpts: {},
}

/**
 * Validates a {@link TextNode}
 * @param {TextNode} node
 * @throws {Error}
 */
export const validateText = validate({
	type: exactString("text"),
	text: [validate.required(), validate.string()],
	options: {
		...nodeOptionsSchema,
		forceNoWrap: validate.boolean(),
		wrapOpts: {
			width: validate.number(),
			indent: validate.number(),
			newline: validate.string(),
			trim: validate.boolean(),
			cut: validate.boolean()
		}
	}
})

/**
 * Measure a text node's size
 * @param {TextNode} node
 * @param {*} constraints - Available space to measure against
 * @todo Implement
 */
export function measureText(node, constraints) {
	const wrapOpts = { width: constraints.maxWidth }
	const finalOpts = Object.assign({}, wrapOpts, node.options.wrapOpts);

	const finalText = node.options.forceNoWrap
		? node.text
		: wrap(node.text, finalOpts);

	return {
		width: Math.max(...finalText.split(finalOpts.newline ?? "\n").map(l => l.length)),
		height: finalText.split(finalOpts.newline ?? "\n").length
	}
}

/**
 * Paint a text node
 * @param {TextNode} node
 * @param {*} canvas - The canvas to paint into
 * @param {*} rect - The rectangle measured for this node
 * @todo Implement
 */
export function paintText(node, canvas, rect) {
	const wrapOpts = { width: rect.width }
	const finalOpts = Object.assign({}, wrapOpts, node.options.wrapOpts);

	const finalText = node.options.forceNoWrap
		? node.text
		: wrap(node.text, finalOpts);

	finalText.split(finalOpts.newline ?? "\n").forEach((line, i) => canvas.moveTo(rect.x, rect.y + i).write(line))
}
