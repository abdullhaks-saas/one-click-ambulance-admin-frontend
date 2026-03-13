import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { adminAuthApi } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import type { AxiosError } from 'axios';
import loginArt from '@/assets/hero.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform((v: string) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

function getErrorMessage(error: unknown): string {
  const err = error as AxiosError<{ message?: string; error?: string }> & {
    apiMessage?: string;
  };
  return (
    err?.apiMessage ??
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    'Login failed. Please try again.'
  );
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parseResult = loginSchema.safeParse({ email, password });
    if (!parseResult.success) {
      const zodErrors = parseResult.error.flatten().fieldErrors;
      setErrors({
        email: zodErrors.email?.[0],
        password: zodErrors.password?.[0],
      });
      toast.error('Please fix the validation errors');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await adminAuthApi.login(parseResult.data);
      setAuth(data.access_token, data.admin);
      toast.success('Welcome back!');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black selection:bg-red-500/30">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Side - Image Panel */}
        <div className="relative hidden p-6 lg:block">
          <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-zinc-900 ring-1 ring-black/10">
            <img
              src={loginArt}
              alt="Admin Portal Inspiration"
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/20 to-transparent" />

            {/* Watermark / Logo Text */}
            <div className="absolute left-10 top-10 flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white/90">
                OneClick
                <span className="text-red-500">.Admin</span>
              </span>
            </div>

            {/* Bottom text embedded in image like reference */}
            <div className="absolute bottom-10 left-10 right-10">
              <p className="text-sm font-medium text-black/60">
                Secure Portal for Authorized Personnel Only
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 xl:px-32">
          {/* Top Back nav */}
          <div className="mb-12 flex items-center justify-between">
            <Link
              to="/"
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-black/5 ring-1 ring-black/10 transition-all hover:bg-black/10"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5 text-zinc-400 group-hover:text-black transition-colors" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>Need help?</span>
              <a href="#" className="font-medium text-black hover:text-red-400 transition-colors">
                Support
              </a>
            </div>
          </div>

          <div className="w-full max-w-md">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black mb-2">
                Sign In to Portal
              </h1>
              <p className="text-zinc-400 mb-8 sm:mb-12">
                Enter your credentials to access the admin dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    autoComplete="email"
                    disabled={isLoading}
                    autoFocus
                    className={`block w-full h-auto rounded-2xl border bg-[#0f0f12] px-5 py-4 text-base text-white placeholder-zinc-500 outline-none transition-all hover:bg-[#151518] focus:bg-[#1a1a1d] focus:ring-1 [&:-webkit-autofill]:bg-[#0f0f12] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#0f0f12_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white] ${errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-black/10 focus:border-zinc-500 focus:ring-black/10'
                      }`}
                  />
                  {/* Subtle inner shadow for glowing line effect */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
                </div>
                {errors.email && (
                  <p className="px-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    }}
                    autoComplete="current-password"
                    disabled={isLoading}
                    className={`block w-full h-auto rounded-2xl border bg-[#0f0f12] px-5 py-4 pr-12 text-base text-white placeholder-zinc-500 outline-none transition-all hover:bg-[#151518] focus:bg-[#1a1a1d] focus:ring-1 [&:-webkit-autofill]:bg-[#0f0f12] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#0f0f12_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white] ${errors.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-black/10 focus:border-zinc-500 focus:ring-black/10'
                      }`}
                  />
                  {/* Subtle inner shadow */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 h-8 w-8 text-zinc-500 transition-colors hover:text-black hover:bg-black/5"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="px-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full h-auto items-center justify-center gap-3 rounded-2xl bg-zinc-800/80 px-5 py-4 text-base font-semibold text-black shadow-sm ring-1 ring-inset ring-black/10 transition-all hover:bg-zinc-700/80 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent flex-shrink-0 group-hover:animate-[shimmer_1.5s_infinite]" />
                  {isLoading ? 'Authenticating...' : 'Sign in securely'}
                  {!isLoading && (
                    <ArrowRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-black" />
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center sm:text-left">
              <p className="text-xs text-zinc-500 leading-relaxed">
                By signing in, you agree to OneClick Ambulance's{' '}
                <a href="#" className="underline decoration-zinc-700 underline-offset-4 hover:text-zinc-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="underline decoration-zinc-700 underline-offset-4 hover:text-zinc-300">
                  Privacy Policy
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

