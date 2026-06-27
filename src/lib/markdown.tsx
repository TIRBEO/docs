import type { ReactNode } from "react";

export function renderMarkdown(content: string): ReactNode[] {
  const elements: ReactNode[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];
  let i = 0;

  const flushCodeBlock = (key: number) => {
    if (codeBlockLines.length > 0) {
      elements.push(
        <div key={`code-${key}`} className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] my-4">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2">
            <span className="text-xs font-medium text-white/30">{codeBlockLang || "Code"}</span>
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
            <code className="font-mono text-white/70">{codeBlockLines.join("\n")}</code>
          </pre>
        </div>
      );
      codeBlockLines = [];
      codeBlockLang = "";
    }
  };

  let keyCounter = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks (```)
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock(keyCounter++);
        inCodeBlock = false;
      } else {
        flushCodeBlock(keyCounter++);
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      i++;
      continue;
    }

    // Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={keyCounter++} className="mb-3 mt-6 text-lg font-semibold text-white">{trimmed.slice(4)}</h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={keyCounter++} className="mb-3 mt-8 text-xl font-semibold text-white">{trimmed.slice(3)}</h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={keyCounter++} className="mb-4 text-2xl font-bold text-white">{trimmed.slice(2)}</h1>
      );
      i++;
      continue;
    }

    // Unordered list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t.startsWith("- ") || t.startsWith("* ")) {
          items.push(t.slice(2));
          i++;
        } else break;
      }
      elements.push(
        <ul key={keyCounter++} className="mb-4 space-y-1 list-disc pl-5 text-sm text-white/50">
          {items.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (/^\d+\.\s/.test(t)) {
          items.push(t.replace(/^\d+\.\s/, ""));
          i++;
        } else break;
      }
      elements.push(
        <ol key={keyCounter++} className="mb-4 space-y-1 list-decimal pl-5 text-sm text-white/50">
          {items.map((item, idx) => <li key={idx}>{item}</li>)}
        </ol>
      );
      continue;
    }

    // Regular paragraph (collect consecutive lines)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (t && !t.startsWith("#") && !t.startsWith("```") && !t.startsWith("- ") && !t.startsWith("* ") && !/^\d+\.\s/.test(t)) {
        paraLines.push(t);
        i++;
      } else break;
    }
    if (paraLines.length > 0) {
      elements.push(
        <p key={keyCounter++} className="mb-4 text-sm leading-relaxed text-white/50 last:mb-0">
          {paraLines.join(" ")}
        </p>
      );
    } else {
      i++;
    }
  }

  flushCodeBlock(keyCounter++);
  return elements;
}
