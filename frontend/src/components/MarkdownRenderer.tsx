"use client";

import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-pre:bg-black/40 prose-pre:border prose-pre:border-emerald-500/10 prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold border-b border-emerald-500/20 pb-2 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mt-6 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold mt-4 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-bold mt-3 mb-1 text-emerald-400">{children}</h4>,
          p: ({ children }) => <p className="text-gray-400 leading-relaxed mb-4">{children}</p>,
          li: ({ children }) => <li className="text-gray-400 mb-1">{children}</li>,
          pre: ({ children }) => (
            <pre className="relative p-4 rounded-xl bg-black/60 border border-emerald-500/10 overflow-x-auto my-4 scrollbar-thin scrollbar-thumb-emerald-500/20">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-sm break-all">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500/50 bg-emerald-500/5 px-4 py-2 italic text-gray-400 my-4 rounded-r-lg">
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
