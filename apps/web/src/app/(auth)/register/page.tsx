"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sprout } from "lucide-react";
import api from "@/lib/api";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      router.push("/login?registered=1");
    } catch (err: any) {
      setError("root", {
        message:
          err.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <Sprout className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-stone-900 text-lg tracking-tight">
          Agile PM
        </span>
      </Link>

      <div className="w-full max-w-md card p-8">
        <div className="mb-7">
          <h1 className="font-display font-bold text-xl text-stone-900">
            Create your account
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Start managing projects in minutes
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold text-stone-700 mb-1.5"
              htmlFor="name"
            >
              Full name
            </label>
            <input
              {...register("name")}
              id="name"
              type="text"
              className="input"
              placeholder="Ada Lovelace"
              autoComplete="name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.name.message}
              </p>
            )}
          </div>

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
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-xs font-semibold text-stone-700 mb-1.5"
              htmlFor="confirm"
            >
              Confirm password
            </label>
            <input
              {...register("confirm")}
              id="confirm"
              type="password"
              className="input"
              placeholder="Repeat password"
              autoComplete="new-password"
            />
            {errors.confirm && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.confirm.message}
              </p>
            )}
          </div>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5 mt-2"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
