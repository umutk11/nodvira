export function isSafePublicLink(value) {
  const candidate = String(value ?? "").trim();
  if (!candidate || /[\\\u0000-\u001f\u007f]/.test(candidate)) return false;

  if (candidate.startsWith("/")) {
    return !candidate.startsWith("//");
  }

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
