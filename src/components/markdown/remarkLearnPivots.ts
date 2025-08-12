import { Plugin } from 'unified';
import { Root, Paragraph, Text, Content } from 'mdast';

// Learn pivot syntax handling.
// We transform sequences of ::: zone pivot="VALUE" ... ::: zone-end blocks into a single pivotGroup node.

interface PivotBlock {
  value: string;
  children: Content[];
}

function isParagraph(node: any): node is Paragraph {
  return node && node.type === 'paragraph';
}

function extractText(node: Paragraph): string {
  return (node.children || [])
    .filter((c: any): c is Text => c.type === 'text')
    .map((c) => c.value)
    .join('');
}

const pivotStartRegex = /^:::\s*zone\s+pivot="([^"]+)"\s*$/i;
const pivotEndRegex = /^:::\s*zone-end\s*$/i;

export const remarkLearnPivots: Plugin<[], Root> = () => {
  return (tree) => {
    const children = (tree as Root).children;
    let i = 0;
    while (i < children.length) {
      const node = children[i];
      if (isParagraph(node)) {
        const text = extractText(node).trim();
        const startMatch = text.match(pivotStartRegex);
        if (startMatch) {
          const groupBlocks: PivotBlock[] = [];
          let cursor = i;
          while (cursor < children.length) {
            const startNode = children[cursor];
            if (!isParagraph(startNode)) break;
            const startText = extractText(startNode).trim();
            const m = startText.match(pivotStartRegex);
            if (!m) break;
            const pivotValue = m[1];
            cursor++; // move past start
            const blockContent: Content[] = [];
            while (cursor < children.length) {
              const maybeEnd = children[cursor];
              if (isParagraph(maybeEnd)) {
                const endText = extractText(maybeEnd).trim();
                if (pivotEndRegex.test(endText)) {
                  cursor++; // consume end marker
                  break;
                }
              }
              blockContent.push(children[cursor] as Content);
              cursor++;
            }
            groupBlocks.push({ value: pivotValue, children: blockContent });
            if (cursor >= children.length) break;
            const nextNode = children[cursor];
            if (!isParagraph(nextNode)) break;
            const nextText = extractText(nextNode).trim();
            if (!pivotStartRegex.test(nextText)) break;
          }
          if (groupBlocks.length) {
            children.splice(i, cursor - i, createPivotGroupNode(groupBlocks));
          }
          i++; // advance past inserted node
          continue;
        }
      }
      i++;
    }
  };
};

function createPivotGroupNode(blocks: PivotBlock[]) {
  const values = blocks.map(b => b.value);
  const setId = values.join('|');
  return {
    type: 'pivotGroup',
    data: {
      hName: 'pivot-group',
      hProperties: {
        'data-pivot-set': setId,
        'data-pivot-values': values.join(',')
      }
    },
    children: blocks.map(b => ({
      type: 'pivotItem',
      data: {
        hName: 'pivot-item',
        hProperties: {
          'data-pivot-value': b.value
        }
      },
      children: b.children
    }))
  } as any;
}

export default remarkLearnPivots;
