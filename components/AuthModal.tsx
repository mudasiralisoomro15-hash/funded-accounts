"use client";

import { useEffect, useState } from "react";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { GoogleIcon } from "./icons";
import { useAuth } from "./AuthProvider";
import { useSiteConfig } from "./SiteConfigProvider";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  type AuthResult,
} from "@/lib/auth";
import { createOrder } from "@/lib/db";
import { createCheckoutSession } from "@/lib/payments";
import { formatSize, formatUSD, getModel, type PlanSelection } from "@/lib/plans";
import type { AppUser } from "@/lib/types";

export type AuthMode = "signin" | "signup";

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  order: PlanSelection | null;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}

type Field = { icon: LucideIcon; label: string; rightSlot?: ReactNode } & InputHTMLAttributes<HTMLInputElement>;

function FormField({ icon: Icon, label, rightSlot, ...props }: Field) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          {...props}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-11 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 sm:text-sm"
        />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </span>
    </label>
  );
}

export default function AuthModal({ open, mode, order, onClose, onModeChange }: AuthModalProps) {
  const { user, signOut } = useAuth();
  const { config } = useSiteConfig();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState<"email" | "google" | "order" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ title: string; text: string } | null>(null);

  // Lock page scroll + close on Escape while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Fresh status whenever the modal opens or the tab changes.
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setPassword("");
    setShowPw(false);
  }, [mode, open]);

  if (!open) return null;

  const isSignup = mode === "signup";
  const model = order ? getModel(order.modelId, config.models) : null;
  // Already logged in and buying -> skip the form and just confirm the order.
  const confirmOnly = !!user && !!order && !success && loading === null;

  function validate(): string | null {
    if (isSignup && name.trim().length < 2) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  }

  /** Saves the order in the database. Returns the payment-step message. */
  async function placeOrder(u: AppUser): Promise<string> {
    if (!order || !model) return "";
    await createOrder({
      userId: u.uid,
      email: u.email,
      name: u.name,
      modelId: order.modelId,
      modelName: model.name,
      size: order.size,
      price: order.price,
    });
    const checkout = await createCheckoutSession(order, u.email);
    return checkout.message;
  }

  function orderSummary(): string {
    return order && model
      ? `${model.name} ${formatSize(order.size)} (${formatUSD(order.price)})`
      : "";
  }

  async function finishAuth(res: AuthResult) {
    if (!res.ok || !res.user) {
      setError(res.message);
      return;
    }
    if (order && model) {
      const paymentMsg = await placeOrder(res.user);
      setSuccess({
        title: "Order request received",
        text: `${orderSummary()} has been saved to your account. ${paymentMsg}`,
      });
      return;
    }
    setSuccess({ title: isSignup ? "Account created" : "Signed in", text: res.message });
  }

  function errorText(err: unknown): string {
    return err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setLoading("email");
    try {
      const res = isSignup
        ? await signUpWithEmail(name.trim(), email.trim(), password)
        : await signInWithEmail(email.trim(), password);
      await finishAuth(res);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading("google");
    try {
      await finishAuth(await signInWithGoogle());
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(null);
    }
  }

  async function handleConfirmOrder() {
    if (!user) return;
    setError(null);
    setLoading("order");
    try {
      const paymentMsg = await placeOrder(user);
      setSuccess({
        title: "Order request received",
        text: `${orderSummary()} has been saved to your account. ${paymentMsg}`,
      });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(null);
    }
  }

  const selectionBox =
    order && model ? (
      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
        <div>
          <p className="text-xs text-emerald-300/80">Your selection</p>
          <p className="text-sm font-semibold text-white">
            {model.name} · {formatSize(order.size)}
          </p>
        </div>
        <p className="font-display text-xl font-bold text-emerald-400">{formatUSD(order.price)}</p>
      </div>
    ) : null;

  const errorBox = error ? (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {error}
    </p>
  ) : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative max-h-[94vh] w-full max-w-md animate-modal-in overflow-y-auto rounded-t-3xl border border-emerald-500/20 bg-[#0D1320] shadow-glow-lg sm:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          {success ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 shadow-glow">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 id="auth-title" className="mt-5 font-display text-2xl font-bold text-white">
                {success.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{success.text}</p>
              <Link href="/dashboard" onClick={onClose} className="btn-glow mt-6 w-full">
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full rounded-xl border border-white/10 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
              >
                Close
              </button>
            </div>
          ) : confirmOnly && user ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Confirm your order
              </span>
              <h2 id="auth-title" className="mt-3 font-display text-2xl font-bold text-white">
                Hi {user.name}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                You are signed in as <span className="text-slate-200">{user.email}</span>.
              </p>
              {selectionBox}
              <div className="mt-5 space-y-4">
                {errorBox}
                <button type="button" onClick={handleConfirmOrder} className="btn-glow w-full">
                  Confirm Order
                </button>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="w-full text-center text-xs text-slate-500 transition hover:text-slate-300"
                >
                  Not you? Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Client Portal
              </span>
              <h2 id="auth-title" className="mt-3 font-display text-2xl font-bold text-white">
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {isSignup
                  ? "Sign up to buy your funded account in minutes."
                  : "Sign in to access your dashboard and accounts."}
              </p>

              {selectionBox}

              {/* Sign in / Create account toggle */}
              <div
                role="tablist"
                aria-label="Authentication mode"
                className="mt-5 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1"
              >
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => onModeChange(m)}
                    className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                      mode === m
                        ? "bg-emerald-500/20 text-emerald-300 shadow-glow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading !== null}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading === "google" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <GoogleIcon className="h-5 w-5" />
                )}
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
                <span className="h-px flex-1 bg-white/10" />
                Or continue with email
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {isSignup && (
                  <FormField
                    icon={User}
                    label="Full name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
                <FormField
                  icon={Mail}
                  label="Email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormField
                  icon={Lock}
                  label="Password"
                  type={showPw ? "text" : "password"}
                  name="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:text-white"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />

                {errorBox}

                <button type="submit" disabled={loading !== null} className="btn-glow w-full">
                  {loading === "email" && <Loader2 className="h-5 w-5 animate-spin" />}
                  {isSignup ? "Create Account" : "Sign In"}
                </button>
              </form>

              <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
                By signing up, you agree to our{" "}
                <a href="#" className="text-slate-300 underline underline-offset-2 hover:text-white">
                  Terms of Service
                </a>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
