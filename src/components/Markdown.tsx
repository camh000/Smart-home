"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { Children, isValidElement, cloneElement } from "react";
import { slugify } from "@/lib/doc";
import { GLOSSARY_LOOKUP, GLOSSARY_RE } from "@/data/glossary";
import { Term } from "./Term";

export interface NavTarget {
  tab?: string;
  headingId?: string;
}

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return textOf(props.children);
  }
  return Children.toArray(node).map(textOf).join("");
}

const slugOf = (children: ReactNode) => slugify(textOf(children));

export function Markdown({
  source,
  onNavigate,
}: {
  source: string;
  onNavigate?: (target: NavTarget) => void;
}) {
  // First occurrence of each glossary term in this document gets a tooltip.
  const seen = new Set<string>();
  let keyCounter = 0;

  function tokenize(text: string): ReactNode[] {
    const parts: ReactNode[] = [];
    let last = 0;
    GLOSSARY_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = GLOSSARY_RE.exec(text)) !== null) {
      const surface = m[0];
      const entry = GLOSSARY_LOOKUP.get(surface);
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (entry && !seen.has(entry.key)) {
        seen.add(entry.key);
        parts.push(<Term key={`g${keyCounter++}`} term={surface} def={entry.def} />);
      } else {
        parts.push(surface);
      }
      last = m.index + surface.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }

  function annotate(children: ReactNode): ReactNode {
    return Children.map(children, (child) => {
      if (typeof child === "string") return tokenize(child);
      if (isValidElement(child)) {
        const type = child.type;
        // Skip custom components (our links) and inline code.
        if (typeof type !== "string" || type === "code" || type === "a") return child;
        const props = child.props as { children?: ReactNode };
        if (props?.children) return cloneElement(child, undefined, annotate(props.children));
      }
      return child;
    });
  }

  function linkRenderer({ href, children }: { href?: string; children?: ReactNode }) {
    const url = href ?? "";
    if (url.includes("claude_ha_integration")) {
      const hash = url.split("#")[1];
      return (
        <a
          href={hash ? `#${hash}` : "#"}
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.({ tab: "integration", headingId: hash });
          }}
        >
          {children}
        </a>
      );
    }
    if (url.includes("smart_home_plan")) {
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.({ tab: "plan" });
          }}
        >
          {children}
        </a>
      );
    }
    if (url.startsWith("#")) {
      return (
        <a
          href={url}
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.({ headingId: url.slice(1) });
          }}
        >
          {children}
        </a>
      );
    }
    return (
      <a href={url} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  }

  return (
    <div className="prose-doc">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 id={slugOf(children)}>{children}</h1>,
          h2: ({ children }) => <h2 id={slugOf(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={slugOf(children)}>{children}</h3>,
          h4: ({ children }) => <h4 id={slugOf(children)}>{children}</h4>,
          p: ({ children }) => <p>{annotate(children)}</p>,
          li: ({ children }) => <li>{annotate(children)}</li>,
          td: ({ children }) => <td>{annotate(children)}</td>,
          table: ({ children }) => (
            <div className="prose-table-wrap">
              <table>{children}</table>
            </div>
          ),
          a: linkRenderer,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
