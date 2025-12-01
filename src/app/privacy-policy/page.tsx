"use client";

import Link from "next/link";
import { imgLogo } from "@/config/assets";
import { PublicPageWrapper } from "@/components/SpookyTheme";
import { useThemeStore } from "@/lib/stores";

export default function PrivacyPolicyPage() {
  const theme = useThemeStore((state) => state.theme);
  const isSpooky = theme === "spooky";
  
  return (
    <PublicPageWrapper>
    <div className="min-h-screen">
      {/* Header */}
      <header className={`px-4 sm:px-6 lg:px-8 py-4 border-b ${isSpooky ? "border-purple-500/20" : "border-[#171d2b]/10"}`}>
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-[28px] h-[28px] flex items-center justify-center">
              <div className="rotate-[292deg]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Deepterm Logo" className={`w-[22px] h-[22px] ${isSpooky ? "brightness-150" : ""}`} src={imgLogo} />
              </div>
            </div>
            <span className={`font-sora text-[18px] ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>deepterm</span>
          </Link>
          <Link href="/" className={`font-sans text-[14px] transition-colors ${isSpooky ? "text-purple-300/60 hover:text-purple-100" : "text-[#171d2b]/60 hover:text-[#171d2b]"}`}>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="max-w-[800px] mx-auto">
          <h1 className={`font-serif text-[28px] sm:text-[36px] lg:text-[42px] mb-2 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
            Privacy Policy
          </h1>
          <p className={`font-sans text-[13px] sm:text-[14px] mb-8 ${isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"}`}>
            Last updated: November 2025
          </p>

          <div className={`space-y-8 font-sans text-[14px] sm:text-[15px] leading-[1.7] ${isSpooky ? "text-purple-300/80" : "text-[#171d2b]/80"}`}>
            <section>
              <h2 className={`font-serif text-[18px] sm:text-[20px] mb-3 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>1. Information We Collect</h2>
              <p className="mb-3">We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account information (email, name) when you sign up</li>
                <li>Study materials you upload for processing</li>
                <li>Usage data and preferences</li>
                <li>Feedback and communications</li>
              </ul>
            </section>

            <section>
              <h2 className={`font-serif text-[18px] sm:text-[20px] mb-3 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your study materials with AI</li>
                <li>Send you updates and notifications</li>
                <li>Respond to your requests and support needs</li>
              </ul>
            </section>

            <section>
              <h2 className={`font-serif text-[18px] sm:text-[20px] mb-3 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>3. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information. 
                However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className={`font-serif text-[18px] sm:text-[20px] mb-3 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>4. Third-Party Services</h2>
              <p>
                We may use third-party services for authentication (Google Sign-In) and AI processing. 
                These services have their own privacy policies governing the use of your information.
              </p>
            </section>

            <section>
              <h2 className={`font-serif text-[18px] sm:text-[20px] mb-3 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>5. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access your personal data</li>
                <li>Request correction of your data</li>
                <li>Request deletion of your account</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className={`font-serif text-[18px] sm:text-[20px] mb-3 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>6. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:deeptermai@gmail.com" className={`underline hover:no-underline ${isSpooky ? "text-purple-400" : "text-[#171d2b]"}`}>
                  deeptermai@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
    </PublicPageWrapper>
  );
}
