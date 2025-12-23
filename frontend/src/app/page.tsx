"use client";

import { useState } from "react";
import {
  FileArchive,
  Link2,
  Shield,
  Zap,
  Bot,
  Lock,
  TrendingUp,
  ChevronRight,
  Star,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import AddressInput from "@/components/AddressInput";
import AuditReport from "@/components/AuditReport";
import AIChat from "@/components/AIChat";
import SyntheticHero from "@/components/ui/synthetic-hero";
import HexificFeatureGrid from "@/components/ui/feature-grid-enterprise-grade";
import { PricingSection, HEXIFIC_PLANS } from "@/components/ui/pricing";
import styles from "./page.module.css";

type AuditMode = "zip" | "address";

interface AuditResult {
  success: boolean;
  audit_type: string;
  tier: string;
  results: {
    vulnerabilities: {
      id: string;
      title: string;
      severity: "critical" | "high" | "medium" | "low" | "informational";
      confidence?: string;
      description: string;
      locations?: {
        file: string;
        lines: number[];
        type: string;
        name: string;
      }[];
    }[];
    summary?: {
      total: number;
      by_severity?: {
        high: number;
        medium: number;
        low: number;
        informational: number;
      };
    };
    raw_output?: string;
    raw_response?: string;
  };
  contract?: {
    address: string;
    network: string;
    name: string;
    compiler?: string;
    is_proxy?: boolean;
  };
}

export default function Home() {
  const [activeMode, setActiveMode] = useState<AuditMode>("zip");
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [remainingQueries, setRemainingQueries] = useState(3);

  const API_URL = "/api/backend";
  console.log("Using Proxy API_URL:", API_URL);

  const handleZipUpload = async (file: File) => {
    setIsLoading(true);
    setAuditResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/audit/`, {
        method: "POST",
        body: formData,
      });

      // Try to parse as JSON, but handle non-JSON responses gracefully
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(text || 'Server returned non-JSON response');
      }

      if (response.ok) {
        setAuditResult(data);
        toast.success("Audit completed successfully!");
        if (data.rate_limit) {
          setRemainingQueries(data.rate_limit.remaining);
        }
      } else {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Connect wallet to continue.");
        } else {
          toast.error(data.detail || "Audit failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Audit error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Internal Server Error')) {
        toast.error("Server error. The AI is processing - please wait and try again.");
      } else {
        toast.error("Failed to connect to the server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressAudit = async (address: string, network: string) => {
    setIsLoading(true);
    setAuditResult(null);

    try {
      const response = await fetch(`${API_URL}/audit/address-ui`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, network }),
      });

      // Try to parse as JSON, but handle non-JSON responses gracefully
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(text || 'Server returned non-JSON response');
      }

      if (response.ok) {
        setAuditResult(data);
        toast.success("Audit completed successfully!");
        if (data.rate_limit) {
          setRemainingQueries(data.rate_limit.remaining);
        }
      } else {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Connect wallet to continue.");
        } else {
          toast.error(data.detail || "Audit failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Audit error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Internal Server Error')) {
        toast.error("Server error. The AI is processing - please wait and try again.");
      } else {
        toast.error("Failed to connect to the server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskAI = (vulnerability: string) => {
    setChatQuestion(vulnerability);
    setIsChatOpen(true);
  };

  const handleLimitReached = () => {
    toast.error("Free query limit reached. Connect wallet to continue.");
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* Hero Section - Synthetic 3D Shader */}
        <SyntheticHero />

        {/* Audit Section */}
        <section className={styles.auditSection} id="audit">
          <div className={styles.auditContainer}>
            {/* Mode Tabs */}
            <div className={styles.modeTabs}>
              <button
                onClick={() => setActiveMode("zip")}
                className={`${styles.modeTab} ${
                  activeMode === "zip" ? styles.active : ""
                }`}
              >
                <FileArchive size={20} />
                <span>Upload ZIP</span>
              </button>
              <button
                onClick={() => setActiveMode("address")}
                className={`${styles.modeTab} ${
                  activeMode === "address" ? styles.active : ""
                }`}
              >
                <Link2 size={20} />
                <span>By Address</span>
              </button>
            </div>

            {/* Audit Form */}
            <div className={styles.auditForm}>
              {activeMode === "zip" ? (
                <DropZone onFileSelect={handleZipUpload} isLoading={isLoading} />
              ) : (
                <AddressInput onSubmit={handleAddressAudit} isLoading={isLoading} />
              )}

              {/* Rate Limit Info */}
              <div className={styles.rateLimit}>
                <span className={styles.rateLimitText}>
                  Free tier: <strong>{remainingQueries}</strong> audits remaining today
                </span>
                <button className={styles.upgradeLink}>
                  Upgrade to Pro <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Audit Results */}
            {auditResult && (
              <div className={styles.results}>
                <AuditReport result={auditResult} onAskAI={handleAskAI} />
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <HexificFeatureGrid />

        {/* Pricing Section */}
        <PricingSection 
          plans={HEXIFIC_PLANS}
          heading="Paket Harga yang Sesuai untuk Anda"
          description="Dipercaya oleh ribuan developer. Pilih paket yang tepat untuk kebutuhan audit keamanan smart contract Anda."
        />

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2>Ready to Secure Your Smart Contracts?</h2>
            <p>
              Start auditing today with 3 free audits. No wallet connection
              required.
            </p>
            <div className={styles.ctaButtons}>
              <a href="#audit" className="btn btn-primary">
                Start Free Audit
              </a>
              <a href="/docs" className="btn btn-secondary">
                View Documentation
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <Shield size={24} />
              <span>Hexific</span>
            </div>
            <p>AI-powered smart contract security auditing platform.</p>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="/docs">Documentation</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Resources</h4>
              <a href="/blog">Blog</a>
              <a href="/security">Security</a>
              <a href="/api">API</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
              <a href="/terms">Terms</a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; 2024 Hexific. All rights reserved.</p>
        </div>
      </footer>

      {/* AI Chat Modal */}
      <AIChat
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatQuestion("");
        }}
        initialQuestion={chatQuestion}
        remainingQueries={remainingQueries}
        onLimitReached={handleLimitReached}
      />

      {/* Floating AI Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className={styles.floatingChatButton}
        >
          <Sparkles size={24} />
        </button>
      )}
    </div>
  );
}
