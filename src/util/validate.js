import validate from "@nuff-said/validate";

/**
 * Global flex layout options.
 * @typedef {Object} NodeOptions
 * @property {number} [flexGrow=0]
 * @property {number} [flexShrink=1]
 * @property {(number|string)} [flexBasis="auto"]
 * @property {("start"|"end"|"center"|"stretch"|"auto")} [alignSelf="auto"]
 * @property {number} [order=0]
 * @property {(number|string)} [width]
 * @property {(number|string)} [height]
 * @property {(number|string)} [minWidth]
 * @property {(number|string)} [maxWidth]
 * @property {(number|string)} [minHeight]
 * @property {(number|string)} [maxHeight]
 */

/**
 * Validator for an exact string match.
 * @param {string} str - The required value
 * @return {Function} A validator
 */
export const exactString = str => (value, key) => value === str || `${key} is not '${str}'`;

/**
 * Validator that requires the value to be one of a fixed set of strings.
 * @param {...string} strs - The allowed values
 * @return {Function} A validator
 */
export const oneOf = (...strs) => (value, key) => strs.includes(value) || `${key} must be one of ${strs.map(str => `'${str}'`).join(', ')}`;

/**
 * Validator that requires the value to be a positive integer.
 * @param {*} value - The value being validated
 * @param {string} key - The property name used in the error message
 * @return {(true|string)} `true` if valid, otherwise an error message
 */
export const positiveInt = (value, key) => isPositiveInt(value) || `${key} must be a positive integer`;

/**
 * Validator that requires the value to be an integer.
 * @param {*} value - The value being validated
 * @param {string} key - The property name used in the error message
 * @return {(true|string)} `true` if valid, otherwise an error message
 */
export const int = (value, key) => Number.isInteger(value) || `${key} must be a integer`;

/**
 * Validator for a measure used in flexbox calculations: a positive integer,
 * a percentage string or optionally `"auto"`.
 * @param {boolean} [allowAuto=false] - Whether `"auto"` is a valid value
 * @return {Function} A validator
 */
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

/**
 * @param {*} x - The value to check
 * @return {boolean} Whether `x` is a valid number
 */
export const isNumber = x => typeof x === "number" && !isNaN(x);

/**
 * @param {*} x - The value to check
 * @return {boolean} Whether `x` is a positive integer
 */
export const isPositiveInt = x => Number.isInteger(x) && x >= 0;

/**
 * Default {@link NodeOptions} applied to every node
 * @type {NodeOptions}
 */
export const allNodeDefaultOpts = {
	flexGrow: 0,
	flexShrink: 1,
	flexBasis: "auto",
	alignSelf: "auto",
	order: 0,
}

/**
 * Validation schema fragment for {@link NodeOptions} applied to every node
 * @type {Object}
 */
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
