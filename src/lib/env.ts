export function hasDatabaseEnv() {
  return Boolean(process.env.DATABASE_URL);
}

export function hasAdminAuthEnv() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return Boolean(
    process.env.ADMIN_PASSWORD_HASH && secret && secret.length >= 32,
  );
}

export function isAdminPreviewMode() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ADMIN_PREVIEW_MODE === "true"
  );
}
