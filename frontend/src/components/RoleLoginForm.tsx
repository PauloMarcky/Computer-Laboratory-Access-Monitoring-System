import { ArrowLeft, LogIn } from 'lucide-react';
import type { FormEvent } from 'react';
import type { WireframeScreenId } from '../types';

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
}: RoleLoginFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const identity = new FormData(event.currentTarget).get('username');
    if (onIdentitySubmit && typeof identity === 'string') {
      onIdentitySubmit(identity.trim());
      return;
    }
    onNavigate(destination);
  };

  return (
    <main className="min-h-[calc(100vh-44px)] bg-[#f4f6f9] flex flex-col items-center justify-center p-6">
      <section className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-sm">
        <button
          type="button"
          onClick={() => onNavigate('login-portal')}
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 "
          aria-label="Back"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 text-center">{role} Log in</h1>
        <p className="mt-2 mb-7 text-sm leading-6 text-slate-500 text-center">{description}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            {identityLabel}
            <input
              type={identityType}
              name="username"
              autoComplete="username"
              placeholder={identityPlaceholder}
              required
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1d3663] focus:ring-2 focus:ring-[#1d3663]/15"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1d3663] focus:ring-2 focus:ring-[#1d3663]/15"
            />
          </label>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d3663]"
          >
            <LogIn size={16} aria-hidden="true" />
            Continue
          </button>
        </form>
      </section>
    </main>
  );
};

export type { RoleLoginProps };