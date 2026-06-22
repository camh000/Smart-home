"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";

/** GitHub-compatible heading slug so in-doc anchor links resolve. */
function slugify(node: ReactNode): string {
  return textOf(node)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
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

export function Markdown({
  source,
  onNavigateDoc,
}: {
  source: string;
  onNavigateDoc?: (doc: "plan" | "integration") => void;
}) {
  return (
    <div className="prose-doc">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 id={slugify(children)}>{children}</h1>,
          h2: ({ children }) => <h2 id={slugify(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={slugify(children)}>{children}</h3>,
          h4: ({ children }) => <h4 id={slugify(children)}>{children}</h4>,
          a: ({ href, children }) => {
            const url = href ?? "";
            // Cross-document links between the two source docs → switch tab.
            if (url.includes("claude_ha_integration")) {
              const hash = url.split("#")[1];
              return (
                <a
                  href={hash ? `#${hash}` : "#"}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateDoc?.("integration");
                    if (hash) {
                      requestAnimationFrame(() => {
                        document
                          .getElementById(hash)
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      });
                    }
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
                    onNavigateDoc?.("plan");
                  }}
                >
                  {children}
                </a>
              );
            }
            if (url.startsWith("#")) {
              return <a href={url}>{children}</a>;
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
