import { arrangeChildren, measureBox, paintBox } from "./box.js";
import { measureText, paintText } from "./text.js";
/** @import { BoxNode } from "./box.js" */
/** @import { TextNode } from "./text.js" */

/**
 * Any node in a tree.
 * @typedef {(BoxNode|TextNode)} Node
 */

/**
 * The layout and rendering functions registered for one node type.
 * @typedef {Object} NodeTypeEntry
 * @property {Function} [measure] - Compute the node's own size given constraints
 * @property {Function} [arrange] - Distribute the node's children (containers only)
 * @property {Function} [paint] - Paint the node's own decoration/content
 */

/**
 * @type {Object<string, NodeTypeEntry>}
 */
export const registry = {
	box: { measure: measureBox, arrange: arrangeChildren, paint: paintBox },
	text: { measure: measureText, paint: paintText },
};
