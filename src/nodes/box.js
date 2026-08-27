import validate from "@nuff-said/validate";
import { allNodeDefaultOpts, exactString, isPositiveInt, nodeOptionsSchema, oneOf, positiveInt } from "../util/validate.js";

export function box(children, options = {}) {
	const leaf = { type: "box", children, options: Object.assign({}, allNodeDefaultOpts, boxDefaultOpts, options) };
	validateBox(leaf);
	return leaf;
}

export const boxDefaultOpts = {
	direction: "column",
	gap: 0,
	padding: 0,
	alignItems: "stretch",
	justifyContent: "start",
	flexWrap: "nowrap",
	alignContent: "stretch",
};

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

export function measureBox(node, constraints) {
	throw new Error("Not implemented");
}

export function arrangeChildren(node, constraints) {
	throw new Error("Not implemented");
}

export function paintBox(node, canvas, rect) {
	throw new Error("Not implemented");
}
