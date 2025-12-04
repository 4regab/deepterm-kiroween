"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { imgLogo } from "@/config/assets";
import { createClient } from "@/config/supabase/client";
import { PublicPageWrapper } from "@/components/SpookyTheme";
import { useThemeStore } from "@/lib/stores";
import SpookyLogo from "@/components/SpookyLogo";

type AuthMode = "login" | "signup";

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function LoginPage() {
  const theme = useThemeStore((state) => state.theme);
  const isSpooky = theme === "spooky";
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (mode === "signup" && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, mode]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
    } catch {
      setErrors({ general: "Failed to connect with Google. Please try again." });
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");
    
    try {
      const supabase = createClient();
      
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) throw error;
        setSuccessMessage("Check your email for a confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setErrors({});
    setSuccessMessage("");
    setForm({ email: "", password: "", confirmPassword: "" });
  };

  return (
    <PublicPageWrapper>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Panel - Auth Form */}
        <div className={`flex-1 flex flex-col px-6 sm:px-12 lg:px-16 xl:px-20 py-8 ${
          isSpooky ? "bg-[#0d0f14]" : "bg-[#f0f0ea]"
        }`}>
          {/* Back Button */}
          <Link 
            href="/" 
            className={`flex items-center gap-2 w-fit mb-8 transition-colors ${
              isSpooky ? "text-white/70 hover:text-white" : "text-[#171d2b]/70 hover:text-[#171d2b]"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>

          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 flex items-center justify-center">
              {isSpooky ? (
                <SpookyLogo className="w-8 h-8 text-purple-500" />
              ) : (
                <Image alt="Deepterm Logo" src={imgLogo} width={32} height={32} />
              )}
            </div>
            <span className={`font-sora text-xl ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>deepterm</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <h2 className={`font-serif text-3xl sm:text-4xl mb-2 ${
                isSpooky ? "text-white" : "text-[#171d2b]"
              }`}>
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className={`text-base ${isSpooky ? "text-white/60" : "text-[#171d2b]/60"}`}>
                {mode === "login"
                  ? "Sign in to continue your learning journey"
                  : "Start your journey to smarter studying"
                }
              </p>
            </motion.div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`w-full h-14 rounded-2xl font-medium text-base flex items-center justify-center gap-3 transition-all duration-200 mb-6 ${
                isSpooky
                  ? "bg-[#1a1525] text-white border border-white/20 hover:bg-white/10 hover:border-white/30"
                  : "bg-white text-[#171d2b] border border-[#171d2b]/10 hover:bg-[#171d2b]/5 hover:border-[#171d2b]/20 shadow-sm"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`flex-1 h-px ${isSpooky ? "bg-white/20" : "bg-[#171d2b]/10"}`} />
              <span className={`text-sm ${isSpooky ? "text-white/50" : "text-[#171d2b]/50"}`}>or</span>
              <div className={`flex-1 h-px ${isSpooky ? "bg-white/20" : "bg-[#171d2b]/10"}`} />
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-6 p-4 rounded-xl text-sm ${
                    isSpooky
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-6 p-4 rounded-xl text-sm ${
                    isSpooky
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Email Input */}
              <div>
                <div className={`relative rounded-xl overflow-hidden transition-all ${
                  errors.email
                    ? isSpooky ? "ring-2 ring-red-500/50" : "ring-2 ring-red-500"
                    : ""
                }`}>
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                    isSpooky ? "text-white/50" : "text-[#171d2b]/40"
                  }`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full h-14 pl-12 pr-4 text-base outline-none transition-colors ${
                      isSpooky
                        ? "bg-[#1a1525] text-white placeholder:text-white/40 focus:bg-[#1f1a2e] border border-white/10"
                        : "bg-white text-[#171d2b] placeholder:text-[#171d2b]/40 focus:bg-white border border-[#171d2b]/10"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className={`mt-2 text-sm ${isSpooky ? "text-red-400" : "text-red-600"}`}>{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className={`relative rounded-xl overflow-hidden transition-all ${
                  errors.password
                    ? isSpooky ? "ring-2 ring-red-500/50" : "ring-2 ring-red-500"
                    : ""
                }`}>
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                    isSpooky ? "text-white/50" : "text-[#171d2b]/40"
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`w-full h-14 pl-12 pr-12 text-base outline-none transition-colors ${
                      isSpooky
                        ? "bg-[#1a1525] text-white placeholder:text-white/40 focus:bg-[#1f1a2e] border border-white/10"
                        : "bg-white text-[#171d2b] placeholder:text-[#171d2b]/40 focus:bg-white border border-[#171d2b]/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                      isSpooky ? "text-white/50 hover:text-white/70" : "text-[#171d2b]/40 hover:text-[#171d2b]/60"
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className={`mt-2 text-sm ${isSpooky ? "text-red-400" : "text-red-600"}`}>{errors.password}</p>
                )}
              </div>

              {/* Confirm Password (Signup only) */}
              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`relative rounded-xl overflow-hidden transition-all ${
                      errors.confirmPassword
                        ? isSpooky ? "ring-2 ring-red-500/50" : "ring-2 ring-red-500"
                        : ""
                    }`}>
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        isSpooky ? "text-white/50" : "text-[#171d2b]/40"
                      }`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className={`w-full h-14 pl-12 pr-12 text-base outline-none transition-colors ${
                          isSpooky
                            ? "bg-[#1a1525] text-white placeholder:text-white/40 focus:bg-[#1f1a2e] border border-white/10"
                            : "bg-white text-[#171d2b] placeholder:text-[#171d2b]/40 focus:bg-white border border-[#171d2b]/10"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                          isSpooky ? "text-white/50 hover:text-white/70" : "text-[#171d2b]/40 hover:text-[#171d2b]/60"
                        }`}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className={`mt-2 text-sm ${isSpooky ? "text-red-400" : "text-red-600"}`}>{errors.confirmPassword}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot Password Link (Login only) */}
              {mode === "login" && (
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className={`text-sm transition-colors ${
                      isSpooky ? "text-white/70 hover:text-white" : "text-[#171d2b]/60 hover:text-[#171d2b]"
                    }`}
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full h-14 rounded-2xl font-sora font-medium text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                  isSpooky
                    ? "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/25"
                    : "bg-[#171d2b] text-white hover:bg-[#2a3347] shadow-lg shadow-[#171d2b]/25"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign in" : "Create account"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Switch Mode */}
            <p className={`mt-8 text-center text-sm ${isSpooky ? "text-white/70" : "text-[#171d2b]/60"}`}>
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={switchMode}
                className={`font-medium transition-colors ${
                  isSpooky ? "text-white hover:text-white/80" : "text-[#171d2b] hover:text-[#171d2b]/80"
                }`}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>

            {/* Terms */}
            <p className={`mt-6 text-center text-xs ${isSpooky ? "text-white/60" : "text-[#171d2b]/50"}`}>
              By continuing, you agree to our{" "}
              <Link href="/terms" className={`underline ${isSpooky ? "text-white/70 hover:text-white" : "text-[#171d2b]/60 hover:text-[#171d2b]/80"}`}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className={`underline ${isSpooky ? "text-white/70 hover:text-white" : "text-[#171d2b]/60 hover:text-[#171d2b]/80"}`}>
                Privacy Policy
              </Link>
            </p>
          </div>
          </div>
        </div>

        {/* Right Panel - Branding & Features */}
        <div className={`hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden ${
          isSpooky ? "bg-[#0a0b0f]" : "bg-[#171d2b]"
        }`}>
          {/* Content Container */}
          <div className="relative z-10 flex flex-col justify-center h-full w-full p-12 xl:p-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl"
            >
              {/* Logo - aligned with content */}
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit mb-12">
                {isSpooky ? (
                  <SpookyLogo className="w-10 h-10 text-purple-400" />
                ) : (
                  <Image alt="Deepterm Logo" src={imgLogo} width={40} height={40} className="brightness-0 invert" />
                )}
                <span className="font-sora text-2xl text-white">deepterm</span>
              </Link>

              {/* Headline - 40% larger */}
              <h1 
                className="text-white text-5xl xl:text-6xl leading-[1.1] mb-6"
                style={{ fontFamily: '"Source Serif 4", serif' }}
              >
                Study smarter,{" "}
                <span className={`italic ${isSpooky ? "text-purple-400" : "text-white/70"}`}>
                  not harder
                </span>
              </h1>

              {/* Description - larger */}
              <p className="text-white/60 text-xl leading-relaxed mb-10">
                Transform any PDF or notes into flashcards, reviewers, and practice tests with AI.
              </p>

              {/* Feature list - larger text */}
              <div className="space-y-4 mb-12">
                {[
                  "Generate flashcards instantly",
                  "Create smart study guides",
                  "Track progress with XP",
                ].map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <svg className={`w-5 h-5 shrink-0 ${isSpooky ? "text-purple-400" : "text-white/60"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/60 text-lg">{text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats row - larger */}
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-white text-xl font-semibold">Free</p>
                  <p className="text-white/40 text-sm">Forever</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-white text-xl font-semibold">Open Source</p>
                  <p className="text-white/40 text-sm">MIT License</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-white text-xl font-semibold">10/day</p>
                  <p className="text-white/40 text-sm">AI Generations</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PublicPageWrapper>
  );
}
