import {
  ArrowLeft,
  ImageUp,
  Link2,
  LoaderCircle,
  Lock,
  Save,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import logo from '../assets/XY.png';
import type { BannerConfig } from '../hooks/useBanner';

const PASSWORD_STORAGE_KEY = 'trend-banner-admin-password';

type BannerEditorId = 'top' | 'trend';

const BANNER_EDITOR_META: Record<BannerEditorId, { label: string; title: string; apiPath: string }> = {
  top: {
    label: 'Superior',
    title: 'Banner superior',
    apiPath: '/api/top-banner',
  },
  trend: {
    label: 'Trend',
    title: 'Trend banner',
    apiPath: '/api/trend-banner',
  },
};

const BANNER_ORDER: BannerEditorId[] = ['top', 'trend'];

async function fetchBannerConfig(apiPath: string): Promise<BannerConfig> {
  const response = await fetch(apiPath);
  if (!response.ok) {
    throw new Error('Não foi possível carregar o banner atual.');
  }

  return response.json() as Promise<BannerConfig>;
}

function AdminShell({ children, fixed }: { children: ReactNode; fixed?: boolean }) {
  const shellClass = fixed
    ? 'flex h-dvh flex-col overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-white px-4 py-5'
    : 'flex min-h-dvh items-center justify-center bg-gradient-to-b from-orange-50/70 via-white to-white px-4 py-8';

  return (
    <div className={shellClass}>
      <div className={`mx-auto w-full max-w-lg ${fixed ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function AdminHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`shrink-0 text-center ${compact ? 'mb-5' : 'mb-8'}`}>
      <img
        src={logo}
        alt="XingYU"
        className={`mx-auto object-contain ${compact ? 'mb-2 h-9 w-9' : 'mb-5 h-12 w-12'}`}
      />
      <p className="flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.32em] text-[#CD853F]">
        <Sparkles className="h-3 w-3" strokeWidth={1.5} />
        Painel Admin
        <Sparkles className="h-3 w-3" strokeWidth={1.5} />
      </p>
    </div>
  );
}

type BannerSwitcherProps = {
  activeIndex: number;
  onChange: (index: number) => void;
};

function BannerSwitcher({ activeIndex, onChange }: BannerSwitcherProps) {
  return (
    <div
      className="relative grid grid-cols-2 gap-1 rounded-2xl border-2 border-orange-200 bg-orange-100/50 p-1"
      role="tablist"
      aria-label="Selecionar banner"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-1 rounded-[0.9rem] border border-orange-300 bg-white shadow-[0_2px_12px_rgba(251,146,60,0.22)] transition-[left] duration-300 ease-out"
        style={{
          width: 'calc(50% - 0.25rem)',
          left: activeIndex === 0 ? '0.25rem' : 'calc(50% + 0.125rem)',
        }}
      />

      {BANNER_ORDER.map((bannerId, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={bannerId}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(index)}
            className={`relative z-10 cursor-pointer rounded-[0.9rem] px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
              isActive ? 'text-orange-600' : 'text-black/40 hover:text-orange-500'
            }`}
          >
            {BANNER_EDITOR_META[bannerId].label}
          </button>
        );
      })}
    </div>
  );
}

function StatusMessage({ type, message }: { type: 'error' | 'success'; message: string }) {
  const styles =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return (
    <div className={`rounded-xl border px-3.5 py-2.5 text-sm ${styles}`} role="alert">
      {message}
    </div>
  );
}

type BannerEditorProps = {
  bannerId: BannerEditorId;
  password: string;
  currentBanner: BannerConfig;
  onSaved: (config: BannerConfig) => void;
};

function BannerEditor({ bannerId, password, currentBanner, onSaved }: BannerEditorProps) {
  const { title, apiPath } = BANNER_EDITOR_META[bannerId];
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState(() => currentBanner.link);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadedPreviewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );

  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl);
      }
    };
  }, [uploadedPreviewUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!link.trim()) {
      setError('Informe o link do banner.');
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('link', link.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(apiPath, {
        method: 'PUT',
        headers: {
          'x-admin-password': password,
        },
        body: formData,
      });

      const data = (await response.json()) as BannerConfig & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Não foi possível salvar o banner.');
      }

      onSaved(data);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setMessage('Salvo com sucesso.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }

  const bannerPreview = uploadedPreviewUrl
    ?? `${currentBanner.imageUrl}?v=${currentBanner.version}`;

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-hidden p-5 sm:p-6">
        <section className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-black/65">Pré-visualização</p>
            {imageFile ? (
              <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600">
                Nova
              </span>
            ) : null}
          </div>

          <div
            className="aspect-[16/7] max-h-[24dvh] w-full overflow-hidden rounded-2xl border-2 border-orange-200/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:max-h-[30dvh]"
            style={{
              backgroundImage: `url(${bannerPreview})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </section>

        <section className="space-y-1.5">
          <label htmlFor={`${bannerId}-link`} className="flex items-center gap-1.5 text-sm font-medium text-black/65">
            <Link2 className="h-3.5 w-3.5 text-orange-400" strokeWidth={1.5} />
            Link
          </label>
          <input
            id={`${bannerId}-link`}
            type="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            className="w-full rounded-xl border border-orange-100 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            placeholder="https://..."
            required
          />
        </section>

        <section className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-sm font-medium text-black/65">
            <ImageUp className="h-3.5 w-3.5 text-orange-400" strokeWidth={1.5} />
            Imagem
            <span className="text-xs font-normal text-black/35">opcional</span>
          </span>

          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="sr-only"
          />

          <label
            htmlFor={fileInputId}
            className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-orange-200/90 bg-orange-50/30 px-4 py-3 transition hover:border-orange-300 hover:bg-orange-50/60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-orange-100 transition group-hover:scale-[1.03]">
              <Upload className="h-4 w-4 text-orange-500" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-black/70">
                {imageFile ? imageFile.name : 'Escolher arquivo'}
              </p>
              <p className="text-xs text-black/40">PNG, JPG ou WEBP · máx. 5MB</p>
            </div>
          </label>
        </section>

        {message ? <StatusMessage type="success" message={message} /> : null}
        {error ? <StatusMessage type="error" message={error} /> : null}
      </div>

      <div className="shrink-0 border-t border-orange-100/80 bg-orange-50/30 px-5 py-4 sm:px-6">
        <button
          type="submit"
          disabled={isSaving}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200/60 transition hover:from-orange-600 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.5} />
          )}
          Salvar {title.toLowerCase()}
        </button>
      </div>
    </form>
  );
}

type AdminDashboardProps = {
  password: string;
  topBanner: BannerConfig;
  trendBanner: BannerConfig;
  onTopSaved: (config: BannerConfig) => void;
  onTrendSaved: (config: BannerConfig) => void;
};

function AdminDashboard({
  password,
  topBanner,
  trendBanner,
  onTopSaved,
  onTrendSaved,
}: AdminDashboardProps) {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const activeId = BANNER_ORDER[activeBannerIndex];

  return (
    <>
      <AdminHeader compact />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-orange-100/80 bg-white/95 shadow-[0_20px_60px_rgba(251,146,60,0.1)] backdrop-blur-sm">
        <div className="shrink-0 space-y-3 border-b border-orange-100/80 px-5 pb-4 pt-5 sm:px-6">
          <BannerSwitcher activeIndex={activeBannerIndex} onChange={setActiveBannerIndex} />
          <p className="text-center text-xs text-black/40">
            Editando <span className="font-medium text-black/55">{BANNER_EDITOR_META[activeId].title}</span>
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className={activeBannerIndex === 0 ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
            <BannerEditor
              key={`top-${topBanner.version}`}
              bannerId="top"
              password={password}
              currentBanner={topBanner}
              onSaved={onTopSaved}
            />
          </div>
          <div className={activeBannerIndex === 1 ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
            <BannerEditor
              key={`trend-${trendBanner.version}`}
              bannerId="trend"
              password={password}
              currentBanner={trendBanner}
              onSaved={onTrendSaved}
            />
          </div>
        </div>
      </div>

      <a
        href="/"
        className="mt-4 flex shrink-0 cursor-pointer items-center justify-center gap-1.5 py-1 text-xs text-black/40 transition hover:text-orange-500"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para o site
      </a>
    </>
  );
}

export default function TrendBannerAdmin() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PASSWORD_STORAGE_KEY) ?? '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [topBanner, setTopBanner] = useState<BannerConfig | null>(null);
  const [trendBanner, setTrendBanner] = useState<BannerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadConfigs(authPassword: string) {
    setIsLoading(true);
    setError(null);

    try {
      const [topConfig, trendConfig] = await Promise.all([
        fetchBannerConfig(BANNER_EDITOR_META.top.apiPath),
        fetchBannerConfig(BANNER_EDITOR_META.trend.apiPath),
      ]);

      setTopBanner(topConfig);
      setTrendBanner(trendConfig);
      setIsAuthenticated(true);
      sessionStorage.setItem(PASSWORD_STORAGE_KEY, authPassword);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar.');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const storedPassword = sessionStorage.getItem(PASSWORD_STORAGE_KEY);
    if (!storedPassword) return;

    void (async () => {
      const response = await fetch('/api/trend-banner/auth', {
        method: 'POST',
        headers: { 'x-admin-password': storedPassword },
      });

      if (!response.ok) {
        sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
        return;
      }

      await loadConfigs(storedPassword);
    })();
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password.trim()) {
      setError('Informe a senha de administrador.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trend-banner/auth', {
        method: 'POST',
        headers: {
          'x-admin-password': password.trim(),
        },
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.status === 503) {
        setError(data.error ?? 'Crie o arquivo .env com TREND_BANNER_ADMIN_PASSWORD e reinicie o servidor.');
        setIsAuthenticated(false);
        sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
        return;
      }

      if (!response.ok) {
        setError(data.error ?? 'Senha inválida.');
        setIsAuthenticated(false);
        sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
        return;
      }

      await loadConfigs(password.trim());
    } catch {
      setError('Não foi possível conectar à API. Reinicie com npm run dev (web + api).');
      setIsAuthenticated(false);
      sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <AdminShell>
        <AdminHeader />

        <div className="overflow-hidden rounded-[1.75rem] border border-orange-100/80 bg-white/95 shadow-[0_20px_60px_rgba(251,146,60,0.1)] backdrop-blur-sm">
          <div className="border-b border-orange-100/80 bg-gradient-to-r from-orange-50/80 to-white px-6 py-4">
            <p className="text-sm font-medium text-black/75">Acesso restrito</p>
            <p className="mt-1 text-xs text-black/45">Somente administradores autorizados.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 p-6">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-black/70">Senha</span>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400"
                  strokeWidth={1.5}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-orange-100 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-black/35 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                />
              </div>
            </label>

            {error ? <StatusMessage type="error" message={error} /> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-200/60 transition hover:from-orange-600 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Entrar no painel
            </button>
          </form>
        </div>

        <a
          href="/"
          className="mt-6 flex cursor-pointer items-center justify-center gap-1.5 text-xs text-black/40 transition hover:text-orange-500"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para o site
        </a>
      </AdminShell>
    );
  }

  if (!topBanner || !trendBanner) {
    return null;
  }

  return (
    <AdminShell fixed>
      <AdminDashboard
        password={password}
        topBanner={topBanner}
        trendBanner={trendBanner}
        onTopSaved={setTopBanner}
        onTrendSaved={setTrendBanner}
      />
    </AdminShell>
  );
}
