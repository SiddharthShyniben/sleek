import validate from "@nuff-said/validate";
import { exactString, flexMeasure, int, isPositiveInt, oneOf, positiveInt } from "../util/validate.js";

export const allNodeDefaultOpts = {
	flexGrow: 0,
	flexShrink: 1,
	flexBasis: "auto",
	alignSelf: "auto",
	order: 0,
}

const nodeOptionsSchema = {
	flexGrow: [validate.required(), positiveInt],
	flexShrink: [validate.required(), positiveInt],
	flexBasis: [validate.required(), flexMeasure(true)],
	alignSelf: [validate.required(), oneOf("start", "end", "center", "stretch", "auto")],
	order: [validate.required(), int],
	width: flexMeasure(),
	height: flexMeasure(),
	minWidth: flexMeasure(),
	maxWidth: flexMeasure(),
	minHeight: flexMeasure(),
	maxHeight: flexMeasure(),
}

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

const validateBox = validate({
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

export const textDefaultOpts = {
	wrap: false,
	wrapOpts: {},
}

const validateText = validate({
	type: exactString("text"),
	text: [validate.required(), validate.string()],
	options: {
		...nodeOptionsSchema,
		wrap: validate.boolean(),
		wrapOpts: {
			width: validate.number(),
			indent: validate.number(),
			newline: validate.string(),
			trim: validate.boolean(),
			cut: validate.boolean()
		}
	}
})
