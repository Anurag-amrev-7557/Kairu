"use client";
import Link from "next/link";
import { memo } from "react";
import {
  Twitter,
  Linkedin,
  Github,
  Mail,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import Logo from "./Logo";

const footerLinks = Object.freeze({
  product: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/updates", label: "Updates" },
    { href: "/roadmap", label: "Roadmap" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ],
  resources: [
    { href: "/docs", label: "Documentation" },
    { href: "/help", label: "Help Center" },
    { href: "/community", label: "Community" },
    { href: "/api", label: "API" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/security", label: "Security" },
  ],
});

const socialLinks = Object.freeze([
  {
    href: "https://twitter.com/Orbitly",
    label: "Twitter",
    icon: Twitter,
  },
  {
    href: "https://linkedin.com/company/Orbitly",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "https://github.com/Orbitly",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "mailto:hello@Orbitly.app",
    label: "Email",
    icon: Mail,
  },
]);

const FooterLink = memo(({ href, children }) => (
  <Link
    href={href}
    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-md px-1 py-0.5"
  >
    {children}
  </Link>
));
FooterLink.displayName = "FooterLink";

const SocialLink = memo(({ href, label, Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
  >
    <Icon size={18} className="text-gray-700" />
  </a>
));
SocialLink.displayName = "SocialLink";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12 mb-12">
          {/* Brand Section - Spans 2 columns on desktop */}
          <div className="col-span-2 md:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 -ml-1 group mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-md"
            >
              <div className="h-9 w-9">
                <Logo size={36} />
              </div>
              <span className="font-semibold text-xl tracking-tight text-gray-900">
                Orbitly
              </span>
            </Link>
            <p className="text-gray-600 text-sm mb-6 max-w-xs leading-relaxed">
              Master your focus, track your progress, and achieve your goals
              with intelligent productivity tracking.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <SocialLink
                  key={social.href}
                  href={social.href}
                  label={social.label}
                  Icon={social.icon}
                />
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mb-12 pb-12 border-b border-gray-200">
          <div className="max-w-md">
            <h3 className="font-semibold text-gray-900 mb-2">Stay updated</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get the latest productivity tips and product updates.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-full border border-gray-300  bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm transition-all"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--background)] whitespace-nowrap"
              >
                Subscribe
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p className="flex items-center gap-1.5">
            © {currentYear} Orbitly. Made with{" "}
            <Heart
              size={14}
              strokeWidth={1.5}
              className="text-red-500 fill-red-500 inline-block"
            />{" "}
            for productivity enthusiasts.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/sitemap"
              className="hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-md px-1 py-0.5"
            >
              Sitemap
            </Link>
            <Link
              href="/status"
              className="hover:text-gray-900  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-md px-1 py-0.5"
            >
              Status
            </Link>
            <Link
              href="/accessibility"
              className="hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] rounded-md px-1 py-0.5"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
