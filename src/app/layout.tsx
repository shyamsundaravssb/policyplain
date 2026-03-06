import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PolicyPlain — Legal Policies in Plain English",
  description:
    "Understand what you're actually agreeing to. PolicyPlain simplifies privacy policies and terms of service into plain English with risk scores and version history.",
  keywords:
    "privacy policy, terms of service, plain english, policy analysis, risk score",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Navigation */}
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="nav-logo">
              Policy<span>Plain</span>
            </Link>
            <ul className="nav-links">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/rankings">Rankings</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <h3>
                Policy
                <span style={{ color: "var(--accent-green)" }}>Plain</span>
              </h3>
              <p>
                Making legal policies understandable for everyone. Every policy
                simplified, scored, and tracked — so you know exactly what
                you&apos;re agreeing to.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Navigate</h4>
                <ul>
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <Link href="/rankings">Rankings</Link>
                  </li>
                  <li>
                    <Link href="/about">How It Works</Link>
                  </li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <ul>
                  <li>
                    <Link href="/about">About</Link>
                  </li>
                  <li>
                    <Link href="/about#methodology">Methodology</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="disclaimer-bar">
            ⚖️ This is an AI-generated summary for informational purposes only.
            Not legal advice. Always read the original policy before making
            decisions.
          </div>
        </footer>
      </body>
    </html>
  );
}
