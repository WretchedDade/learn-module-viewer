import { useEffect, useState } from 'react';
import { Module, CodeDirective } from '../github/githubTypes';

interface CodeDirectiveBlockProps {
    directive: CodeDirective;
    module: Module;
}

interface HighlightRange {
    start: number;
    end: number;
}

export function CodeDirectiveBlock({ directive, module }: CodeDirectiveBlockProps) {
    const [codeContent, setCodeContent] = useState<string>('');
    const [highlightedLines, setHighlightedLines] = useState<Set<number>>(new Set());
    
    useEffect(() => {
        // Find the code file in the module
        const codeFile = module.codeFiles.find(file => 
            file.path.endsWith(directive.source.replace('../', ''))
        );
        
        if (codeFile) {
            setCodeContent(codeFile.content);
            
            // Parse highlight ranges
            if (directive.highlight) {
                const ranges = parseHighlightRanges(directive.highlight);
                const lineNumbers = new Set<number>();
                
                ranges.forEach(range => {
                    for (let i = range.start; i <= range.end; i++) {
                        lineNumbers.add(i);
                    }
                });
                
                setHighlightedLines(lineNumbers);
            }
        } else {
            setCodeContent(`// Code file not found: ${directive.source}`);
        }
    }, [directive, module]);
    
    // Parse highlight string like "1, 5-9, 13-20" into ranges
    const parseHighlightRanges = (highlight: string): HighlightRange[] => {
        const ranges: HighlightRange[] = [];
        const parts = highlight.split(',').map(part => part.trim());
        
        parts.forEach(part => {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(num => parseInt(num.trim()));
                ranges.push({ start, end });
            } else {
                const line = parseInt(part);
                ranges.push({ start: line, end: line });
            }
        });
        
        return ranges;
    };
    
    const lines = codeContent.split('\n');
    
    return (
        <div className="my-4 rounded-lg overflow-hidden border border-gray-600">
            {/* Header with file info */}
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">📄</span>
                        <span className="text-gray-300 text-sm font-mono">
                            {directive.source.split('/').pop()}
                        </span>
                        <span className="text-gray-500 text-xs px-2 py-1 bg-gray-700 rounded">
                            {directive.language}
                        </span>
                    </div>
                    {directive.highlight && (
                        <span className="text-gray-400 text-xs">
                            Lines: {directive.highlight}
                        </span>
                    )}
                </div>
            </div>
            
            {/* Code content with line numbers and highlighting */}
            <div className="bg-gray-900 overflow-x-auto">
                <div className="flex">
                    {/* Line numbers */}
                    <div className="flex-shrink-0 bg-gray-800 px-3 py-3 border-r border-gray-600">
                        {lines.map((_, index) => {
                            const lineNum = index + 1;
                            const isHighlighted = highlightedLines.has(lineNum);
                            
                            return (
                                <div
                                    key={lineNum}
                                    className={`text-right text-xs leading-6 font-mono ${
                                        isHighlighted 
                                            ? 'text-yellow-400 font-bold' 
                                            : 'text-gray-500'
                                    }`}
                                    style={{ minWidth: '3rem' }}
                                >
                                    {lineNum}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Code content */}
                    <div className="flex-1 px-4 py-3">
                        {lines.map((line, index) => {
                            const lineNum = index + 1;
                            const isHighlighted = highlightedLines.has(lineNum);
                            
                            return (
                                <div
                                    key={lineNum}
                                    className={`font-mono text-sm leading-6 ${
                                        isHighlighted 
                                            ? 'bg-yellow-900/30 border-l-2 border-yellow-400 pl-2 -ml-2' 
                                            : ''
                                    }`}
                                >
                                    <code className="text-gray-300">
                                        {line || ' '}
                                    </code>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Footer with source info */}
            <div className="bg-gray-800 px-4 py-2 border-t border-gray-600">
                <span className="text-gray-400 text-xs">
                    Source: {directive.source}
                </span>
            </div>
        </div>
    );
}
