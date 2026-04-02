"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getFeaturedCharities } from "@/lib/charities";

export default function HomePage() {
  const [charities, setCharities] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    getFeaturedCharities().then(({ data }) => setCharities(data || []));
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/90 backdrop-blur-md border-b border-gray-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl"></span>
            <span className="font-bold text-lg">Golf Charity</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              How It Works
            </a>
            <a
              href="#charities"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Charities
            </a>
            <a
              href="#prizes"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Prizes
            </a>
            <Link
              href="/login"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2 rounded-full text-sm transition"
            >
              Get Started
            </Link>
          </div>
          {/* Mobile CTA */}
          <Link
            href="/signup"
            className="md:hidden bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-full text-sm transition"
          >
            Join Now
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Monthly draws now live
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Golf better.
            <br />
            <span className="text-green-400">Win prizes.</span>
            <br />
            Change lives.
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The platform where your golf scores enter you into monthly prize
            draws — while a portion of every subscription goes to a charity you
            choose.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-2xl text-lg transition transform hover:scale-105"
            >
              Start Playing →
            </Link>
            <a
              href="#how-it-works"
              className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition"
            >
              How It Works
            </a>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">
              Three simple steps to play, win and give back
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: "📋",
                title: "Subscribe & Choose",
                desc: "Pick a monthly or yearly plan. Select a charity to support with a portion of your subscription fee.",
                color: "border-green-500/30 bg-green-500/5",
              },
              {
                step: "02",
                icon: "⛳",
                title: "Enter Your Scores",
                desc: "Log your last 5 Stableford golf scores (1–45 points each). These are your draw numbers.",
                color: "border-blue-500/30 bg-blue-500/5",
              },
              {
                step: "03",
                icon: "🏆",
                title: "Win Every Month",
                desc: "Monthly draws match your scores against drawn numbers. Match 3, 4, or all 5 to win cash prizes.",
                color: "border-yellow-500/30 bg-yellow-500/5",
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`rounded-2xl p-8 border ${item.color} relative overflow-hidden`}
              >
                <span className="absolute top-4 right-4 text-6xl font-bold text-white/5">
                  {item.step}
                </span>
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE STRUCTURE ── */}
      <section id="prizes" className="py-24 px-6 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Prize Structure</h2>
            <p className="text-gray-400 text-lg">
              The more numbers you match, the more you win
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                match: "5 Numbers",
                share: "40%",
                prize: "Jackpot",
                rollover: true,
                color: "border-yellow-500 bg-yellow-500/10",
                badge: "bg-yellow-500 text-black",
                icon: "🏆",
              },
              {
                match: "4 Numbers",
                share: "35%",
                prize: "Second Prize",
                rollover: false,
                color: "border-blue-500/50 bg-blue-500/5",
                badge: "bg-blue-500 text-white",
                icon: "🥈",
              },
              {
                match: "3 Numbers",
                share: "25%",
                prize: "Third Prize",
                rollover: false,
                color: "border-purple-500/50 bg-purple-500/5",
                badge: "bg-purple-500 text-white",
                icon: "🥉",
              },
            ].map((tier) => (
              <div
                key={tier.match}
                className={`flex items-center justify-between p-6 rounded-2xl border ${tier.color}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{tier.icon}</span>
                  <div>
                    <p className="font-bold text-lg">{tier.match} Matched</p>
                    <p className="text-gray-400 text-sm">{tier.prize}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {tier.rollover && (
                    <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">
                      🔄 Jackpot Rollover
                    </span>
                  )}
                  <span
                    className={`text-lg font-bold px-4 py-2 rounded-xl ${tier.badge}`}
                  >
                    {tier.share}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Prize pool split equally among multiple winners in the same tier.
            60% of subscriptions go to prizes. 10%+ goes to charity.
          </p>
        </div>
      </section>

      {/* ── FEATURED CHARITIES ── */}
      {charities.length > 0 && (
        <section id="charities" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Causes We Support</h2>
              <p className="text-gray-400 text-lg">
                Choose a charity that matters to you. Every subscription
                contributes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {charities.map((charity) => (
                <div
                  key={charity.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 transition group"
                >
                  {charity.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={charity.image_url}
                        alt={charity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{charity.name}</h3>
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                        {charity.category}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {charity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/charities"
                className="text-green-400 hover:text-green-300 transition"
              >
                View all charities →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SUBSCRIPTION PLANS ── */}
      <section className="py-24 px-6 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-gray-400 text-lg">
              One platform. Two plans. Endless impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-1">Monthly</h3>
              <p className="text-gray-500 text-sm mb-6">Cancel anytime</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">$7.99</span>
                <span className="text-gray-400 ml-2">/ month</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-300 text-sm">
                {[
                  "Monthly prize draw entry",
                  "Track 5 Stableford scores",
                  "10%+ goes to your charity",
                  "Full dashboard access",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-3 rounded-xl transition"
              >
                Get Started
              </Link>
            </div>

            {/* Yearly */}
            <div className="bg-gray-900 border-2 border-green-500 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-green-500 text-black text-xs font-bold px-4 py-1.5 rounded-full">
                  BEST VALUE
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">Yearly</h3>
              <p className="text-gray-500 text-sm mb-6">
                Save $69.89 vs monthly
              </p>
              <div className="mb-6">
                <span className="text-5xl font-bold">$25.99</span>
                <span className="text-gray-400 ml-2">/ year</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-300 text-sm">
                {[
                  "Everything in Monthly",
                  "Priority draw entries",
                  "Exclusive yearly badge",
                  "Early access to features",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">
              Ready to play with purpose?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of golfers winning prizes and supporting charities
              every month.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold px-10 py-4 rounded-2xl text-lg transition transform hover:scale-105"
            >
              Join the Platform →
            </Link>
            <p className="text-gray-600 text-sm mt-4">
              No commitment · Cancel anytime · Secure payments via Stripe
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>⛳</span>
            <span className="font-bold">Golf Charity Platform</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/charities" className="hover:text-white transition">
              Charities
            </Link>
            <Link href="/subscribe" className="hover:text-white transition">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-white transition">
              Sign Up
            </Link>
          </div>
          <p className="text-gray-600 text-sm">© 2026 Golf Charity Platform</p>
        </div>
      </footer>
    </div>
  );
}
