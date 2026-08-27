import validate from "@nuff-said/validate";

export const exactString = str => (value, key) => value === str || `${key} is not '${str}'`;
export const oneOf = (...strs) => (value, key) => strs.includes(value) || `${key} must be one of ${strs.map(str => `'${str}'`).join(', ')}`;

export const positiveInt = (value, key) => isPositiveInt(value) || `${key} must be a positive integer`;
export const int = (value, key) => Number.isInteger(value) || `${key} must be a integer`;

export const flexMeasure = (allowAuto = false) => (value, key) => {
	if (value === undefined) return true;
	if (isPositiveInt(value)) return true;
	if (typeof value === "string") {
		if (allowAuto && value === "auto") return true;
		if (value.endsWith("%")) {
			const rest = +value.slice(0, -1);
			if (isNaN(rest) || rest < 0 || rest > 100) return `${key} is an invalid percentage`;
			return true;
		}
	}
	return `${key} is not a valid measure`;
}

export const isNumber = x => typeof x === "number" && !isNaN(x);
export const isPositiveInt = x => Number.isInteger(x) && x >= 0;

export const allNodeDefaultOpts = {
	flexGrow: 0,
	flexShrink: 1,
	flexBasis: "auto",
	alignSelf: "auto",
	order: 0,
}

export const nodeOptionsSchema = {
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
