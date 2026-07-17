const DEV_FALLBACK_ADMIN_PATH = '/admin';

function normalizeAdminPath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return null;

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, '') || null;
}

export function getAdminPath() {
  const configured = normalizeAdminPath(import.meta.env.VITE_ADMIN_PATH ?? '');
  if (configured) return configured;

  if (import.meta.env.DEV) {
    return DEV_FALLBACK_ADMIN_PATH;
  }

  return null;
}

export function isAdminRoute(pathname: string) {
  const adminPath = getAdminPath();
  if (!adminPath) return false;

  return pathname === adminPath || pathname.startsWith(`${adminPath}/`);
}
