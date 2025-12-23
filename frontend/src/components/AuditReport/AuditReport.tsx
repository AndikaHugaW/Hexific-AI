"use client";

import { AlertTriangle, ShieldAlert, ShieldCheck, Info, ChevronDown, ChevronUp, Code, Lightbulb, MapPin, Download, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import styles from "./AuditReport.module.css";
import MarkdownRenderer from "../MarkdownRenderer";
import SeverityBadge, { SeveritySummary } from "../SeverityBadge";

interface Vulnerability {
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
  recommendation?: string;
  codeExample?: string;
}

interface AuditResult {
  success: boolean;
  audit_type: string;
  tier: string;
  results: {
    vulnerabilities: Vulnerability[];
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
    analysis?: {
      parsed?: Record<string, unknown>;
      raw?: string;
    };
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

interface AuditReportProps {
  result: AuditResult;
  onAskAI?: (vulnerability: string) => void;
}

// Helper function to detect severity from AI text
function detectSeverityFromText(text: string): { hasHigh: boolean; hasMedium: boolean; hasLow: boolean; hasCritical: boolean } {
  const lowerText = text.toLowerCase();
  return {
    hasCritical: lowerText.includes('critical severity') || lowerText.includes('#### critical'),
    hasHigh: lowerText.includes('high severity') || lowerText.includes('#### high') || lowerText.includes('reentrancy') || lowerText.includes('unchecked external call'),
    hasMedium: lowerText.includes('medium severity') || lowerText.includes('#### medium'),
    hasLow: lowerText.includes('low severity') || lowerText.includes('#### low'),
  };
}

// Parse AI text to extract findings as pseudo-vulnerabilities
function parseAIFindings(text: string): Vulnerability[] {
  if (!text) return [];
  
  const findings: Vulnerability[] = [];
  const lines = text.split('\n');
  
  let currentSeverity: "critical" | "high" | "medium" | "low" | "informational" = "informational";
  let currentTitle = "";
  let currentDescription = "";
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Detect severity headers
    if (lowerLine.includes('critical severity') || lowerLine.includes('#### critical')) {
      if (currentTitle) {
        findings.push({
          id: `ai-${findings.length}`,
          title: currentTitle,
          severity: currentSeverity,
          description: currentDescription.trim()
        });
      }
      currentSeverity = "critical";
      currentTitle = "";
      currentDescription = "";
    } else if (lowerLine.includes('high severity') || lowerLine.includes('#### high')) {
      if (currentTitle) {
        findings.push({
          id: `ai-${findings.length}`,
          title: currentTitle,
          severity: currentSeverity,
          description: currentDescription.trim()
        });
      }
      currentSeverity = "high";
      currentTitle = "";
      currentDescription = "";
    } else if (lowerLine.includes('medium severity') || lowerLine.includes('#### medium')) {
      if (currentTitle) {
        findings.push({
          id: `ai-${findings.length}`,
          title: currentTitle,
          severity: currentSeverity,
          description: currentDescription.trim()
        });
      }
      currentSeverity = "medium";
      currentTitle = "";
      currentDescription = "";
    } else if (lowerLine.includes('low severity') || lowerLine.includes('#### low')) {
      if (currentTitle) {
        findings.push({
          id: `ai-${findings.length}`,
          title: currentTitle,
          severity: currentSeverity,
          description: currentDescription.trim()
        });
      }
      currentSeverity = "low";
      currentTitle = "";
      currentDescription = "";
    }
    
    // Detect finding titles (numbered items or bullet points with key vulnerabilities)
    const titleMatch = line.match(/^\d+\.\s+\*\*(.+?)\*\*/);
    if (titleMatch) {
      if (currentTitle) {
        findings.push({
          id: `ai-${findings.length}`,
          title: currentTitle,
          severity: currentSeverity,
          description: currentDescription.trim()
        });
      }
      currentTitle = titleMatch[1];
      currentDescription = "";
    } else if (currentTitle && line.trim()) {
      currentDescription += line + " ";
    }
  }
  
  // Push last finding
  if (currentTitle) {
    findings.push({
      id: `ai-${findings.length}`,
      title: currentTitle,
      severity: currentSeverity,
      description: currentDescription.trim()
    });
  }
  
  return findings;
}

// Export report as text/markdown
function exportReport(result: AuditResult) {
  const lines: string[] = [];
  lines.push("# Hexific Smart Contract Audit Report");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Audit Type: ${result.audit_type}`);
  lines.push("");
  
  if (result.contract) {
    lines.push("## Contract Information");
    lines.push(`- **Name:** ${result.contract.name}`);
    lines.push(`- **Address:** ${result.contract.address}`);
    lines.push(`- **Network:** ${result.contract.network}`);
    lines.push("");
  }
  
  if (result.results?.raw_response) {
    lines.push("## AI Analysis");
    lines.push(result.results.raw_response);
    lines.push("");
  }
  
  if (result.results?.vulnerabilities?.length > 0) {
    lines.push("## Detected Vulnerabilities");
    result.results.vulnerabilities.forEach((v, i) => {
      lines.push(`### ${i + 1}. ${v.title} [${v.severity.toUpperCase()}]`);
      lines.push(v.description);
      lines.push("");
    });
  }
  
  lines.push("---");
  lines.push("*Generated by Hexific - AI-Powered Smart Contract Audit*");
  
  const content = lines.join("\n");
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hexific-audit-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}


const severityConfig = {
  critical: {
    icon: ShieldAlert,
    label: "Critical",
    color: "#ef4444",
    bgClass: styles.criticalBg,
    badgeClass: "badge-critical",
  },
  high: {
    icon: AlertTriangle,
    label: "High",
    color: "#f59e0b",
    bgClass: styles.highBg,
    badgeClass: "badge-high",
  },
  medium: {
    icon: AlertTriangle,
    label: "Medium",
    color: "#6366f1",
    bgClass: styles.mediumBg,
    badgeClass: "badge-medium",
  },
  low: {
    icon: ShieldCheck,
    label: "Low",
    color: "#22c55e",
    bgClass: styles.lowBg,
    badgeClass: "badge-low",
  },
  informational: {
    icon: Info,
    label: "Info",
    color: "#94a3b8",
    bgClass: styles.infoBg,
    badgeClass: "badge-info",
  },
};

function VulnerabilityCard({ 
  vuln, 
  index,
  onAskAI 
}: { 
  vuln: Vulnerability; 
  index: number;
  onAskAI?: (vulnerability: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = severityConfig[vuln.severity] || severityConfig.informational;
  const Icon = config.icon;

  return (
    <div 
      className={`${styles.vulnCard} ${config.bgClass}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div 
        className={styles.vulnHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.vulnIcon} style={{ color: config.color }}>
          <Icon size={24} />
        </div>
        
        <div className={styles.vulnInfo}>
          <div className={styles.vulnTitleRow}>
            <span className={`badge ${config.badgeClass}`}>{config.label}</span>
            <h4 className={styles.vulnTitle}>{vuln.title || vuln.id}</h4>
          </div>
          {vuln.confidence && (
            <span className={styles.confidence}>
              Confidence: {vuln.confidence}
            </span>
          )}
        </div>
        
        <button className={styles.expandButton}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.vulnDetails}>
          {/* Description */}
          <div className={styles.detailSection}>
            <h5 className={styles.detailLabel}>
              <Info size={16} /> Description
            </h5>
            <p className={styles.detailText}>{vuln.description}</p>
          </div>

          {/* Locations */}
          {vuln.locations && vuln.locations.length > 0 && (
            <div className={styles.detailSection}>
              <h5 className={styles.detailLabel}>
                <MapPin size={16} /> Affected Locations
              </h5>
              <div className={styles.locations}>
                {vuln.locations.map((loc, i) => (
                  <div key={i} className={styles.location}>
                    <code>{loc.file}</code>
                    {loc.lines && loc.lines.length > 0 && (
                      <span className={styles.lines}>
                        Lines: {loc.lines.join(", ")}
                      </span>
                    )}
                    {loc.name && (
                      <span className={styles.locName}>
                        {loc.type}: {loc.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {vuln.recommendation && (
            <div className={styles.detailSection}>
              <h5 className={styles.detailLabel}>
                <Lightbulb size={16} /> Recommendation
              </h5>
              <p className={styles.detailText}>{vuln.recommendation}</p>
            </div>
          )}

          {/* Code Example */}
          {vuln.codeExample && (
            <div className={styles.detailSection}>
              <h5 className={styles.detailLabel}>
                <Code size={16} /> Fix Example
              </h5>
              <pre className={styles.codeBlock}>
                <code>{vuln.codeExample}</code>
              </pre>
            </div>
          )}

          {/* Ask AI Button */}
          {onAskAI && (
            <button
              onClick={() => onAskAI(vuln.description || vuln.title)}
              className={styles.askAiButton}
            >
              <Lightbulb size={18} />
              Ask AI for help
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditReport({ result, onAskAI }: AuditReportProps) {
  const { results, contract, audit_type, tier } = result;
  const slitherVulnerabilities = results?.vulnerabilities || [];
  const summary = results?.summary;
  
  // AI analysis text
  const aiAnalysis = results?.raw_response || results?.analysis?.raw;
  
  // Parse AI findings and merge with slither vulnerabilities
  const aiParsedFindings = useMemo(() => {
    return aiAnalysis ? parseAIFindings(aiAnalysis) : [];
  }, [aiAnalysis]);
  
  // Detect severity from AI text even if parsing doesn't work perfectly
  const aiSeverity = useMemo(() => {
    return aiAnalysis ? detectSeverityFromText(aiAnalysis) : { hasHigh: false, hasMedium: false, hasLow: false, hasCritical: false };
  }, [aiAnalysis]);
  
  // Combine all vulnerabilities (prioritize parsed AI findings when slither is empty)
  const allVulnerabilities = useMemo(() => {
    const combined = [...slitherVulnerabilities];
    // Add AI findings that aren't duplicates
    aiParsedFindings.forEach(aiFinding => {
      const isDuplicate = combined.some(v => 
        v.title.toLowerCase().includes(aiFinding.title.toLowerCase().split(' ')[0]) ||
        aiFinding.title.toLowerCase().includes(v.title.toLowerCase().split(' ')[0])
      );
      if (!isDuplicate) {
        combined.push(aiFinding);
      }
    });
    return combined;
  }, [slitherVulnerabilities, aiParsedFindings]);
  
  // Determine if there are real issues (from slither OR AI)
  const hasRealIssues = allVulnerabilities.length > 0 || aiSeverity.hasCritical || aiSeverity.hasHigh || aiSeverity.hasMedium;
  
  // Group vulnerabilities by severity
  const grouped = allVulnerabilities.reduce((acc, vuln) => {
    const sev = vuln.severity || "informational";
    if (!acc[sev]) acc[sev] = [];
    acc[sev].push(vuln);
    return acc;
  }, {} as Record<string, Vulnerability[]>);

  const severityOrder = ["critical", "high", "medium", "low", "informational"];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Audit Report</h2>
          <div className={styles.meta}>
            <span className={`badge ${tier === "paid" ? "badge-high" : "badge-info"}`}>
              {tier === "paid" ? "PRO" : "FREE"}
            </span>
            <span className={styles.auditType}>
              {audit_type === "slither" ? "Slither Analysis" : "AI Analysis"}
            </span>
            {/* Export Button */}
            <button 
              onClick={() => exportReport(result)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '6px',
                color: '#34d399',
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginLeft: '12px'
              }}
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {contract && (
          <div className={styles.contractInfo}>
            <div className={styles.contractDetail}>
              <span className={styles.contractLabel}>Contract</span>
              <span className={styles.contractValue}>{contract.name}</span>
            </div>
            <div className={styles.contractDetail}>
              <span className={styles.contractLabel}>Network</span>
              <span className={styles.contractValue}>{contract.network}</span>
            </div>
            {contract.address && (
              <div className={styles.contractDetail}>
                <span className={styles.contractLabel}>Address</span>
                <code className={styles.address}>
                  {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                </code>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overall Status Banner */}
      <div style={{
        padding: '16px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: hasRealIssues 
          ? (aiSeverity.hasCritical || aiSeverity.hasHigh || grouped.critical?.length || grouped.high?.length) 
            ? 'rgba(239, 68, 68, 0.1)' 
            : 'rgba(251, 146, 60, 0.1)'
          : 'rgba(74, 222, 128, 0.1)',
        border: `1px solid ${hasRealIssues 
          ? (aiSeverity.hasCritical || aiSeverity.hasHigh || grouped.critical?.length || grouped.high?.length)
            ? 'rgba(239, 68, 68, 0.3)'
            : 'rgba(251, 146, 60, 0.3)'
          : 'rgba(74, 222, 128, 0.3)'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {hasRealIssues ? (
            <>
              <AlertTriangle size={24} style={{ color: aiSeverity.hasHigh ? '#ef4444' : '#fb923c' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'white' }}>
                  {aiSeverity.hasCritical || aiSeverity.hasHigh || grouped.critical?.length || grouped.high?.length
                    ? 'Critical/High Vulnerabilities Detected'
                    : 'Issues Detected - Review Recommended'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                  {allVulnerabilities.length} issue{allVulnerabilities.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </>
          ) : (
            <>
              <ShieldCheck size={24} style={{ color: '#4ade80' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'white' }}>No Critical Issues Found</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                  Your contract passed the security analysis
                </div>
              </div>
            </>
          )}
        </div>
        <SeveritySummary findings={allVulnerabilities} />
      </div>

      {/* Summary Stats */}
      {(summary || allVulnerabilities.length > 0) && (
        <div className={styles.summary}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{allVulnerabilities.length}</span>
            <span className={styles.statLabel}>Total Issues</span>
          </div>
          <div className={`${styles.statCard} ${styles.highStat}`}>
            <span className={styles.statValue}>
              {(grouped.critical?.length || 0) + (grouped.high?.length || 0)}
            </span>
            <span className={styles.statLabel}>High/Critical</span>
          </div>
          <div className={`${styles.statCard} ${styles.mediumStat}`}>
            <span className={styles.statValue}>{grouped.medium?.length || 0}</span>
            <span className={styles.statLabel}>Medium</span>
          </div>
          <div className={`${styles.statCard} ${styles.lowStat}`}>
            <span className={styles.statValue}>{grouped.low?.length || 0}</span>
            <span className={styles.statLabel}>Low</span>
          </div>
        </div>
      )}

      {/* AI Analysis Section - Now with MarkdownRenderer */}
      {aiAnalysis && (
        <div className={styles.aiAnalysis}>
          <h3 className={styles.sectionTitle}>
            <FileText size={20} style={{ marginRight: '8px' }} />
            AI Analysis
          </h3>
          <div className={styles.aiContent} style={{ padding: '20px' }}>
            <MarkdownRenderer content={aiAnalysis} />
          </div>
        </div>
      )}

      {/* Vulnerabilities List */}
      <div className={styles.vulnerabilities}>
        <h3 className={styles.sectionTitle}>Detected Issues</h3>
        
        {allVulnerabilities.length === 0 && !hasRealIssues ? (
          <div className={styles.noIssues}>
            <ShieldCheck size={48} />
            <h4>No issues detected</h4>
            <p>Great job! No vulnerabilities were found in your smart contract.</p>
          </div>
        ) : (
          <div className={styles.vulnList}>
            {severityOrder.map((sev) =>
              grouped[sev]?.map((vuln, idx) => (
                <VulnerabilityCard
                  key={`${sev}-${idx}`}
                  vuln={vuln}
                  index={idx}
                  onAskAI={onAskAI}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

