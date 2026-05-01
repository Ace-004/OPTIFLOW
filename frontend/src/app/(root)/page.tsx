"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LuArrowRight as ArrowRight,
  LuChartBar as BarChart3,
  LuClock3 as Clock3,
  LuGithub as Github,
  LuLightbulb as Lightbulb,
  LuLinkedin as Linkedin,
  LuFileChartPie as PieChart,
  LuShield as Shield,
  LuTwitter as Twitter,
  LuZap as Zap,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (loading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-violet-100 text-violet-700 hover:bg-violet-100 border-violet-200">
            Powered by AI
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            Smart Workflow
            <span className="block bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform your productivity with adaptive task prioritization,
            intelligent behavior analysis, and dynamic scheduling that learns
            from you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/30 px-8 py-6 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your workflow and boost
              efficiency.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                icon: Lightbulb,
                title: "AI-Powered Prioritization",
                description:
                  "Our application analyzes your tasks and automatically prioritizes them based on urgency, importance, and your work patterns.",
              },
              {
                icon: BarChart3,
                title: "Behavior Analysis",
                description:
                  "Learn from your habits and patterns to suggest optimal work schedules and task sequences.",
              },
              {
                icon: Clock3,
                title: "Dynamic Scheduling",
                description:
                  "Automatically adjust your schedule in real-time based on changing priorities and deadlines.",
              },
              {
                icon: PieChart,
                title: "Analytics Dashboard",
                description:
                  "Get insights into your productivity trends with comprehensive analytics and reports.",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description:
                  "Your data is encrypted and protected. We never share your information with third parties.",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-linear-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center text-white mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
              How it Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Get started in minutes
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to transform your productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-linear-to-r from-violet-300 via-indigo-300 to-purple-300" />

            {[
              {
                step: "01",
                title: "Create Your Account",
                description:
                  "Sign up in seconds with your email or connect with your favorite productivity tools.",
              },
              {
                step: "02",
                title: "Add Your Tasks",
                description:
                  "Icreate new tasks. Our application starts adapting to your behavior accordingly.",
              },
              {
                step: "03",
                title: "Let AI Optimize",
                description:
                  "Sit back as OptiFlow intelligently prioritizes and schedules your work for maximum efficiency.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-linear-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-lg shadow-violet-500/30 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-linear-to-r from-violet-600 to-indigo-600 rounded-3xl p-12 md:p-16 shadow-2xl shadow-violet-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to boost your productivity?
            </h2>
            <p className="text-violet-100 text-lg mb-8 max-w-xl mx-auto">
              Join us and let our application transform your workflow
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-violet-600 hover:bg-violet-50 px-8 py-6 text-lg font-semibold"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">OptiFlow</span>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered workflow optimization for modern teams and
                professionals.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; 2026 OptiFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
