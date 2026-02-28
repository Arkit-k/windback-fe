"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@windback/ui";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { RiveLoginCharacter } from "@/components/animations/rive-login-character";
import { ConfettiBurst } from "@/components/animations/confetti-burst";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const { register } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register.mutate({ email, name, password });
  }

  useEffect(() => {
    if (register.isSuccess) setShowSuccess(true);
  }, [register.isSuccess]);

  useEffect(() => {
    if (register.isError) {
      setShowFail(true);
      const t = setTimeout(() => setShowFail(false), 100);
      return () => clearTimeout(t);
    }
  }, [register.isError]);

  return (
    <Card className="relative w-full max-w-md overflow-visible border-0 bg-transparent text-white shadow-none lg:border lg:border-border/70 lg:bg-card lg:text-card-foreground lg:shadow-sm">
      <ConfettiBurst trigger={showSuccess} className="z-50" />
      <div className="mx-auto mb-2 hidden h-32 w-32 sm:-mt-16 sm:block">
        <RiveLoginCharacter
          emailInputRef={emailRef}
          isPasswordFocused={isPasswordFocused}
          triggerSuccess={showSuccess}
          triggerFail={showFail}
          className="h-full w-full"
        />
      </div>
      <CardHeader className="space-y-2 pt-0">
        <CardTitle className="text-3xl font-bold tracking-tight">Create your account</CardTitle>
        <CardDescription className="text-white/75 lg:text-muted-foreground">
          Start recovering churned customers in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/90 lg:text-foreground">Name</Label>
            <Input
              id="name"
              className="border-white/25 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white/40 lg:border-input lg:bg-background lg:text-foreground lg:placeholder:text-muted-foreground"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90 lg:text-foreground">Email</Label>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              className="border-white/25 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white/40 lg:border-input lg:bg-background lg:text-foreground lg:placeholder:text-muted-foreground"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/90 lg:text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              className="border-white/25 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white/40 lg:border-input lg:bg-background lg:text-foreground lg:placeholder:text-muted-foreground"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              minLength={8}
              required
            />
          </div>
          {register.error && (
            <p className="text-sm text-destructive">{register.error.message}</p>
          )}
          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? "Creating account..." : "Create Account"}
          </Button>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20 lg:border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-white/70 lg:bg-card lg:text-muted-foreground">or</span>
            </div>
          </div>
          <a
            href="/api/auth/oauth/google"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/25 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0 lg:border-input lg:bg-background lg:text-foreground lg:ring-offset-background lg:hover:bg-accent lg:hover:text-accent-foreground lg:focus-visible:ring-ring lg:focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </a>
        </form>
        <p className="mt-4 text-center text-sm text-white/80 lg:text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

