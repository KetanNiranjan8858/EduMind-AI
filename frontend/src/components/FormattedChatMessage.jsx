import React from 'react';

/**
 * Strips ** from headings, titles, prefixes and section labels
 */
function cleanHeadingAsterisks(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // 1. Heading with hashes: ### **Title** -> ### Title
    .replace(/^(#{1,6}\s*)\*\*(.+?)\*\*/gm, '$1$2')
    // 2. Standalone bold heading line: **Title:** or **Title** -> Title: or Title
    .replace(/^(\s*)\*\*(.+?)\*\*(\s*:?)\s*$/gm, '$1$2$3')
    // 3. Bullet heading: - **Title:** or * **Title:** -> - Title:
    .replace(/^(\s*[-*•]\s*)\*\*(.+?)\*\*(\s*:?)/gm, '$1$2$3')
    // 4. Numbered list heading: 1. **Title:** -> 1. Title:
    .replace(/^(\s*\d+[\.\)]\s*)\*\*(.+?)\*\*(\s*:?)/gm, '$1$2$3')
    // 5. Start-of-line bold header/label: **Key Formula:** or **Key Formula**: -> Key Formula:
    .replace(/^(\s*)\*\*(.+?):?\*\*:\s*/gm, '$1$2: ')
    .replace(/^(\s*)\*\*(.+?):\*\*\s*/gm, '$1$2: ');
}

/**
 * Parses inline formatting like **bold** and `code` into React elements
 */
function renderInline(str) {
  if (!str) return null;
  // Tokens: `code` or **bold**
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  const parts = str.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E6DFD3] text-[11px] font-mono text-[#173F3D] font-bold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-[#1C1917]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * FormattedChatMessage component
 * Cleans ** from headings and renders rich, clean academic typography without raw asterisks
 */
export default function FormattedChatMessage({ content }) {
  if (!content) return null;

  const cleaned = cleanHeadingAsterisks(content);

  // Split content by code blocks first
  const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        data: cleaned.substring(lastIndex, match.index)
      });
    }
    segments.push({
      type: 'code',
      lang: match[1] || 'text',
      data: match[2]
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < cleaned.length) {
    segments.push({
      type: 'text',
      data: cleaned.substring(lastIndex)
    });
  }

  return (
    <div className="space-y-2 leading-relaxed text-xs sm:text-sm font-sans text-[#1C1917]">
      {segments.map((seg, sIdx) => {
        if (seg.type === 'code') {
          return (
            <div key={sIdx} className="my-2.5 rounded-xl overflow-hidden border border-[#E6DFD3] bg-[#FAF7F2]">
              {seg.lang && (
                <div className="px-3 py-1 bg-[#EAE2D5]/70 border-b border-[#E6DFD3] text-[10px] uppercase font-mono text-[#78716C]">
                  {seg.lang}
                </div>
              )}
              <pre className="p-3 text-xs font-mono text-[#173F3D] overflow-x-auto whitespace-pre font-semibold">
                {seg.data}
              </pre>
            </div>
          );
        }

        // Process line-by-line for text segment
        const lines = seg.data.split('\n');
        return (
          <div key={sIdx} className="space-y-1">
            {lines.map((rawLine, lIdx) => {
              const line = rawLine.trim();
              if (!line) {
                return <div key={lIdx} className="h-1.5" />;
              }

              // Heading lines (#, ##, ###)
              const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
              if (headingMatch) {
                const level = headingMatch[1].length;
                const headingText = headingMatch[2].replace(/\*\*/g, '').trim();
                const headingClass =
                  level <= 2
                    ? 'text-sm font-extrabold text-[#1C1917] mt-3 mb-1 border-b border-[#E6DFD3] pb-1'
                    : 'text-xs font-bold text-[#1C1917] mt-2 mb-0.5';
                return (
                  <h4 key={lIdx} className={headingClass}>
                    {headingText}
                  </h4>
                );
              }

              // Standalone section title like "Summary:" or "Key Properties:"
              const sectionTitleMatch = line.match(/^[A-Z][A-Za-z0-9\s—–-]{1,45}:$/);
              if (sectionTitleMatch) {
                return (
                  <h5 key={lIdx} className="text-xs font-bold text-[#1C1917] mt-2.5 mb-0.5 tracking-wide">
                    {line}
                  </h5>
                );
              }

              // Bullet points (- or * or •)
              const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
              if (bulletMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 py-0.5">
                    <span className="text-[#173F3D] font-bold text-xs shrink-0 mt-0.5">•</span>
                    <span className="text-[#1C1917] leading-snug">{renderInline(bulletMatch[1])}</span>
                  </div>
                );
              }

              // Numbered list items (1., 2., etc.)
              const numberMatch = line.match(/^(\d+[\.\)])\s+(.*)$/);
              if (numberMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 py-0.5">
                    <span className="text-[#173F3D] font-mono font-bold text-xs shrink-0 mt-0.5">
                      {numberMatch[1]}
                    </span>
                    <span className="text-[#1C1917] leading-snug">{renderInline(numberMatch[2])}</span>
                  </div>
                );
              }

              // Standard line
              return (
                <p key={lIdx} className="text-[#1C1917] leading-relaxed">
                  {renderInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
