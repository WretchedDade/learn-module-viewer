// Parse highlight string like "1, 5-9, 13-20" into a set of line numbers
function parseHighlightRanges(highlight: string): Set<number> {
    const lineNumbers = new Set<number>();
    
    if (!highlight) return lineNumbers;
    
    const parts = highlight.split(',').map(part => part.trim());
    
    parts.forEach(part => {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(num => parseInt(num.trim()));
            for (let i = start; i <= end; i++) {
                lineNumbers.add(i);
            }
        } else {
            const line = parseInt(part);
            if (!isNaN(line)) {
                lineNumbers.add(line);
            }
        }
    });
    
    return lineNumbers;
}

interface EnhancedCodeBlockProps {
    code: string;
    language: string;
    highlight?: string;
    filename?: string;
    source?: string;
}

// Enhanced code block component with line highlighting and metadata
export function EnhancedCodeBlock({ 
    code, 
    language, 
    highlight, 
    filename, 
    source 
}: EnhancedCodeBlockProps) {
    const lines = code.split('\n');
    const highlightedLines = parseHighlightRanges(highlight || '');
    
    return (
        <div className="my-4 rounded-lg overflow-hidden border border-zinc-600">
            {/* Header with file info */}
            <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm">📄</span>
                        <span className="text-zinc-300 text-sm font-mono">
                            {filename || 'Code'}
                        </span>
                        <span className="text-zinc-500 text-xs px-2 py-1 bg-zinc-700 rounded">
                            {language}
                        </span>
                    </div>
                    {highlight && (
                        <span className="text-zinc-400 text-xs">
                            Lines: {highlight}
                        </span>
                    )}
                </div>
            </div>
            
            {/* Code content */}
            <div className="bg-zinc-900 overflow-x-auto">
                <div className="flex">
                    {/* Line numbers */}
                    <div className="flex-shrink-0 bg-zinc-800 px-3 py-3 border-r border-zinc-600">
                        {lines.map((_, index) => {
                            const lineNum = index + 1;
                            const isHighlighted = highlightedLines.has(lineNum);
                            return (
                                <div
                                    key={index}
                                    className={`text-right text-xs leading-6 font-mono ${
                                        isHighlighted 
                                            ? 'text-yellow-400 font-bold' 
                                            : 'text-zinc-500'
                                    }`}
                                    style={{ minWidth: '3rem' }}
                                >
                                    {lineNum}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Code lines */}
                    <div className="flex-1 px-4 py-3">
                        {lines.map((line, index) => {
                            const trimmedLine = line.trim();
                            const lineNum = index + 1;
                            const isHighlighted = highlightedLines.has(lineNum);
                            return (
                                <div
                                    key={index}
                                    className={`font-mono text-sm leading-6 ${
                                        isHighlighted 
                                            ? 'bg-yellow-900/30 border-l-2 border-yellow-400 pl-2 -ml-2' 
                                            : ''
                                    }`}
                                >
                                    {trimmedLine.length === 0 && <span className="text-zinc-500">&nbsp;</span>}
                                    {trimmedLine.length > 0 && <code className="text-zinc-300">{trimmedLine}</code>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Footer with source info */}
            {source && (
                <div className="bg-zinc-800 px-4 py-2 border-t border-zinc-600">
                    <span className="text-zinc-400 text-xs">Source: {source}</span>
                </div>
            )}
        </div>
    );
}
