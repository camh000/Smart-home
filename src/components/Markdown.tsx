"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import { slugify } from "@/lib/doc";

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
  return (
    <div className="prose-doc">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 id={slugOf(children)}>{children}</h1>,
          h2: ({ children }) => <h2 id={slugOf(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={slugOf(children)}>{children}</h3>,
          h4: ({ children }) => <h4 id={slugOf(children)}>{children}</h4>,
          a: ({ href, children }) => {
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
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
