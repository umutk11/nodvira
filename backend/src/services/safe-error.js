const safeTokenPattern = /^[A-Za-z0-9_.:-]{1,128}$/;

function safeToken(value) {
  const normalized = String(value ?? "").trim();
  return safeTokenPattern.test(normalized) ? normalized : undefined;
}

export function safeErrorDetails(error, metadata = {}) {
  const details = {
    type: safeToken(error?.name) || "Error",
  };
  const code = safeToken(error?.code);
  const constraint = safeToken(error?.constraint);
  if (code) details.code = code;
  if (constraint) details.constraint = constraint;

  for (const [key, value] of Object.entries(metadata)) {
    if (!safeToken(key)) continue;
    if (typeof value === "number" && Number.isFinite(value)) details[key] = value;
    if (typeof value === "boolean") details[key] = value;
    if (typeof value === "string") {
      const token = safeToken(value);
      if (token) details[key] = token;
    }
  }

  return details;
}

export function safeErrorSummary(error) {
  const details = safeErrorDetails(error);
  return details.code ? `${details.type} (${details.code})` : details.type;
}

export function logSafeError(context, error, metadata) {
  console.error(context, safeErrorDetails(error, metadata));
}
