import validate from "@nuff-said/validate";
import { allNodeDefaultOpts, exactString, isPositiveInt, nodeOptionsSchema, oneOf, positiveInt } from "../util/validate.js";
/** @import { TextNode } from "./text.js" */

/**
 * Object storing padding information for all four sides.
 * @typedef {Object} PaddingSides
 * @property {number} [top]
 * @property {number} [bottom]
 * @property {number} [left]
 * @property {number} [right]
 */

/**
 * A box node's options, along with
 * {@link import('../util/validate.js').NodeOptions}
 * @typedef {Object} BoxOptions
 * @property {("row"|"column")} [direction="column"] - Main axis along which children are laid out
 * @property {number} [gap=0] - Space between children along the main axis
 * @property {(number|PaddingSides)} [padding=0] - Inner spacing, either uniform or per-side
 * @property {("start"|"end"|"center"|"stretch")} [alignItems="stretch"] - Cross-axis alignment of children
 * @property {("start"|"end"|"center"|"space-between"|"space-around")} [justifyContent="start"] - Main-axis distribution of children
 * @property {("wrap"|"nowrap")} [flexWrap="nowrap"] - Whether children wrap onto new lines
 * @property {("start"|"end"|"center"|"stretch"|"space-between"|"space-around")} [alignContent="stretch"] - Cross-axis distribution of wrapped lines
 */

/**
 * A container node that also handles flexbox layouts
 * @typedef {Object} BoxNode
 * @property {"box"} type
 * @property {Array<BoxNode|TextNode>} children
 * @property {BoxOptions} options
 */

/**
 * Create a box node.
 * @param {Array<BoxNode|TextNode>} children - The child nodes to lay out
 * @param {BoxOptions} [options={}] - Layout options
 * @return {BoxNode} The created (and validated) node
 * @throws {Error} If `options` fails validation
 */
export function box(children, options = {}) {
	const leaf = { type: "box", children, options: Object.assign({}, allNodeDefaultOpts, boxDefaultOpts, options) };
	validateBox(leaf);
	return leaf;
}

/**
 * Default {@link BoxOptions} for a box node.
 * @type {BoxOptions}
 */
export const boxDefaultOpts = {
	direction: "column",
	gap: 0,
	padding: 0,
	alignItems: "stretch",
	justifyContent: "start",
	flexWrap: "nowrap",
	alignContent: "stretch",
};

/**
 * Validator for the `padding` option
 * @param {*} value
 * @param {string} key - The property name, used in the error message
 * @return {(true|string)} `true` if valid, otherwise an error message
 * @private
 */
const paddingValidator = (value, key) => {
	if (isPositiveInt(value)) return true;

	if (typeof value !== "object" || value === null) {
		return `Invalid ${key}: must be either a positive integer or an object`;
	}

	const keys = ["top", "bottom", "left", "right"];
	for (const opt of keys) {
		if (value[opt] === undefined) continue;
		if (!isPositiveInt(value[opt])) {
			return `Invalid ${key}.${opt}: must be a positive integer`;
		}
	}
	return true;
}

/**
 * Validates a {@link BoxNode}
 * @param {BoxNode} node
 * @throws {Error}
 */
export const validateBox = validate({
	type: exactString("box"),
	children: validate.array(),
	options: {
		...nodeOptionsSchema,
		direction: [validate.required(), oneOf("row", "column")],
		gap: [validate.required(), positiveInt],
		padding: [validate.required(), paddingValidator],
		alignItems: [validate.required(), oneOf("start", "end", "center", "stretch")],
		justifyContent: [validate.required(), oneOf("start", "end", "center", "space-between", "space-around")],
		flexWrap: [validate.required(), oneOf("wrap", "nowrap")],
		alignContent: [validate.required(), oneOf("start", "end", "center", "stretch", "space-between", "space-around")],
	}
})

/**
 * Measure a box node.
 * @param {BoxNode} node
 * @param {*} constraints - Available space to measure against
 * @todo Implement
 */
export function measureBox(node, constraints) {
	throw new Error("Not implemented");
}

/**
 * Distribute a box's children according to its flex layout options
 * @param {BoxNode} node
 * @param {*} constraints - Available space to arrange children within
 * @todo Implement
 */
export function arrangeChildren(node, constraints) {
	throw new Error("Not implemented");
}

/**
 * Paint a box's own decoration into the canvas.
 * @param {BoxNode} node
 * @param {*} canvas - The canvas to paint into
 * @param {*} rect - The rectangle measured for this node
 * @todo Implement
 */
export function paintBox(node, canvas, rect) {
	throw new Error("Not implemented");
}
