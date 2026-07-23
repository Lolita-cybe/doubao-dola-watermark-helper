(function (root) {
  "use strict";

  const MIN_DURATION = 4;
  const MAX_DURATION = 15;

  function clampDuration(value) {
    const duration = Math.round(Number(value));
    if (!Number.isFinite(duration)) {
      return MAX_DURATION;
    }
    return Math.min(MAX_DURATION, Math.max(MIN_DURATION, duration));
  }

  function patchVideoDurationBody(body, targetDuration) {
    const duration = clampDuration(targetDuration);
    if (typeof body !== "string" || !body.includes("ability_param")) {
      return { body, changed: false, duration };
    }

    try {
      const json = JSON.parse(body);
      const changed = patchAbilityParams(json, duration);
      return {
        body: changed ? JSON.stringify(json) : body,
        changed,
        duration
      };
    } catch {
      const patchedBody = patchSerializedDuration(body, duration);
      return {
        body: patchedBody,
        changed: patchedBody !== body,
        duration
      };
    }
  }

  function patchAbilityParams(value, duration, seen = new Set()) {
    if (!value || typeof value !== "object" || seen.has(value)) {
      return false;
    }

    seen.add(value);
    let changed = false;

    if (Array.isArray(value)) {
      for (const item of value) {
        changed = patchAbilityParams(item, duration, seen) || changed;
      }
      return changed;
    }

    for (const [key, child] of Object.entries(value)) {
      if (key === "ability_param") {
        const patched = patchAbilityParamValue(child, duration);
        if (patched.changed) {
          value[key] = patched.value;
          changed = true;
        }
        continue;
      }

      if (child && typeof child === "object") {
        changed = patchAbilityParams(child, duration, seen) || changed;
      } else if (typeof child === "string" && child.includes("ability_param")) {
        const patchedString = patchSerializedJson(child, duration);
        if (patchedString !== child) {
          value[key] = patchedString;
          changed = true;
        }
      }
    }

    return changed;
  }

  function patchAbilityParamValue(value, duration) {
    if (typeof value === "string") {
      const patched = patchSerializedJson(value, duration, true);
      return { value: patched, changed: patched !== value };
    }

    if (!value || typeof value !== "object") {
      return { value, changed: false };
    }

    return {
      value,
      changed: patchDurationFields(value, duration)
    };
  }

  function patchDurationFields(value, duration, seen = new Set()) {
    if (!value || typeof value !== "object" || seen.has(value)) {
      return false;
    }

    seen.add(value);
    let changed = false;

    for (const [key, child] of Object.entries(value)) {
      if (key === "duration" && (typeof child === "number" || typeof child === "string")) {
        const nextValue = typeof child === "string" ? String(duration) : duration;
        if (child !== nextValue) {
          value[key] = nextValue;
          changed = true;
        }
      } else if (child && typeof child === "object") {
        changed = patchDurationFields(child, duration, seen) || changed;
      } else if (typeof child === "string" && child.includes("duration")) {
        const patchedString = patchSerializedJson(child, duration, true);
        if (patchedString !== child) {
          value[key] = patchedString;
          changed = true;
        }
      }
    }

    return changed;
  }

  function patchSerializedJson(text, duration, insideAbilityParam = false) {
    try {
      const json = JSON.parse(text);
      const changed = insideAbilityParam
        ? patchDurationFields(json, duration)
        : patchAbilityParams(json, duration);
      return changed ? JSON.stringify(json) : text;
    } catch {
      return insideAbilityParam ? patchSerializedDuration(text, duration) : text;
    }
  }

  function patchSerializedDuration(text, duration) {
    return text.replace(
      /(\\*"duration\\*"\s*:\s*\\*"?)(\d{1,2})(\\*"?)/g,
      (_match, prefix, _current, suffix) => `${prefix}${duration}${suffix}`
    );
  }

  root.DoubaoDurationUtils = {
    MIN_DURATION,
    MAX_DURATION,
    clampDuration,
    patchVideoDurationBody
  };
})(typeof self !== "undefined" ? self : globalThis);
