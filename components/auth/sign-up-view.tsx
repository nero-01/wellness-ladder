"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Apple, Chrome, Eye, EyeOff, Facebook, Loader2, Twitter } from "lucide-react"
import { useForm, type FieldErrors } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import type { OAuthProviderId } from "@/lib/auth"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { isPlausibleMailbox, sanitizeAuthEmailForSupabase } from "@/lib/auth-email"
import { cn } from "@/lib/utils"

const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name"),
    email: z.preprocess(
      (v) => (typeof v === "string" ? sanitizeAuthEmailForSupabase(v) : ""),
      z
        .string()
        .min(3, "Enter your email")
        .email("Enter a valid email")
        .refine(isPlausibleMailbox, {
          message:
            "That email looks incomplete. Check the domain (e.g. gmail.com).",
        }),
    ),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirmPassword"],
      })
    }
    if (data.password.length >= 8) {
      const hasLetter = /[A-Za-z]/.test(data.password)
      const hasDigit = /\d/.test(data.password)
      if (!hasLetter || !hasDigit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Weak password",
          path: ["password"],
        })
      }
    }
  })

export type SignUpFormValues = z.infer<typeof signUpSchema>

const floatingLabel =
  "absolute left-3 top-1/2 z-10 -translate-y-1/2 pointer-events-none text-muted-foreground transition-all duration-200 " +
  "peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-primary " +
  "peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px]"

/** Premium sign-up screen: confirm password, OAuth, floating labels, gradient shell. */
export function SignUpView() {
  const { signUp, signInWithOAuth } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [showAppleOauth, setShowAppleOauth] = useState(false)
  const prevMismatch = useRef(false)
  const submitInFlight = useRef(false)

  useEffect(() => {
    setShowAppleOauth(
      typeof navigator !== "undefined" &&
        /iPhone|iPad|iPod/i.test(navigator.userAgent),
    )
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const err = params.get("error")
    if (!err) return
    const hints: Record<string, string> = {
      auth: "That confirmation link is invalid or expired. Request a new one from Supabase or sign up again.",
      oauth: "Social sign-in was cancelled or failed.",
      no_client:
        "Supabase client unavailable. Check NEXT_PUBLIC_SUPABASE_URL and anon key (JWT eyJ…).",
    }
    toast.error(hints[err] ?? decodeURIComponent(err))
    router.replace(window.location.pathname, { scroll: false })
  }, [router])

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  const password = form.watch("password")
  const confirmPassword = form.watch("confirmPassword")
  const mismatchLive =
    confirmPassword.length > 0 && password !== confirmPassword

  useEffect(() => {
    if (mismatchLive && !prevMismatch.current) {
      setShakeKey((k) => k + 1)
    }
    prevMismatch.current = mismatchLive
  }, [mismatchLive])

  async function onOAuth(provider: OAuthProviderId) {
    try {
      await signInWithOAuth(provider)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start social sign-in")
    }
  }

  async function onValid(values: SignUpFormValues) {
    if (submitInFlight.current) return
    submitInFlight.current = true
    setLoading(true)
    try {
      const { needsEmailConfirmation } = await signUp(
        values.email,
        values.password,
        values.name || values.email.split("@")[0] || "User",
      )
      if (needsEmailConfirmation) {
        toast.success(
          "Check your email — we sent a confirmation link to finish onboarding.",
          { duration: 6000 },
        )
        return
      }
      toast.success("Welcome! You're on the ladder.")
      router.push("/")
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed"
      if (/password|weak|short/i.test(msg)) {
        toast.error("Weak password")
      } else {
        toast.error(msg)
      }
    } finally {
      submitInFlight.current = false
      setLoading(false)
    }
  }

  function onInvalid(errors: FieldErrors<SignUpFormValues>) {
    if (errors.password?.message === "Weak password") {
      toast.error("Weak password")
    }
    if (errors.confirmPassword?.message === "Passwords don't match") {
      toast.error("Passwords don't match")
    }
  }

  return (
    <div className="min-h-[100dvh] min-h-screen flex flex-col bg-gradient-to-br from-violet-100/90 via-background to-emerald-100/80 dark:from-violet-950/35 dark:via-background dark:to-emerald-950/25">
      <div
        className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:py-12"
        style={{
          paddingTop: "max(2rem, env(safe-area-inset-top))",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-6 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight bg-gradient-to-r from-primary via-violet-600 to-emerald-600 bg-clip-text text-transparent">
              Sign up for free ladder
            </h1>
            <p className="text-sm text-muted-foreground">
              One tiny wellness step daily — start your streak today.
            </p>
          </div>

          <Card className="border-border/60 shadow-lg shadow-primary/5 backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Create account</CardTitle>
              <CardDescription>
                Email and password, or continue with a provider below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onValid, onInvalid)}
                  className="space-y-4"
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="relative space-y-0">
                        <FormControl>
                          <Input
                            {...field}
                            autoComplete="name"
                            inputMode="text"
                            placeholder=" "
                            className="peer h-[52px] pt-5 pb-2 placeholder:text-transparent"
                          />
                        </FormControl>
                        <FormLabel className={floatingLabel}>Name</FormLabel>
                        <FormMessage className="mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="relative space-y-0">
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            placeholder=" "
                            className="peer h-[52px] pt-5 pb-2 placeholder:text-transparent"
                          />
                        </FormControl>
                        <FormLabel className={floatingLabel}>Email</FormLabel>
                        <FormMessage className="mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="relative space-y-0">
                        <div className="relative">
                          <FormControl>
                            <Input
                              {...field}
                              type={showPw ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder=" "
                              className="peer h-[52px] pt-5 pb-2 pr-11 placeholder:text-transparent"
                            />
                          </FormControl>
                          <FormLabel className={floatingLabel}>Password</FormLabel>
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            onClick={() => setShowPw((s) => !s)}
                            aria-label={showPw ? "Hide password" : "Show password"}
                          >
                            {showPw ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <FormMessage className="mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <motion.div
                          key={shakeKey}
                          animate={
                            mismatchLive
                              ? { x: [0, -8, 8, -6, 6, 0] }
                              : { x: 0 }
                          }
                          transition={{ duration: 0.45, ease: "easeInOut" }}
                          className="relative space-y-1"
                        >
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                type={showConfirm ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder=" "
                                aria-invalid={mismatchLive}
                                className={cn(
                                  "peer h-[52px] pt-5 pb-2 pr-11 placeholder:text-transparent",
                                  mismatchLive &&
                                    "border-destructive ring-1 ring-destructive/40",
                                )}
                              />
                            </FormControl>
                            <FormLabel
                              className={cn(
                                floatingLabel,
                                mismatchLive && "text-destructive",
                              )}
                            >
                              Confirm password
                            </FormLabel>
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              onClick={() => setShowConfirm((s) => !s)}
                              aria-label={
                                showConfirm
                                  ? "Hide confirm password"
                                  : "Show confirm password"
                              }
                            >
                              {showConfirm ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <AnimatePresence mode="wait">
                            {mismatchLive ? (
                              <motion.p
                                key="mismatch"
                                role="alert"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-sm font-medium text-destructive pl-0.5"
                              >
                                Passwords don&apos;t match
                              </motion.p>
                            ) : null}
                          </AnimatePresence>
                          <FormMessage className="mt-1" />
                        </motion.div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={loading || mismatchLive}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      "Sign up"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground whitespace-nowrap">
                  Or continue with
                </span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-[140px] flex-1 justify-center gap-2 sm:flex-initial"
                  onClick={() => void onOAuth("google")}
                >
                  <Chrome className="h-4 w-4 shrink-0 text-[#4285F4]" />
                  Google
                </Button>
                {showAppleOauth ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-[140px] flex-1 justify-center gap-2 sm:flex-initial"
                    onClick={() => void onOAuth("apple")}
                  >
                    <Apple className="h-4 w-4 shrink-0" />
                    Apple
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-[140px] flex-1 justify-center gap-2 sm:flex-initial"
                  onClick={() => void onOAuth("facebook")}
                >
                  <Facebook className="h-4 w-4 shrink-0 text-[#1877F2]" />
                  Facebook
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-[140px] flex-1 justify-center gap-2 sm:flex-initial"
                  onClick={() => void onOAuth("twitter")}
                >
                  <Twitter className="h-4 w-4 shrink-0" />
                  X
                </Button>
              </div>
              {!showAppleOauth ? (
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Apple sign-in is available on iPhone and iPad.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
