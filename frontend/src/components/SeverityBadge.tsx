"use client";

interface SeverityBadgeProps {
  severity: string;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

const severityConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#f87171',
    border: 'rgba(239, 68, 68, 0.3)',
    label: 'Critical'
  },
  high: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#f87171',
    border: 'rgba(239, 68, 68, 0.3)',
    label: 'High'
  },
  medium: {
    bg: 'rgba(251, 146, 60, 0.15)',
    text: '#fb923c',
    border: 'rgba(251, 146, 60, 0.3)',
    label: 'Medium'
  },
  low: {
    bg: 'rgba(74, 222, 128, 0.15)',
    text: '#4ade80',
    border: 'rgba(74, 222, 128, 0.3)',
    label: 'Low'
  },
  informational: {
    bg: 'rgba(96, 165, 250, 0.15)',
    text: '#60a5fa',
    border: 'rgba(96, 165, 250, 0.3)',
    label: 'Info'
  },
  info: {
    bg: 'rgba(96, 165, 250, 0.15)',
    text: '#60a5fa',
    border: 'rgba(96, 165, 250, 0.3)',
    label: 'Info'
  }
};

export default function SeverityBadge({ severity, count, size = 'md' }: SeverityBadgeProps) {
  const config = severityConfig[severity.toLowerCase()] || severityConfig.info;
  
  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '0.7rem' },
    md: { padding: '4px 12px', fontSize: '0.8rem' },
    lg: { padding: '6px 16px', fontSize: '0.9rem' }
  };
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        borderRadius: '9999px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        ...sizeStyles[size]
      }}
    >
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: config.text
      }} />
      {config.label}
      {count !== undefined && count > 0 && (
        <span style={{
          backgroundColor: config.text,
          color: '#000',
          borderRadius: '9999px',
          padding: '0 6px',
          fontSize: '0.7rem',
          fontWeight: 700,
          minWidth: '18px',
          textAlign: 'center'
        }}>
          {count}
        </span>
      )}
    </span>
  );
}

// Helper component for severity summary
export function SeveritySummary({ findings }: { findings: any[] }) {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0
  };
  
  findings.forEach(f => {
    const sev = (f.severity || 'informational').toLowerCase();
    if (sev in counts) {
      counts[sev as keyof typeof counts]++;
    }
  });
  
  const hasIssues = counts.critical > 0 || counts.high > 0 || counts.medium > 0 || counts.low > 0;
  
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {counts.critical > 0 && <SeverityBadge severity="critical" count={counts.critical} />}
      {counts.high > 0 && <SeverityBadge severity="high" count={counts.high} />}
      {counts.medium > 0 && <SeverityBadge severity="medium" count={counts.medium} />}
      {counts.low > 0 && <SeverityBadge severity="low" count={counts.low} />}
      {counts.informational > 0 && <SeverityBadge severity="informational" count={counts.informational} />}
      {!hasIssues && counts.informational === 0 && (
        <span style={{
          color: '#4ade80',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          ✓ No issues detected
        </span>
      )}
    </div>
  );
}
