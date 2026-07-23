"use strict";

const assert = require("node:assert/strict");

require("../duration-utils.js");

const { clampDuration, patchVideoDurationBody } = globalThis.DoubaoDurationUtils;

function patch(value, duration) {
  return patchVideoDurationBody(JSON.stringify(value), duration);
}

{
  const result = patch({ ability_param: { duration: 10, ratio: "9:16" } }, 12);
  assert.equal(result.changed, true);
  assert.equal(JSON.parse(result.body).ability_param.duration, 12);
}

{
  const result = patch({ ability_param: JSON.stringify({ duration: 8 }) }, 14);
  assert.equal(result.changed, true);
  assert.equal(JSON.parse(JSON.parse(result.body).ability_param).duration, 14);
}

{
  const nested = JSON.stringify({ payload: { ability_param: { duration: 7 } } });
  const result = patch({ request_data: nested }, 11);
  assert.equal(result.changed, true);
  assert.equal(JSON.parse(JSON.parse(result.body).request_data).payload.ability_param.duration, 11);
}

{
  const result = patch({ duration: 5, ability_param: { duration: "9" } }, 13);
  const parsed = JSON.parse(result.body);
  assert.equal(parsed.duration, 5);
  assert.equal(parsed.ability_param.duration, "13");
}

{
  const body = JSON.stringify({ duration: 6, model: "video" });
  const result = patchVideoDurationBody(body, 15);
  assert.equal(result.changed, false);
  assert.equal(result.body, body);
}

assert.equal(clampDuration(1), 4);
assert.equal(clampDuration(99), 15);
assert.equal(clampDuration("10"), 10);
assert.equal(clampDuration("invalid"), 15);

console.log("duration-utils tests passed");
