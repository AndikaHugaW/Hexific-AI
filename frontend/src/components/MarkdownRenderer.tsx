"use client";

import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div 
      className={`prose prose-invert prose-emerald max-w-none ${className}`}
      style={{
        // Custom styling for dark theme
        color: 'rgba(255, 255, 255, 0.85)',
      }}
    >
      <ReactMarkdown
        components={{
          // Custom renderers for each element type
          h1: ({ children }) => (
            <h1 style={{ 
              color: 'white', 
              fontSize: '1.75rem', 
              fontWeight: 700,
              marginBottom: '1rem',
              borderBottom: '1px solid rgba(52, 211, 153, 0.3)',
              paddingBottom: '0.5rem'
            }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: 600,
              marginTop: '1.5rem',
              marginBottom: '0.75rem'
            }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 600,
              marginTop: '1.25rem',
              marginBottom: '0.5rem'
            }}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 style={{ 
              color: '#34d399', 
              fontSize: '1.1rem', 
              fontWeight: 600,
              marginTop: '1rem',
              marginBottom: '0.5rem'
            }}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              lineHeight: 1.7,
              marginBottom: '0.75rem'
            }}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong style={{ color: 'white', fontWeight: 600 }}>
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul style={{ 
              listStyleType: 'disc', 
              paddingLeft: '1.5rem',
              marginBottom: '1rem'
            }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{ 
              listStyleType: 'decimal', 
              paddingLeft: '1.5rem',
              marginBottom: '1rem'
            }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              marginBottom: '0.25rem'
            }}>
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code style={{ 
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              color: '#34d399',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.9em'
            }}>
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '1rem',
              borderRadius: '8px',
              overflow: 'auto',
              marginBottom: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote style={{ 
              borderLeft: '4px solid #34d399',
              paddingLeft: '1rem',
              marginLeft: 0,
              color: 'rgba(255, 255, 255, 0.6)',
              fontStyle: 'italic'
            }}>
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
