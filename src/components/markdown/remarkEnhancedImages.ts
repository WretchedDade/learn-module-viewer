import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

// Remark plugin to process enhanced images with metadata comments
export const remarkEnhancedImages: Plugin = () => {
    return (tree: any) => {
        visit(tree, 'image', (node, index, parent) => {
            // Check if this is an image reference (starts with IMG_REF_)
            if (node.url && node.url.startsWith('IMG_REF_')) {
                // Look for metadata comments after this image
                if (parent && parent.children && typeof index === 'number') {
                    const metadata = extractImageMetadata(parent.children, index + 1);
                    
                    if (metadata.enhanced) {
                        // Mark this as an enhanced image and store metadata
                        node.data = node.data || {};
                        node.data.hProperties = {
                            'data-enhanced': 'true',
                            'data-type': metadata.type || '',
                            'data-source': metadata.source || '',
                            'data-ref': metadata.ref || node.url,
                            'data-alt': node.alt || ''
                        };
                        
                        // Remove the metadata comment nodes
                        const nodesToRemove = metadata._nodesToRemove || [];
                        for (let i = nodesToRemove.length - 1; i >= 0; i--) {
                            parent.children.splice(nodesToRemove[i], 1);
                        }
                    }
                }
            }
        });
    };
};

// Extract metadata from HTML comments following an image
function extractImageMetadata(siblings: any[], startIndex: number) {
    const metadata: Record<string, any> = {};
    const nodesToRemove: number[] = [];
    
    for (let i = startIndex; i < siblings.length; i++) {
        const sibling = siblings[i];
        
        // Check for HTML comment nodes
        if (sibling.type === 'html' && sibling.value && sibling.value.includes('<!-- @')) {
            const match = sibling.value.match(/<!-- @(\w+):\s*([^-]+?) -->/);
            if (match) {
                const [, key, value] = match;
                metadata[key] = value.trim();
                nodesToRemove.push(i);
            }
        }
        // Check for text nodes that might contain comments (fallback)
        else if (sibling.type === 'text' && sibling.value && sibling.value.includes('<!-- @')) {
            // Split by comments and process each one
            const commentMatches = sibling.value.matchAll(/<!-- @(\w+):\s*([^-]+?) -->/g);
            for (const match of commentMatches) {
                const [, key, value] = match;
                metadata[key] = value.trim();
            }
            // If this node only contains comments, mark it for removal
            if (sibling.value.trim().startsWith('<!--') && sibling.value.trim().endsWith('-->')) {
                nodesToRemove.push(i);
            }
        }
        // Stop at non-whitespace, non-comment content
        else if (sibling.type !== 'text' || (sibling.value && sibling.value.trim() && !sibling.value.includes('<!--'))) {
            break;
        }
        // Handle whitespace-only text nodes
        else if (sibling.type === 'text' && sibling.value && !sibling.value.trim()) {
            // Skip whitespace, but don't break
            continue;
        }
    }
    
    metadata._nodesToRemove = nodesToRemove;
    return metadata;
}
