export function getAdminPassword() {
  return process.env.TREND_BANNER_ADMIN_PASSWORD?.trim() ?? '';
}

export function checkAdminPassword(passwordHeader: string | null | undefined) {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    return {
      ok: false as const,
      status: 503,
      error: 'Senha do admin não configurada no servidor. Defina TREND_BANNER_ADMIN_PASSWORD.',
    };
  }

  if (passwordHeader !== configuredPassword) {
    return {
      ok: false as const,
      status: 401,
      error: 'Senha inválida.',
    };
  }

  return { ok: true as const };
}
