"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sprout, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
import { signIn } from "next-auth/react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const justRegistered = params.get("registered") === "1";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("root", {
          message: "Login failed. Check your credentials.",
        });
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError("root", {
        message: "Login failed. Check your credentials.",
      });
    }
  };

  return (
    <div className="w-full max-w-md card p-8">
      <div className="mb-7">
        <h1 className="font-display font-bold text-xl text-stone-900">
          Welcome back
        </h1>
        <p className="text-stone-500 text-sm mt-1">Sign in to your workspace</p>
      </div>

      {justRegistered && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Account created! Sign in to get started.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            className="block text-xs font-semibold text-stone-700 mb-1.5"
            htmlFor="email"
          >
            Email address
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            className="input"
            placeholder="you@company.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-xs font-semibold text-stone-700 mb-1.5"
            htmlFor="password"
          >
            Password
          </label>
          <input
            {...register("password")}
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.password.message}
            </p>
          )}
        </div>

        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 mt-2"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-stone-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <Sprout className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-stone-900 text-lg tracking-tight">
          Agile PM
        </span>
      </Link>
      <Suspense
        fallback={<div className="w-full max-w-md card p-8 h-64 skeleton" />}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
