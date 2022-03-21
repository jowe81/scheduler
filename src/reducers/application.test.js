import { reducer, actions } from "./application.js";

it("throws an error with an unsupported type", () => {
  expect(() => reducer({}, {type: null})).toThrowError(/called with unknown action type/i);
});