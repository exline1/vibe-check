import React, { useMemo } from 'react';

/**
 * Parses inline markdown tokens (bold, italic, code, links, strikethrough)
 */
function parseInlineTokens(content) {
  if (!content) return [];

  const tokens = [];
  const regex = /(`[^`]+?`|\*\*\*[^*]+?\*\*\*|___[^_]+?___|\*\*[^*]+?\*\*|__[^_]+?__|\*[^*]+?\*|_[^_]+?_|~~[^~]+?~~|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }

    const full = match[0];

    if (match[2] && match[3]) {
      tokens.push({ type: 'link', text: match[2], url: match[3] });
    } else if (full.startsWith('`') && full.endsWith('`')) {
      tokens.push({ type: 'code', content: full.slice(1, -1) });
    } else if ((full.startsWith('***') && full.endsWith('***')) || (full.startsWith('___') && full.endsWith('___'))) {
      tokens.push({ type: 'bold-italic', content: full.slice(3, -3) });
    } else if ((full.startsWith('**') && full.endsWith('**')) || (full.startsWith('__') && full.endsWith('__'))) {
      tokens.push({ type: 'bold', content: full.slice(2, -2) });
    } else if (full.startsWith('~~') && full.endsWith('~~')) {
      tokens.push({ type: 'strike', content: full.slice(2, -2) });
    } else if ((full.startsWith('*') && full.endsWith('*')) || (full.startsWith('_') && full.endsWith('_'))) {
      tokens.push({ type: 'italic', content: full.slice(1, -1) });
    } else {
      tokens.push({ type: 'text', content: full });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    tokens.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return tokens;
}

/**
 * Renders inline markdown tokens with proper styling
 */
export function InlineMarkdown({ content }) {
  const tokens = useMemo(() => parseInlineTokens(content), [content]);

  return (
    <>
      {tokens.map((token, idx) => {
        if (token.type === 'bold') {
          return (
            <strong key={idx} className="font-bold text-white tracking-normal font-stage">
              {token.content}
            </strong>
          );
        }
        if (token.type === 'bold-italic') {
          return (
            <strong key={idx} className="font-bold italic text-white font-stage">
              {token.content}
            </strong>
          );
        }
        if (token.type === 'italic') {
          return (
            <em key={idx} className="italic opacity-90">
              {token.content}
            </em>
          );
        }
        if (token.type === 'strike') {
          return (
            <del key={idx} className="line-through opacity-70">
              {token.content}
            </del>
          );
        }
        if (token.type === 'code') {
          return (
            <code
              key={idx}
              className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#0E0D12] border border-[#2A2838] font-mono text-xs text-[#00D2D3]"
            >
              {token.content}
            </code>
          );
        }
        if (token.type === 'link') {
          return (
            <a
              key={idx}
              href={token.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00D2D3] hover:underline underline-offset-2 font-medium"
            >
              {token.text}
            </a>
          );
        }
        return <span key={idx}>{token.content}</span>;
      })}
    </>
  );
}

/**
 * Parses markdown blocks (paragraphs, headers, lists, code blocks, blockquotes)
 */
function parseBlocks(text) {
  if (!text) return [];

  const rawLines = text.split('\n');
  const blocks = [];
  let currentParagraph = [];
  let currentList = null;
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        type: 'paragraph',
        lines: currentParagraph
      });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Fenced Code Block start/end
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          type: 'code_block',
          lang: codeBlockLang,
          code: codeBlockLines.join('\n')
        });
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockLines = [];
      } else {
        flushParagraph();
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Empty line -> flush open paragraph and list
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Headers (# to ######)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'header',
        level: headerMatch[1].length,
        content: headerMatch[2]
      });
      continue;
    }

    // Horizontal Rule (---, ***, ___)
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'hr' });
      continue;
    }

    // Blockquote (> ...)
    if (trimmed.startsWith('> ') || trimmed === '>') {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'blockquote',
        content: trimmed.replace(/^>\s?/, '')
      });
      continue;
    }

    // Numbered List Item (1. ..., 2) ...)
    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'numbered') {
        flushList();
        currentList = { type: 'numbered', items: [] };
      }
      currentList.items.push({ num: numMatch[1], content: numMatch[2] });
      continue;
    }

    // Bullet List Item (- ..., * ..., • ...)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'bullet') {
        flushList();
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push({ content: bulletMatch[1] });
      continue;
    }

    // Regular line in paragraph
    flushList();
    currentParagraph.push(line);
  }

  if (inCodeBlock) {
    blocks.push({
      type: 'code_block',
      lang: codeBlockLang,
      code: codeBlockLines.join('\n')
    });
  }

  flushParagraph();
  flushList();
  return blocks;
}

/**
 * Full Markdown message renderer with dark theme styles and crisp bold highlights
 */
export default function MarkdownRenderer({ content, className = '' }) {
  const blocks = useMemo(() => parseBlocks(content || ''), [content]);

  if (!content) return null;

  return (
    <div className={`space-y-2.5 break-words ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'paragraph') {
          return (
            <p key={bIdx} className="leading-relaxed">
              {block.lines.map((line, lIdx) => (
                <React.Fragment key={lIdx}>
                  <InlineMarkdown content={line} />
                  {lIdx < block.lines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          );
        }

        if (block.type === 'header') {
          const Tag = block.level <= 2 ? 'h3' : 'h4';
          return (
            <Tag
              key={bIdx}
              className={`font-bold text-white font-stage mt-3 mb-1 ${
                block.level === 1 ? 'text-lg md:text-xl' : block.level === 2 ? 'text-base md:text-lg' : 'text-sm md:text-base'
              }`}
            >
              <InlineMarkdown content={block.content} />
            </Tag>
          );
        }

        if (block.type === 'numbered') {
          return (
            <ol key={bIdx} className="my-2 space-y-1.5 pl-1">
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#00D2D3] font-mono font-bold text-xs mt-0.5 flex-shrink-0 min-w-[18px]">
                    {item.num}.
                  </span>
                  <div className="flex-1">
                    <InlineMarkdown content={item.content} />
                  </div>
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === 'bullet') {
          return (
            <ul key={bIdx} className="my-2 space-y-1.5 pl-1">
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#00D2D3] text-sm mt-0.5 flex-shrink-0 leading-none">
                    •
                  </span>
                  <div className="flex-1">
                    <InlineMarkdown content={item.content} />
                  </div>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'code_block') {
          return (
            <div key={bIdx} className="my-2.5 rounded-2xl bg-[#0E0D12] border border-[#2A2838] overflow-hidden">
              {block.lang && (
                <div className="px-3.5 py-1 bg-[#16151D] border-b border-[#2A2838] text-[10px] font-mono text-[#9E9AA8] uppercase tracking-wider">
                  {block.lang}
                </div>
              )}
              <pre className="p-3.5 text-xs font-mono text-[#00D2D3] overflow-x-auto scrollbar-thin">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={bIdx}
              className="border-l-2 border-[#00D2D3] pl-3 my-2 text-xs italic text-[#9E9AA8] bg-[#0E0D12]/30 py-1 rounded-r-lg"
            >
              <InlineMarkdown content={block.content} />
            </blockquote>
          );
        }

        if (block.type === 'hr') {
          return <hr key={bIdx} className="border-t border-[#2A2838] my-3" />;
        }

        return null;
      })}
    </div>
  );
}

