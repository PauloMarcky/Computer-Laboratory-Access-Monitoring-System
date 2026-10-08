import { useState, type FormEvent } from 'react';
import type { WireframeScreenId } from '../types';
import { ArrowLeft } from 'lucide-react';

interface RoleLoginFormProps {
  onNavigate: (screen: WireframeScreenId) => void;
  role: string;
  description: string;
  identityLabel: string;
  identityPlaceholder: string;
  identityType?: 'text' | 'email';
  destination: WireframeScreenId;
  accent: string;
  onIdentitySubmit?: (identity: string) => void;
  onCredentialsSubmit?: (identity: string, password: string) => Promise<void>;
}

interface RoleLoginProps {
  onNavigate: (screen: WireframeScreenId) => void;
}

export const RoleLoginForm = ({
  onNavigate,
  role,
  description,
  identityLabel,
  identityPlaceholder,
  identityType = 'text',
  destination,
  accent,
  onIdentitySubmit,
  onCredentialsSubmit,
}: RoleLoginFormProps) => {
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const identity = formData.get('username');
    const password = formData.get('password');
    if (typeof identity !== 'string' || typeof password !== 'string') return;

    if (onCredentialsSubmit) {
      setSubmitError('');
      setIsSubmitting(true);
      try {
        await onCredentialsSubmit(identity.trim(), password);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Unable to sign in.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (onIdentitySubmit) {
      onIdentitySubmit(identity.trim());
      return;
    }
    onNavigate(destination);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-white-100/80">

      {/* Modal card */}
      <section className="animate-pop-in relative z-10 w-full max-w-[520px] overflow-hidden rounded-2xl border-3 border-white/40 outline-none  bg-white shadow-2xl shadow-purple-950/60 [backface-visibility:hidden] [transform:translateZ(0)]">

        {/* Header strip */}
        <div className="relative border-0 bg-[#1b325f] px-10 pt-8 pb-10">

          <button
            type="button"
            onClick={() => onNavigate('login-portal')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-purple-100 ring-1 ring-white/20 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            aria-label="Back"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>

          <div className="relative text-center">
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-6 text-purple-100/80">{description}</p>
          </div>
        </div>

        {/* Form body */}
        <div className="px-10 py-9">
          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block text-sm font-semibold tracking-wide text-slate-700">
              {identityLabel}
              <input
                type={identityType}
                name="username"
                autoComplete="username"
                placeholder={identityPlaceholder}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50/60 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/15"
              />
            </label>

            <label className="block text-sm font-semibold tracking-wide text-slate-700">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50/60 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/15"
              />
            </label>

            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                <span className="mt-0.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-amber-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-900/30 transition-all hover:from-purple-800 hover:to-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            University of La Salette - Santiago City, Isabela
          </p>
        </div>
      </section>
    </main>
  );
};

export type { RoleLoginProps };