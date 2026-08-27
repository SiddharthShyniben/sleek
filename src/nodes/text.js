import validate from "@nuff-said/validate";
import { allNodeDefaultOpts, exactString, nodeOptionsSchema } from "../util/validate.js";

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

export const validateText = validate({
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

export function measureText(node, constraints) {
	throw new Error("Not implemented");
}

export function paintText(node, canvas, rect) {
	throw new Error("Not implemented");
}
