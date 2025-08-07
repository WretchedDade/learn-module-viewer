import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Code } from "mdast";

// Custom remark plugin to transform enhanced code blocks
export const remarkEnhancedCodeBlocks: Plugin<[], Root> = () => {
    return (tree) => {
        visit(tree, "code", (node: Code) => {
            // Check if this code block has our metadata comments at the start
            if (node.value) {
                const metadata = extractMetadataFromCode(node.value);
                
                if (metadata.highlight || metadata.filename || metadata.source) {                    
                    // Keep it as a code node but add data that react-markdown can pass through
                    node.data = node.data || {};
                    node.data.hProperties = {
                        ...(node.data.hProperties || {}),
                        'data-enhanced': 'true',
                        'data-highlight': metadata.highlight || '',
                        'data-filename': metadata.filename || '',
                        'data-source': metadata.source || '',
                        'data-code': metadata.cleanCode, // Store the code without metadata comments
                        'data-language': node.lang || ''
                    };
                }
            }
        });
    };
};

// Extract metadata from code content and return clean code
function extractMetadataFromCode(code: string): {
    highlight?: string;
    filename?: string;
    source?: string;
    cleanCode: string;
} {
    const lines = code.split('\n');
    const metadata: any = {};
    let cleanCodeStartIndex = 0;
    
    // Look for metadata comments at the start of the code
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('// @highlight:')) {
            metadata.highlight = line.replace('// @highlight:', '').trim();
            cleanCodeStartIndex = i + 1;
        } else if (line.startsWith('// @filename:')) {
            metadata.filename = line.replace('// @filename:', '').trim();
            cleanCodeStartIndex = i + 1;
        } else if (line.startsWith('// @source:')) {
            metadata.source = line.replace('// @source:', '').trim();
            cleanCodeStartIndex = i + 1;
        } else if (!line.startsWith('//') || line.length === 0) {
            // First non-metadata line found
            break;
        }
    }
    
    // Get clean code without metadata comments
    metadata.cleanCode = lines.slice(cleanCodeStartIndex).join('\n');
    
    return metadata;
}
