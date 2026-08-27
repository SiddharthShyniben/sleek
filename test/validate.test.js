import { test } from "node:test";
import assert from "node:assert/strict";
import {
	allNodeDefaultOpts,
	exactString,
	flexMeasure,
	int,
	isNumber,
	isPositiveInt,
	nodeOptionsSchema,
	oneOf,
	positiveInt,
} from "../src/util/validate.js";

test("exactString matches only the given string", () => {
	const validator = exactString("box");
	assert.equal(validator("box", "type"), true);
	assert.equal(validator("text", "type"), "type is not 'box'");
});

test("oneOf matches any of the given strings", () => {
	const validator = oneOf("row", "column");
	assert.equal(validator("row", "direction"), true);
	assert.equal(validator("diagonal", "direction"), "direction must be one of 'row', 'column'");
});

test("positiveInt accepts integers >= 0 only", () => {
	assert.equal(positiveInt(0, "gap"), true);
	assert.equal(positiveInt(5, "gap"), true);
	assert.equal(positiveInt(-1, "gap"), "gap must be a positive integer");
	assert.equal(positiveInt(1.5, "gap"), "gap must be a positive integer");
});

test("int accepts any integer", () => {
	assert.equal(int(-3, "order"), true);
	assert.equal(int(3, "order"), true);
	assert.equal(int(1.5, "order"), "order must be a integer");
});

test("flexMeasure accepts positive integers and percentages", () => {
	const measure = flexMeasure();
	assert.equal(measure(5, "width"), true);
	assert.equal(measure("50%", "width"), true);
	assert.equal(measure("150%", "width"), "width is an invalid percentage");
	assert.equal(measure("banana", "width"), "width is not a valid measure");
	assert.equal(measure(undefined, "width"), true);
});

test("flexMeasure only accepts 'auto' when allowAuto is true", () => {
	assert.equal(flexMeasure(true)("auto", "flexBasis"), true);
	assert.equal(flexMeasure(false)("auto", "flexBasis"), "flexBasis is not a valid measure");
});

test("isNumber / isPositiveInt", () => {
	assert.equal(isNumber(5), true);
	assert.equal(isNumber(NaN), false);
	assert.equal(isNumber("5"), false);
	assert.equal(isPositiveInt(0), true);
	assert.equal(isPositiveInt(-1), false);
	assert.equal(isPositiveInt(1.5), false);
});

test("allNodeDefaultOpts has the expected shape", () => {
	assert.deepEqual(allNodeDefaultOpts, {
		flexGrow: 0,
		flexShrink: 1,
		flexBasis: "auto",
		alignSelf: "auto",
		order: 0,
	});
});

test("nodeOptionsSchema covers every allNodeDefaultOpts key", () => {
	for (const key of Object.keys(allNodeDefaultOpts)) {
		assert.ok(key in nodeOptionsSchema, `missing schema entry for ${key}`);
	}
});
