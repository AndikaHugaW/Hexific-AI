"use client";

import { useState } from "react";
import { Shield, Menu, X, Github, Twitter } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./Header.module.css";
import GradientButton from "@/components/ui/button-1";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <a href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Shield size={24} />
          </div>
          <span className={styles.logoText}>Hexific</span>
        </a>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <a href="#features" className={styles.navLink}>
            Features
          </a>
          <a href="#pricing" className={styles.navLink}>
            Pricing
          </a>
          <a href="/docs" className={styles.navLink}>
            Docs
          </a>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <div className={styles.socialLinks}>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <Twitter size={20} />
            </a>
          </div>

          {/* RainbowKit Connect Button */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <GradientButton
                          onClick={openConnectModal}
                          width="160px"
                          height="42px"
                        >
                          Connect Wallet
                        </GradientButton>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <GradientButton
                          onClick={openChainModal}
                          width="160px"
                          height="42px"
                          className="!from-red-500 !to-red-600"
                        >
                          Wrong Network
                        </GradientButton>
                      );
                    }

                    return (
                      <GradientButton
                        onClick={openAccountModal}
                        width="160px"
                        height="42px"
                      >
                        {account.displayName}
                      </GradientButton>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={styles.mobileMenuButton}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <a href="#features" className={styles.mobileNavLink}>
              Features
            </a>
            <a href="#pricing" className={styles.mobileNavLink}>
              Pricing
            </a>
            <a href="/docs" className={styles.mobileNavLink}>
              Docs
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

