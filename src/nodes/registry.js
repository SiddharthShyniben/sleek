import { arrangeChildren, measureBox, paintBox } from "./box.js";
import { measureText, paintText } from "./text.js";

export const registry = {
	box: { measure: measureBox, arrange: arrangeChildren, paint: paintBox },
	text: { measure: measureText, paint: paintText },
};
