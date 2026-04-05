"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(form);
      router.push("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#e0e7ff_100%)] p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-32 top-12 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <Card className="motion-scale-in surface-card relative w-full max-w-md border-0">
        <Link href="/" className="absolute left-4 top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Home
          </Button>
        </Link>
        <Link href="/register" className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="text-violet-600 hover:bg-violet-50 hover:text-violet-700"
          >
            Sign Up
          </Button>
        </Link>

        <CardHeader className="space-y-1 pb-6 pt-12">
          <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center text-slate-500 dark:text-slate-400">
            Sign in to resume your prioritized workflow.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="you@example.com"
                required
                className="h-11 bg-slate-50 focus-visible:ring-violet-500 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="text-sm text-violet-600 hover:text-violet-700"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="••••••••"
                required
                className="h-11 bg-slate-50 focus-visible:ring-violet-500 dark:bg-slate-900"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-violet-600 hover:text-violet-700"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
